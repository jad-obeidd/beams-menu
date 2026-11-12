import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/auth";
import { insertStockItem, listStockItems } from "@/lib/db";
import { cleanStockName, cleanTarget, cleanUnit, isSectionId, newStockId } from "@/lib/stockInput";

export async function POST(request: Request) {
  const staff = await currentStaff();
  if (!staff) return NextResponse.json({ error: "Log in again" }, { status: 401 });

  const body = (await request.json()) as Record<string, unknown>;
  const name = cleanStockName(body.name);
  const target = cleanTarget(body.target);
  if (!isSectionId(body.section)) return NextResponse.json({ error: "Pick a group." }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: "Write the item name." }, { status: 400 });
  if (target === undefined) return NextResponse.json({ error: "Check the target." }, { status: 400 });

  const rows = await listStockItems();
  const last = Math.max(0, ...rows.filter((r) => r.section === body.section).map((r) => r.position));
  const item = await insertStockItem(
    {
      id: newStockId(body.section, name),
      section: body.section,
      grp: typeof body.grp === "string" && body.grp ? body.grp.slice(0, 30) : null,
      name,
      unit: cleanUnit(body.unit),
      target,
      position: last + 10,
    },
    staff.name,
  );
  return NextResponse.json(item);
}
