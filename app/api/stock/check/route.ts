import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/auth";
import { discardOpenCheck, listStockItems, saveOpenCheck } from "@/lib/db";
import { cleanCounts } from "@/lib/stockInput";

// Saves the count in progress, so a closed phone does not lose it.
export async function PUT(request: Request) {
  const staff = await currentStaff();
  if (!staff) return NextResponse.json({ error: "Log in again" }, { status: 401 });
  const { counts } = (await request.json()) as { counts?: unknown };
  await saveOpenCheck(cleanCounts(counts, await listStockItems()), staff.name);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  if (!(await currentStaff())) return NextResponse.json({ error: "Log in again" }, { status: 401 });
  await discardOpenCheck();
  return NextResponse.json({ ok: true });
}
