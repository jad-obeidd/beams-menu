import type { Price } from "./menu";
import { sectionMetas } from "./menu";

// Checks what a barista typed before it reaches the database.

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "");

export const cleanName = (value: unknown) => clean(value, 60);
export const cleanDescription = (value: unknown) => clean(value, 140) || null;

export const cleanPrices = (value: unknown): Price[] | null => {
  if (!Array.isArray(value) || value.length < 1 || value.length > 4) return null;
  const prices: Price[] = [];
  for (const entry of value) {
    const amount = Number((entry as Price)?.amount);
    if (!Number.isFinite(amount) || amount < 0 || amount > 1000) return null;
    const label = clean((entry as Price)?.label, 20);
    prices.push(label ? { label, amount: Math.round(amount * 100) / 100 } : { amount: Math.round(amount * 100) / 100 });
  }
  return prices;
};

export const isSection = (value: unknown): value is string => sectionMetas.some((s) => s.id === value);

export const newItemId = (name: string) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "item"}-${Math.random().toString(36).slice(2, 6)}`;
