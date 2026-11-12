import { formatPrice, type Item, type Price } from "./menu";

export type Line = { key: string; name: string; amount: number; qty: number };
export type Order = Record<string, Line>;

export const lineKey = (item: Item, price: Price) => (price.label ? `${item.id}:${price.label}` : `${item.id}:${price.amount}`);

export const lineName = (item: Item, price: Price) =>
  price.label ? `${item.name} (${price.label.toLowerCase()})` : item.prices.length > 1 ? `${item.name} ${formatPrice(price.amount)}` : item.name;

export const addLine = (order: Order, item: Item, price: Price): Order => {
  const key = lineKey(item, price);
  const current = order[key];
  return {
    ...order,
    [key]: { key, name: lineName(item, price), amount: price.amount, qty: (current?.qty ?? 0) + 1 },
  };
};

export const changeQty = (order: Order, key: string, delta: number): Order => {
  const line = order[key];
  if (!line) return order;
  const qty = line.qty + delta;
  if (qty <= 0) {
    const { [key]: _removed, ...rest } = order;
    return rest;
  }
  return { ...order, [key]: { ...line, qty } };
};

export const orderLines = (order: Order) => Object.values(order);
export const orderCount = (order: Order) => orderLines(order).reduce((sum, line) => sum + line.qty, 0);
export const orderTotal = (order: Order) => orderLines(order).reduce((sum, line) => sum + line.qty * line.amount, 0);

export type Handover = { mode: "pickup" | "delivery"; name: string; address: string; note: string };

export const whatsappMessage = (order: Order, handover: Handover) => {
  const lines = orderLines(order).map((line) => `${line.qty} × ${line.name} — ${formatPrice(line.qty * line.amount)}`);
  return [
    "Hi Beams, I'd like to order:",
    "",
    ...lines,
    "",
    `Total: ${formatPrice(orderTotal(order))}`,
    handover.mode === "delivery" ? `Delivery to: ${handover.address.trim() || "(address)"}` : "Pickup at the shop",
    handover.name.trim() ? `Name: ${handover.name.trim()}` : "",
    handover.note.trim() ? `Note: ${handover.note.trim()}` : "",
  ]
    .filter((row, i, rows) => row !== "" || rows[i - 1] !== "")
    .join("\n")
    .trim();
};

