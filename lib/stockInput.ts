import type { Counts, SectionId, StockItem } from "./stock";
import { stockSections } from "./stock";

// Checks what comes from the phone before it reaches the database.

const MAX_AMOUNT = 100000;

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "");

export const cleanStockName = (value: unknown) => text(value, 60);
export const cleanUnit = (value: unknown) => text(value, 20).toLowerCase() || null;
export const isSectionId = (value: unknown): value is SectionId => stockSections.some((s) => s.id === value);

// A target can be cleared (blank) but never negative. undefined means invalid.
export const cleanTarget = (value: unknown): number | null | undefined => {
  if (value === null || value === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 && amount <= MAX_AMOUNT ? Math.round(amount * 100) / 100 : undefined;
};

// Keeps only real items with sensible amounts.
export const cleanCounts = (value: unknown, items: StockItem[]): Counts => {
  const known = new Set(items.map((i) => i.id));
  const counts: Counts = {};
  for (const [id, amount] of Object.entries((value ?? {}) as Record<string, unknown>)) {
    if (known.has(id) && typeof amount === "number" && Number.isFinite(amount) && amount >= 0 && amount <= MAX_AMOUNT) {
      counts[id] = amount;
    }
  }
  return counts;
};

export const newStockId = (section: string, name: string) =>
  `${section}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "item"}-${Math.random().toString(36).slice(2, 6)}`;
