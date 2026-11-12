import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/auth";
import { getOpenCheck, listFinishedChecks, listStockItems } from "@/lib/db";

export async function GET() {
  if (!(await currentStaff())) return NextResponse.json({ error: "Log in again" }, { status: 401 });
  const [items, open, history] = await Promise.all([listStockItems(), getOpenCheck(), listFinishedChecks(10)]);
  return NextResponse.json({ items, open, history });
}
