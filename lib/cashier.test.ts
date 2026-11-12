import { describe, expect, it } from "vitest";
import { cartLines, changeDue, eventMenu, formatUsd, linesTotal, summarize, summaryText, toLbp, type Sale } from "./cashier";

const latte = eventMenu.find((p) => p.name === "Latte")!;
const americano = eventMenu.find((p) => p.name === "Americano")!;

describe("the event menu", () => {
  it("has every item from the printed menu with unique ids", () => {
    expect(eventMenu).toHaveLength(30);
    expect(new Set(eventMenu.map((p) => p.id)).size).toBe(30);
  });

  it("keeps the printed prices", () => {
    expect(latte.cents).toBe(500);
    expect(americano.cents).toBe(333);
    expect(eventMenu.find((p) => p.name === "Still water")?.cents).toBe(55);
  });
});

describe("totals", () => {
  it("adds without rounding noise", () => {
    const lines = cartLines({ [americano.id]: 3 }, eventMenu);
    expect(linesTotal(lines)).toBe(999);
    expect(formatUsd(999)).toBe("$9.99");
  });

  it("only lists what is in the cart, in menu order", () => {
    const lines = cartLines({ [latte.id]: 1, [americano.id]: 2, nothing: 4 }, eventMenu);
    expect(lines.map((l) => l.name)).toEqual(["Americano", "Latte"]);
  });
});

describe("paying", () => {
  it("gives change in dollars", () => {
    expect(changeDue(999, 20, 0, 89500)).toBe(1001);
  });

  it("counts Lebanese pounds at the rate", () => {
    expect(changeDue(1000, 5, 447500, 89500)).toBe(0);
  });

  it("shows what is still missing as negative", () => {
    expect(changeDue(1000, 5, 0, 89500)).toBe(-500);
  });

  it("rounds pounds to the nearest thousand", () => {
    expect(toLbp(555, 89500)).toBe(497000);
  });
});

describe("end of the day", () => {
  const sales: Sale[] = [
    { no: 1, at: "", method: "cash", total: 1000, lines: [{ id: latte.id, name: "Latte", qty: 2, cents: 500 }] },
    { no: 2, at: "", method: "other", total: 333, lines: [{ id: americano.id, name: "Americano", qty: 1, cents: 333 }] },
    { no: 3, at: "", method: "cash", total: 500, void: true, lines: [{ id: latte.id, name: "Latte", qty: 1, cents: 500 }] },
  ];

  it("leaves cancelled orders out of the money", () => {
    const s = summarize(sales);
    expect(s).toMatchObject({ orders: 2, total: 1333, cash: 1000, other: 333, voided: 1 });
    expect(s.items[0]).toEqual({ name: "Latte", qty: 2, total: 1000 });
  });

  it("keeps orders paid later out of the money until they are paid", () => {
    const later: Sale = { no: 4, at: "", method: "later", name: "Rami", total: 600, lines: [] };
    const s = summarize([...sales, later]);
    expect(s).toMatchObject({ orders: 3, total: 1333, unpaid: 600 });
    expect(summaryText([...sales, later])).toContain("Not paid yet: $6.00\n- #4 Rami: $6.00");
    expect(summarize([...sales, { ...later, method: "cash" }])).toMatchObject({ total: 1933, cash: 1600, unpaid: 0 });
  });

  it("writes a summary ready for WhatsApp", () => {
    expect(summaryText(sales)).toContain("Total: $13.33\nCash: $10.00\nCard / Whish: $3.33\nCancelled orders: 1");
  });
});
