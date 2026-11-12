// The stock check rules. Blank means "not counted yet"; 0 means "none left", so the two never mix.

export type SectionId = "beans" | "fresh" | "syrups" | "paper";

export type SeedItem = {
  id: string;
  section: SectionId;
  grp: string | null;
  name: string;
  unit: string | null;
  target: number | null;
  position: number;
};

export type StockItem = SeedItem;

export type Counts = Record<string, number>;

export type BuyLine = { id: string; name: string; unit: string | null; amount: number };
export type BuyGroup = { section: SectionId; title: string; lines: BuyLine[] };

export type CheckSummary = {
  buy: BuyGroup[];
  buyCount: number;
  needTarget: { id: string; name: string; unit: string | null; onHand: number }[];
  notCounted: { id: string; name: string }[];
  okCount: number;
};

export const stockSections: { id: SectionId; title: string }[] = [
  { id: "beans", title: "Coffee beans" },
  { id: "fresh", title: "Fresh products" },
  { id: "syrups", title: "Syrups & sauces" },
  { id: "paper", title: "Paper & plastics" },
];

const round = (value: number) => Math.round(value * 100) / 100;

export const toBuy = (target: number, onHand: number) => round(Math.max(target - onHand, 0));

// Half steps for items counted in small amounts (a target of 1 kg, half a gallon).
export const stepFor = (target: number | null) => (target !== null && target < 2 ? 0.5 : 1);

export const nudge = (current: number | undefined, delta: number) => round(Math.max((current ?? 0) + delta, 0));

export const parseAmount = (text: string) => {
  const value = Number(text.trim().replace(",", "."));
  return text.trim() !== "" && Number.isFinite(value) && value >= 0 ? round(value) : null;
};

export const formatAmount = (amount: number, unit: string | null) => (unit ? `${amount} ${unit}` : String(amount));

// Sorts every item into exactly one place, so nothing silently falls off the list.
export const summarize = (items: StockItem[], counts: Counts): CheckSummary => {
  const summary: CheckSummary = { buy: [], buyCount: 0, needTarget: [], notCounted: [], okCount: 0 };

  for (const section of stockSections) {
    const lines: BuyLine[] = [];
    for (const item of items.filter((i) => i.section === section.id).sort((a, b) => a.position - b.position)) {
      const onHand = counts[item.id];
      if (onHand === undefined) {
        summary.notCounted.push({ id: item.id, name: item.name });
      } else if (item.target === null) {
        summary.needTarget.push({ id: item.id, name: item.name, unit: item.unit, onHand });
      } else if (toBuy(item.target, onHand) > 0) {
        lines.push({ id: item.id, name: item.name, unit: item.unit, amount: toBuy(item.target, onHand) });
      } else {
        summary.okCount += 1;
      }
    }
    if (lines.length > 0) {
      summary.buy.push({ section: section.id, title: section.title, lines });
      summary.buyCount += lines.length;
    }
  }
  return summary;
};

export const shoppingText = (summary: CheckSummary, staff: string, when: Date) => {
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Beirut" }).format(when);
  const rows = [`Beams shopping list, ${date} (${staff})`];

  if (summary.buy.length === 0) rows.push("", "Nothing to buy.");
  for (const group of summary.buy) {
    rows.push("", group.title.toUpperCase());
    for (const line of group.lines) rows.push(`- ${line.name}: ${formatAmount(line.amount, line.unit)}`);
  }
  if (summary.needTarget.length > 0) {
    rows.push("", "NO TARGET SET (check these)");
    for (const item of summary.needTarget) rows.push(`- ${item.name}: ${formatAmount(item.onHand, item.unit)} left`);
  }
  if (summary.notCounted.length > 0) rows.push("", `Not counted: ${summary.notCounted.length} items`);
  return rows.join("\n");
};
