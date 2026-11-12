import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/auth";
import { finishCheck, listStockItems, saveOpenCheck } from "@/lib/db";
import { shoppingText, summarize } from "@/lib/stock";
import { cleanCounts } from "@/lib/stockInput";

export async function POST(request: Request) {
  const staff = await currentStaff();
  if (!staff) return NextResponse.json({ error: "Log in again" }, { status: 401 });

  const items = await listStockItems();
  const { counts: raw } = (await request.json()) as { counts?: unknown };
  const counts = cleanCounts(raw, items);
  if (Object.keys(counts).length === 0) {
    return NextResponse.json({ error: "Count at least one item first." }, { status: 400 });
  }

  // The list is worked out here, from the current targets, not on the phone.
  const summary = summarize(items, counts);
  const text = shoppingText(summary, staff.name, new Date());
  const check = await saveOpenCheck(counts, staff.name);
  await finishCheck(check.id, summary, text, staff.name);
  return NextResponse.json({ summary, text });
}
