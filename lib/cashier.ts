// Event cashier: prices from Beams' printed menu (Nov 2026). Money is kept in cents so 3 x $3.33 is exactly $9.99.

export type Product = { id: string; name: string; cents: number; cat: string };
export type Cart = Record<string, number>;
// "later" is an order made now and paid afterwards; it becomes cash or other once paid.
export type Method = "cash" | "other" | "later";
export type SaleLine = { id: string; name: string; qty: number; cents: number };
export type Sale = {
  no: number;
  at: string;
  lines: SaleLine[];
  total: number;
  method: Method;
  change?: number;
  void?: boolean;
  name?: string;
  paidAt?: string;
};

export const methodLabel = (method: Method) => (method === "cash" ? "Cash" : method === "other" ? "Card / Whish" : "Not paid yet");

const item = (cat: string, name: string, dollars: number): Product => ({
  id: `${cat}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  cents: Math.round(dollars * 100),
  cat,
});

export const eventCategories = ["Hot", "Cold", "Frappe", "Food", "Dessert", "Extras"] as const;

export const eventMenu: Product[] = [
  item("Hot", "Espresso", 2),
  item("Hot", "Americano", 3.33),
  item("Hot", "Latte", 5),
  item("Hot", "Flat white", 4.5),
  item("Hot", "Mocha", 5),
  item("Hot", "Cappuccino", 4.5),
  item("Hot", "Spanish latte", 5.55),
  item("Hot", "Caramel macchiato", 5),
  item("Cold", "Iced americano", 3.33),
  item("Cold", "Iced latte", 5),
  item("Cold", "Iced Spanish latte", 5.55),
  item("Cold", "Iced caramel macchiato", 5.55),
  item("Cold", "Iced tea", 4),
  item("Cold", "Cold brew", 6),
  item("Frappe", "Caramel frappe", 5.55),
  item("Frappe", "Mocha frappe", 5.55),
  item("Frappe", "Toffee coffee frappe", 5.55),
  item("Food", "Turkey & cheese", 6),
  item("Food", "Halloumi pesto", 6),
  item("Food", "Chicken Caesar", 6),
  item("Food", "Tuna pasta salad", 7),
  item("Food", "Chicken Caesar salad", 7),
  item("Food", "Seasonal salad", 7),
  item("Dessert", "Cookies", 4),
  item("Dessert", "Brownies", 4.5),
  item("Dessert", "Cheesecake", 4.5),
  item("Extras", "Extra shot", 1),
  item("Extras", "Flavored syrup", 0.5),
  item("Extras", "Non-dairy milk", 1),
  item("Extras", "Still water", 0.55),
];

export const formatUsd = (cents: number) => `${cents < 0 ? "-" : ""}$${(Math.abs(cents) / 100).toFixed(2)}`;

// Lebanese pounds, rounded to the nearest 1,000 like at the till.
export const toLbp = (cents: number, rate: number) => Math.round((cents / 100) * rate / 1000) * 1000;
export const formatLbp = (amount: number) => `${amount.toLocaleString("en-US")} LBP`;

export const cartLines = (cart: Cart, menu: Product[]): SaleLine[] =>
  menu.filter((p) => (cart[p.id] ?? 0) > 0).map((p) => ({ id: p.id, name: p.name, qty: cart[p.id], cents: p.cents }));

export const linesTotal = (lines: SaleLine[]) => lines.reduce((sum, l) => sum + l.qty * l.cents, 0);

// What the customer handed over, in both currencies, against the total. Negative means still short.
export const changeDue = (total: number, paidUsd: number, paidLbp: number, rate: number) =>
  Math.round(paidUsd * 100 + (rate > 0 ? (paidLbp / rate) * 100 : 0)) - total;

export const summarize = (sales: Sale[]) => {
  const kept = sales.filter((s) => !s.void);
  const items = new Map<string, { name: string; qty: number; total: number }>();
  for (const sale of kept) {
    for (const line of sale.lines) {
      const row = items.get(line.id) ?? { name: line.name, qty: 0, total: 0 };
      row.qty += line.qty;
      row.total += line.qty * line.cents;
      items.set(line.id, row);
    }
  }
  const sum = (list: Sale[]) => list.reduce((total, s) => total + s.total, 0);
  const unpaid = kept.filter((s) => s.method === "later");
  // Total is money actually taken; orders still owed are counted apart.
  return {
    orders: kept.length,
    total: sum(kept.filter((s) => s.method !== "later")),
    cash: sum(kept.filter((s) => s.method === "cash")),
    other: sum(kept.filter((s) => s.method === "other")),
    unpaid: sum(unpaid),
    unpaidOrders: unpaid,
    voided: sales.length - kept.length,
    items: [...items.values()].sort((a, b) => b.qty - a.qty || b.total - a.total),
  };
};

export const summaryText = (sales: Sale[]) => {
  const s = summarize(sales);
  const rows = [
    "Beams event sales",
    "",
    `Orders: ${s.orders}`,
    `Total: ${formatUsd(s.total)}`,
    `Cash: ${formatUsd(s.cash)}`,
    `Card / Whish: ${formatUsd(s.other)}`,
  ];
  if (s.unpaidOrders.length) {
    rows.push(`Not paid yet: ${formatUsd(s.unpaid)}`);
    rows.push(...s.unpaidOrders.map((o) => `- #${o.no}${o.name ? ` ${o.name}` : ""}: ${formatUsd(o.total)}`));
  }
  if (s.voided) rows.push(`Cancelled orders: ${s.voided}`);
  if (s.items.length) rows.push("", ...s.items.map((i) => `${i.qty} x ${i.name} = ${formatUsd(i.total)}`));
  return rows.join("\n");
};
