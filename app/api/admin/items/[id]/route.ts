import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/auth";
import { deleteMenuRow, updateMenuRow, type MenuRow } from "@/lib/db";
import { cleanDescription, cleanName, cleanPrices } from "@/lib/menuInput";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const staff = await currentStaff();
  if (!staff) return NextResponse.json({ error: "Log in again" }, { status: 401 });

  const body = (await request.json()) as Record<string, unknown>;
  const patch: Partial<MenuRow> = { updated_by: staff.name, updated_at: new Date().toISOString() };

  if ("available" in body) patch.available = Boolean(body.available);
  if ("hidden" in body) patch.hidden = Boolean(body.hidden);
  if ("name" in body) {
    const name = cleanName(body.name);
    if (name.length < 2) return NextResponse.json({ error: "Write the item's name." }, { status: 400 });
    patch.name = name;
  }
  if ("prices" in body) {
    const prices = cleanPrices(body.prices);
    if (!prices) return NextResponse.json({ error: "Check the price." }, { status: 400 });
    patch.prices = prices;
  }
  if ("description" in body) patch.description = cleanDescription(body.description);

  const saved = await updateMenuRow((await params).id, patch);
  if (!saved) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json(saved);
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await currentStaff())) return NextResponse.json({ error: "Log in again" }, { status: 401 });
  await deleteMenuRow((await params).id);
  return NextResponse.json({ ok: true });
}
