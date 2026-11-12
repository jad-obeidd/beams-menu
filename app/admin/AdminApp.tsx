"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuRow } from "@/lib/db";
import { formatPrice, type Price } from "@/lib/menu";
import { StaffLogin } from "./StaffLogin";

type SectionInfo = { id: string; title: string };
type Toast = { text: string; bad?: boolean } | null;

const send = (url: string, method: string, body?: object) =>
  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

const priceSummary = (prices: Price[]) =>
  prices.map((p) => (p.label ? `${p.label} ${formatPrice(p.amount)}` : formatPrice(p.amount))).join(" · ");

// Name, description and one or more prices (e.g. Single / Double).
const ItemForm = ({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: { name: string; description: string; prices: Price[] };
  submitLabel: string;
  onSubmit: (values: { name: string; description: string; prices: Price[] }) => Promise<boolean>;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [prices, setPrices] = useState<{ label: string; amount: string }[]>(
    initial.prices.map((p) => ({ label: p.label ?? "", amount: p.amount ? String(p.amount) : "" })),
  );
  const [busy, setBusy] = useState(false);

  const setPrice = (i: number, patch: Partial<{ label: string; amount: string }>) =>
    setPrices(prices.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const ok = await onSubmit({
      name,
      description,
      prices: prices.map((p) => (p.label.trim() ? { label: p.label.trim(), amount: Number(p.amount) } : { amount: Number(p.amount) })),
    });
    setBusy(false);
    if (ok) onCancel();
  };

  return (
    <form className="item-form" onSubmit={submit}>
      <label>
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
      </label>
      <label>
        <span>Description (optional)</span>
        <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={140} />
      </label>
      <div className="price-rows">
        <span>Price{prices.length > 1 ? "s" : ""} in $</span>
        {prices.map((price, i) => (
          <div key={i} className="price-row">
            {prices.length > 1 && (
              <input
                value={price.label}
                onChange={(e) => setPrice(i, { label: e.target.value })}
                placeholder="Size, e.g. Single"
                maxLength={20}
              />
            )}
            <input
              value={price.amount}
              onChange={(e) => setPrice(i, { amount: e.target.value.replace(/[^0-9.]/g, "") })}
              inputMode="decimal"
              placeholder="4.50"
              required
            />
            {prices.length > 1 && (
              <button type="button" className="admin-link" onClick={() => setPrices(prices.filter((_, j) => j !== i))}>
                Remove size
              </button>
            )}
          </div>
        ))}
        {prices.length < 4 && (
          <button
            type="button"
            className="admin-link"
            onClick={() => setPrices([...prices, { label: "", amount: "" }].map((p, i) => (i === 0 && !p.label ? { ...p, label: "Regular" } : p)))}
          >
            + Add a size
          </button>
        )}
      </div>
      <div className="form-actions">
        <button className="admin-btn" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </button>
        <button type="button" className="admin-btn ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

type Status = "on" | "off" | "hidden";

const statusOf = (row: MenuRow): Status => (row.hidden ? "hidden" : row.available ? "on" : "off");

const statusOptions: { value: Status; label: string }[] = [
  { value: "on", label: "On menu" },
  { value: "off", label: "Not available" },
  { value: "hidden", label: "Hidden" },
];

const Row = ({
  row,
  onStatus,
  onSave,
  onRemove,
}: {
  row: MenuRow;
  onStatus: (status: Status) => void;
  onSave: (values: { name: string; description: string; prices: Price[] }) => Promise<boolean>;
  onRemove: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const status = statusOf(row);
  return (
    <li className={`admin-row status-${status}`}>
      <div className="admin-row-line">
        <div className="admin-row-text">
          <b>{row.name}</b>
          <small>
            {priceSummary(row.prices)}
            {status === "off" && <em> · Not available now</em>}
            {status === "hidden" && <em className="hidden-note"> · Hidden from customers</em>}
          </small>
        </div>
        <div className="admin-row-actions">
          <button className="admin-link" onClick={() => setEditing(!editing)}>
            {editing ? "Close" : "Edit"}
          </button>
          <button className="admin-link danger" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
      <div className="status-pick" role="radiogroup" aria-label={`${row.name} on the menu`}>
        {statusOptions.map((option) => (
          <button
            key={option.value}
            role="radio"
            aria-checked={status === option.value}
            className={`status-${option.value}${status === option.value ? " picked" : ""}`}
            onClick={() => status !== option.value && onStatus(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {editing && (
        <ItemForm
          initial={{ name: row.name, description: row.description ?? "", prices: row.prices }}
          submitLabel="Save changes"
          onSubmit={onSave}
          onCancel={() => setEditing(false)}
        />
      )}
    </li>
  );
};

export const AdminApp = ({
  staffName: initialStaff,
  initialRows,
  sections,
}: {
  staffName: string | null;
  initialRows: MenuRow[];
  sections: SectionInfo[];
}) => {
  const [staffName, setStaffName] = useState(initialStaff);
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "off" | "hidden">("all");
  const [adding, setAdding] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const handle = async (res: Response) => {
    const data = await res.json();
    if (res.status === 401) setStaffName(null);
    if (!res.ok) setToast({ text: data.error ?? "Something went wrong", bad: true });
    return res.ok ? data : null;
  };

  const login = async (name: string) => {
    setStaffName(name);
    const data = await handle(await fetch("/api/admin/items", { cache: "no-store" }));
    if (data) setRows(data);
  };

  const logout = async () => {
    await send("/api/admin/logout", "POST");
    setStaffName(null);
  };

  const replaceRow = (saved: MenuRow) => setRows((current) => current.map((r) => (r.id === saved.id ? saved : r)));

  // Change right away on screen, then save; change back if saving fails.
  const setStatus = async (row: MenuRow, status: Status) => {
    const patch = { available: status !== "off", hidden: status === "hidden" };
    replaceRow({ ...row, ...patch });
    const saved = await handle(await send(`/api/admin/items/${row.id}`, "PATCH", patch));
    if (!saved) return replaceRow(row);
    replaceRow(saved);
    const messages: Record<Status, string> = {
      on: `${saved.name} is on the menu`,
      off: `${saved.name} shows as not available`,
      hidden: `${saved.name} is hidden from customers`,
    };
    setToast({ text: messages[status] });
  };

  const save = async (row: MenuRow, values: { name: string; description: string; prices: Price[] }) => {
    const saved = await handle(await send(`/api/admin/items/${row.id}`, "PATCH", values));
    if (!saved) return false;
    replaceRow(saved);
    setToast({ text: `${saved.name} saved` });
    return true;
  };

  const remove = async (row: MenuRow) => {
    if (!window.confirm(`Remove ${row.name} from the menu?`)) return;
    const ok = await handle(await send(`/api/admin/items/${row.id}`, "DELETE"));
    if (!ok) return;
    setRows((current) => current.filter((r) => r.id !== row.id));
    setToast({ text: `${row.name} removed` });
  };

  const add = async (sectionId: string, values: { name: string; description: string; prices: Price[] }) => {
    const saved = await handle(await send("/api/admin/items", "POST", { sectionId, ...values }));
    if (!saved) return false;
    setRows((current) => [...current, saved]);
    setToast({ text: `${saved.name} added` });
    return true;
  };

  const offCount = rows.filter((r) => statusOf(r) === "off").length;
  const hiddenCount = rows.filter((r) => statusOf(r) === "hidden").length;
  const visible = useMemo(
    () =>
      rows.filter(
        (r) =>
          (filter === "all" || statusOf(r) === filter) &&
          (!query.trim() || r.name.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [rows, filter, query],
  );

  if (!staffName) {
    return (
      <main className="admin">
        <StaffLogin title="Menu dashboard" button="Open dashboard" onDone={login} />
      </main>
    );
  }

  return (
    <main className="admin">
      <header className="admin-head">
        <div>
          <span className="admin-mark">BEAMS</span>
          <h1>Menu dashboard</h1>
        </div>
        <div className="admin-head-actions">
          <span>Hi, {staffName}</span>
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn ghost small">
            View menu
          </a>
          <a className="admin-btn ghost small" href="/stock">
            Stock check
          </a>
          <button className="admin-btn ghost small" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <div className="admin-tools">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find an item…" type="search" />
        <button
          className={`admin-filter${filter === "off" ? " on" : ""}`}
          onClick={() => setFilter(filter === "off" ? "all" : "off")}
        >
          Not available · {offCount}
        </button>
        <button
          className={`admin-filter hidden-filter${filter === "hidden" ? " on" : ""}`}
          onClick={() => setFilter(filter === "hidden" ? "all" : "hidden")}
        >
          Hidden · {hiddenCount}
        </button>
      </div>
      <p className="admin-hint">
        <b>Not available</b> keeps the item on the menu in orange, so customers know it&apos;s coming back.{" "}
        <b>Hidden</b> takes it off the menu completely; it stays saved here until you put it back.
      </p>

      {sections.map((section) => {
        const items = visible.filter((r) => r.section_id === section.id).sort((a, b) => a.position - b.position);
        if (items.length === 0 && (query.trim() || filter !== "all")) return null;
        return (
          <section key={section.id} className="admin-section">
            <h2>
              {section.title} <small>{items.length}</small>
            </h2>
            <ul>
              {items.map((row) => (
                <Row
                  key={row.id}
                  row={row}
                  onStatus={(status) => setStatus(row, status)}
                  onSave={(values) => save(row, values)}
                  onRemove={() => remove(row)}
                />
              ))}
            </ul>
            {adding === section.id ? (
              <ItemForm
                initial={{ name: "", description: "", prices: [{ amount: 0 }] }}
                submitLabel={`Add to ${section.title}`}
                onSubmit={(values) => add(section.id, values)}
                onCancel={() => setAdding(null)}
              />
            ) : (
              <button className="admin-add" onClick={() => setAdding(section.id)}>
                + Add an item to {section.title}
              </button>
            )}
          </section>
        );
      })}

      {toast && <div className={`admin-toast${toast.bad ? " bad" : ""}`}>{toast.text}</div>}
    </main>
  );
};
