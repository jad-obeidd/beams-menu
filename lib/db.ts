import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { defaultSections, sectionMetas, type Item, type Price, type Section } from "./menu";
import type { CheckSummary, Counts, StockItem } from "./stock";
import { stockSeed } from "./stockSeed";

// Menu items live in the "beams" Supabase project (table menu_items). Without Supabase settings,
// local development uses data/*.json instead.

export type MenuRow = {
  id: string;
  section_id: string;
  name: string;
  prices: Price[];
  description: string | null;
  note: string | null;
  available: boolean;
  hidden: boolean;
  position: number;
  updated_by: string | null;
  updated_at: string;
};

export type StaffRow = {
  id: string;
  name: string;
  name_key: string;
  pin_hash: string;
  active: boolean;
  version: string;
};

const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const useSupabase = Boolean(supabaseUrl && supabaseKey);

// Legacy service_role keys are JWTs and also go in Authorization; sb_secret_ keys only in apikey.
const authHeader: Record<string, string> =
  supabaseKey?.startsWith("eyJ") ? { Authorization: `Bearer ${supabaseKey}` } : {};

const rest = async <T,>(pathAndQuery: string, init: RequestInit = {}) => {
  const res = await fetch(`${supabaseUrl}/rest/v1/${pathAndQuery}`, {
    ...init,
    headers: {
      apikey: supabaseKey!,
      ...authHeader,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
};

const localFile = (name: string) => path.join(process.cwd(), "data", `${name}.json`);

const readJson = async <T,>(name: string, empty: T): Promise<T> => {
  if (process.env.VERCEL) throw new Error("Supabase isn't set up: add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel");
  try {
    return JSON.parse(await fs.readFile(localFile(name), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return empty;
    throw error;
  }
};

const writeJson = async (name: string, data: unknown) => {
  await fs.mkdir(path.dirname(localFile(name)), { recursive: true });
  await fs.writeFile(localFile(name), JSON.stringify(data, null, 2));
};

const seedRows = (): MenuRow[] =>
  defaultSections.flatMap((section) =>
    section.items.map((item, i) => ({
      id: item.id,
      section_id: section.id,
      name: item.name,
      prices: item.prices,
      description: item.description ?? null,
      note: item.note ?? null,
      available: true,
      hidden: false,
      position: (i + 1) * 10,
      updated_by: null,
      updated_at: new Date().toISOString(),
    })),
  );

// All menu rows, in order. The first time, the table is filled with the printed menu.
export const listMenuRows = async (): Promise<MenuRow[]> => {
  if (!useSupabase) {
    const rows = await readJson<MenuRow[] | null>("menu", null);
    if (rows) return rows;
    const seeded = seedRows();
    await writeJson("menu", seeded);
    return seeded;
  }
  const rows = await rest<MenuRow[]>("menu_items?order=section_id.asc,position.asc");
  if (rows.length > 0) return rows;
  await rest("menu_items", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify(seedRows()),
  });
  return rest<MenuRow[]>("menu_items?order=section_id.asc,position.asc");
};

const toItem = (row: MenuRow): Item => ({
  id: row.id,
  name: row.name,
  prices: row.prices,
  description: row.description ?? undefined,
  note: row.note ?? undefined,
  available: row.available,
});

// The menu as customers see it: sections in printed order, hidden items and empty sections left out.
export const loadMenu = async (): Promise<Section[]> => {
  try {
    const rows = await listMenuRows();
    return sectionMetas
      .map((meta) => ({
        ...meta,
        items: rows
          .filter((row) => row.section_id === meta.id && !row.hidden)
          .sort((a, b) => a.position - b.position)
          .map(toItem),
      }))
      .filter((section) => section.items.length > 0);
  } catch (error) {
    // The menu must never be blank: fall back to the printed menu if the database is unreachable.
    console.error("Menu database unavailable, showing the printed menu", error);
    return defaultSections;
  }
};

export const insertMenuRow = async (row: MenuRow) => {
  if (!useSupabase) {
    const rows = await listMenuRows();
    await writeJson("menu", [...rows, row]);
    return row;
  }
  const [saved] = await rest<MenuRow[]>("menu_items", { method: "POST", body: JSON.stringify(row) });
  return saved;
};

export const updateMenuRow = async (id: string, patch: Partial<MenuRow>) => {
  if (!useSupabase) {
    const rows = await listMenuRows();
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) return null;
    rows[index] = { ...rows[index], ...patch };
    await writeJson("menu", rows);
    return rows[index];
  }
  const [saved] = await rest<MenuRow[]>(`menu_items?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return saved ?? null;
};

export const deleteMenuRow = async (id: string) => {
  if (!useSupabase) {
    const rows = await listMenuRows();
    await writeJson("menu", rows.filter((r) => r.id !== id));
    return;
  }
  await rest(`menu_items?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
};

// Barista accounts are shared with the loyalty card (table staff_members, managed on its /owner page).
export const findStaff = async (column: "id" | "name_key", value: string): Promise<StaffRow | null> => {
  if (!useSupabase) {
    const staff = await readJson<StaffRow[]>("staff", []);
    return staff.find((s) => s[column] === value) ?? null;
  }
  const rows = await rest<StaffRow[]>(`staff_members?${column}=eq.${encodeURIComponent(value)}`);
  return rows[0] ?? null;
};

const localHits = new Map<string, { hits: number; resetAt: number }>();

export const hitRateLimit = async (key: string, limit: number, windowSeconds: number) => {
  if (!useSupabase) {
    const now = Date.now();
    const entry = localHits.get(key);
    const next = !entry || entry.resetAt < now ? { hits: 1, resetAt: now + windowSeconds * 1000 } : { ...entry, hits: entry.hits + 1 };
    localHits.set(key, next);
    return next.hits <= limit;
  }
  return rest<boolean>("rpc/hit_rate_limit", {
    method: "POST",
    body: JSON.stringify({ p_key: key, p_limit: limit, p_window_seconds: windowSeconds }),
  });
};

export const clearRateLimit = async (key: string) => {
  if (!useSupabase) return void localHits.delete(key);
  await rest(`rate_limits?key=eq.${encodeURIComponent(key)}`, { method: "DELETE" });
};

// Stock check. The list lives in stock_items; each count is a row in stock_checks.

export type StockCheck = {
  id: string;
  status: "open" | "done";
  counts: Counts;
  summary: CheckSummary | null;
  shopping_text: string | null;
  started_by: string;
  finished_by: string | null;
  started_at: string;
  finished_at: string | null;
};

const readLocalChecks = () => readJson<StockCheck[]>("stock-checks", []);

const STOCK_COLUMNS = "id,section,grp,name,unit,target,position";

export const listStockItems = async (): Promise<StockItem[]> => {
  if (!useSupabase) {
    const rows = await readJson<StockItem[] | null>("stock-items", null);
    if (rows) return rows;
    await writeJson("stock-items", stockSeed);
    return stockSeed;
  }
  const query = `stock_items?select=${STOCK_COLUMNS}&order=position.asc`;
  const rows = await rest<StockItem[]>(query);
  if (rows.length > 0) return rows;
  await rest("stock_items", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify(stockSeed),
  });
  return rest<StockItem[]>(query);
};

export const insertStockItem = async (item: StockItem, by: string) => {
  if (!useSupabase) {
    await writeJson("stock-items", [...(await listStockItems()), item]);
    return item;
  }
  await rest("stock_items", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ ...item, updated_by: by }),
  });
  return item;
};

