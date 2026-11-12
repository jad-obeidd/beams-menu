import { describe, expect, it } from "vitest";
import { nudge, parseAmount, shoppingText, stepFor, summarize, toBuy, type StockItem } from "./stock";
import { stockSeed } from "./stockSeed";

const item = (over: Partial<StockItem>): StockItem => ({
  id: "x",
  section: "beans",
  grp: null,
  name: "Item",
  unit: "kg",
  target: 5,
  position: 10,
  ...over,
});

describe("toBuy", () => {
  it("buys the gap up to the target", () => {
    expect(toBuy(5, 2)).toBe(3);
  });

  it("never goes below zero when there is extra", () => {
    expect(toBuy(5, 9)).toBe(0);
  });

  it("handles half units without rounding noise", () => {
    expect(toBuy(0.5, 0.2)).toBe(0.3);
  });
});

describe("summarize", () => {
  const items = [
    item({ id: "short", name: "Uganda", target: 5 }),
    item({ id: "enough", name: "Peru", target: 1 }),
    item({ id: "none-left", name: "Ice", section: "fresh", target: 60 }),
    item({ id: "no-target", name: "Oat Alpro", section: "fresh", target: null }),
    item({ id: "skipped", name: "Gloves", section: "paper", target: 4 }),
  ];

  const summary = summarize(items, { short: 2, enough: 1, "none-left": 0, "no-target": 3 });

  it("lists only what is short, in section order", () => {
    expect(summary.buy.map((g) => g.section)).toEqual(["beans", "fresh"]);
    expect(summary.buy[0].lines).toEqual([{ id: "short", name: "Uganda", unit: "kg", amount: 3 }]);
    expect(summary.buyCount).toBe(2);
  });

  it("treats 0 as none left, not as uncounted", () => {
    expect(summary.buy[1].lines[0]).toMatchObject({ name: "Ice", amount: 60 });
  });

  it("keeps items with no target visible instead of dropping them", () => {
    expect(summary.needTarget).toEqual([{ id: "no-target", name: "Oat Alpro", unit: "kg", onHand: 3 }]);
  });

  it("reports what was not counted", () => {
    expect(summary.notCounted.map((i) => i.name)).toEqual(["Gloves"]);
    expect(summary.okCount).toBe(1);
  });

  it("accounts for every item exactly once", () => {
    const total = summary.buyCount + summary.okCount + summary.needTarget.length + summary.notCounted.length;
    expect(total).toBe(items.length);
  });
});

describe("shoppingText", () => {
  it("writes a list ready for WhatsApp", () => {
    const text = shoppingText(
      summarize([item({ id: "a", name: "Uganda" })], { a: 2 }),
      "Rami",
      new Date("2026-11-03T08:00:00Z"),
    );
    expect(text).toBe("Beams shopping list, 3 Nov (Rami)\n\nCOFFEE BEANS\n- Uganda: 3 kg");
  });

  it("says so when nothing is short", () => {
    const text = shoppingText(summarize([item({ id: "a" })], { a: 9 }), "Rami", new Date("2026-11-03T08:00:00Z"));
    expect(text).toContain("Nothing to buy.");
  });
});

describe("counting controls", () => {
  it("uses half steps for small targets", () => {
    expect(stepFor(0.5)).toBe(0.5);
    expect(stepFor(1)).toBe(0.5);
    expect(stepFor(6)).toBe(1);
    expect(stepFor(null)).toBe(1);
  });

  it("starts a blank count from zero and stops at zero", () => {
    expect(nudge(undefined, 1)).toBe(1);
    expect(nudge(undefined, -1)).toBe(0);
    expect(nudge(0.5, -1)).toBe(0);
  });

  it("reads typed amounts, including a comma", () => {
    expect(parseAmount("2,5")).toBe(2.5);
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("abc")).toBeNull();
    expect(parseAmount("-1")).toBeNull();
  });
});

describe("the list from the Excel file", () => {
  it("has all 84 items with unique ids", () => {
    expect(stockSeed).toHaveLength(84);
    expect(new Set(stockSeed.map((i) => i.id)).size).toBe(84);
  });

  it("gives every item a target above zero", () => {
    expect(stockSeed.every((i) => i.target !== null && i.target > 0)).toBe(true);
  });

  it("gives the milks a target of 6", () => {
    const milks = stockSeed.filter((i) => /Candia|Nadek|Alpro/.test(i.name));
    expect(milks).toHaveLength(7);
    expect(milks.every((i) => i.target === 6)).toBe(true);
  });

  it("gives every syrup a target of 6", () => {
    const syrups = stockSeed.filter((i) => i.grp === "Syrups");
    expect(syrups).toHaveLength(14);
    expect(syrups.every((i) => i.target === 6 && i.unit === "packs")).toBe(true);
  });

  it("keeps half-unit targets from the file", () => {
    expect(stockSeed.find((i) => i.name === "Cup holder")?.target).toBe(0.5);
  });
});
