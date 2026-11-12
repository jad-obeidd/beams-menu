import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/auth";
import { insertMenuRow, listMenuRows } from "@/lib/db";
import { cleanDescription, cleanName, cleanPrices, isSection, newItemId } from "@/lib/menuInput";

export async function GET() {
  if (!(await currentStaff())) return NextResponse.json({ error: "Log in again" }, { status: 401 });
  return NextResponse.json(await listMenuRows());
}

export async function POST(request: Request) {
  const staff = await currentStaff();
  if (!staff) return NextResponse.json({ error: "Log in again" }, { status: 401 });

  const body = (await request.json()) as Record<string, unknown>;
  const name = cleanName(body.name);
  const prices = cleanPrices(body.prices);
  if (!isSection(body.sectionId)) return NextResponse.json({ error: "Pick a section." }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: "Write the item's name." }, { status: 400 });
  if (!prices) return NextResponse.json({ error: "Check the price." }, { status: 400 });

  const rows = await listMenuRows();
  const lastPosition = Math.max(0, ...rows.filter((r) => r.section_id === body.sectionId).map((r) => r.position));
  const saved = await insertMenuRow({
    id: newItemId(name),
    section_id: body.sectionId,
    name,
    prices,
    description: cleanDescription(body.description),
    note: null,
    available: true,
    hidden: false,
    position: lastPosition + 10,
    updated_by: staff.name,
    updated_at: new Date().toISOString(),
  });
  return NextResponse.json(saved);
}