export const updateStockItem = async (id: string, patch: Partial<StockItem>, by: string) => {
  if (!useSupabase) {
    const rows = await listStockItems();
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) return null;
    rows[index] = { ...rows[index], ...patch };
    await writeJson("stock-items", rows);
    return rows[index];
  }
  const rows = await rest<StockItem[]>(`stock_items?id=eq.${encodeURIComponent(id)}&select=${STOCK_COLUMNS}`, {
    method: "PATCH",
    body: JSON.stringify({ ...patch, updated_by: by, updated_at: new Date().toISOString() }),
  });
  return rows[0] ?? null;
};

export const deleteStockItem = async (id: string) => {
  if (!useSupabase) {
    await writeJson("stock-items", (await listStockItems()).filter((r) => r.id !== id));
    return;
  }
  await rest(`stock_items?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
};

export const getOpenCheck = async (): Promise<StockCheck | null> => {
  if (!useSupabase) return (await readLocalChecks()).find((c) => c.status === "open") ?? null;
  const rows = await rest<StockCheck[]>("stock_checks?status=eq.open&limit=1");
  return rows[0] ?? null;
};

export const saveOpenCheck = async (counts: Counts, staff: string): Promise<StockCheck> => {
  const open = await getOpenCheck();
  if (!useSupabase) {
    const checks = await readLocalChecks();
    const check: StockCheck = open
      ? { ...open, counts }
      : {
          id: crypto.randomUUID(),
          status: "open",
          counts,
          summary: null,
          shopping_text: null,
          started_by: staff,
          finished_by: null,
          started_at: new Date().toISOString(),
          finished_at: null,
        };
    await writeJson("stock-checks", [check, ...checks.filter((c) => c.id !== check.id)]);
    return check;
  }
  if (open) {
    const rows = await rest<StockCheck[]>(`stock_checks?id=eq.${encodeURIComponent(open.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ counts }),
    });
    return rows[0];
  }
  const [created] = await rest<StockCheck[]>("stock_checks", {
    method: "POST",
    body: JSON.stringify({ id: crypto.randomUUID(), status: "open", counts, started_by: staff }),
  });
  return created;
};

export const finishCheck = async (id: string, summary: CheckSummary, text: string, staff: string) => {
  const patch = {
    status: "done" as const,
    summary,
    shopping_text: text,
    finished_by: staff,
    finished_at: new Date().toISOString(),
  };
  if (!useSupabase) {
    const checks = await readLocalChecks();
    await writeJson("stock-checks", checks.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    return;
  }
  await rest(`stock_checks?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
};

export const discardOpenCheck = async () => {
  if (!useSupabase) {
    await writeJson("stock-checks", (await readLocalChecks()).filter((c) => c.status !== "open"));
    return;
  }
  await rest("stock_checks?status=eq.open", { method: "DELETE", headers: { Prefer: "return=minimal" } });
};

export const listFinishedChecks = async (limit: number): Promise<StockCheck[]> => {
  if (!useSupabase) {
    return (await readLocalChecks())
      .filter((c) => c.status === "done")
      .sort((a, b) => (b.finished_at ?? "").localeCompare(a.finished_at ?? ""))
      .slice(0, limit);
  }
  return rest<StockCheck[]>(`stock_checks?status=eq.done&order=finished_at.desc&limit=${limit}`);
};
