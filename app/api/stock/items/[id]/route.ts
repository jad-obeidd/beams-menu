import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/auth";
import { deleteStockItem, updateStockItem } from "@/lib/db";
import type { StockItem } from "@/lib/stock";
import { cleanStockName, cleanTarget, cleanUnit } from "@/lib/stockInput";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const staff = await currentStaff();
  if (!staff) return NextResponse.json({ error: "Log in again" }, { status: 401 });

  const body = (await request.json()) as Record<string, unknown>;
  const patch: Partial<StockItem> = {};
  if ("name" in body) {
    const name = cleanStockName(body.name);
    if (name.length < 2) return NextResponse.json({ error: "Write the item name." }, { status: 400 });
    patch.name = name;
  }
  if ("unit" in body) patch.unit = cleanUnit(body.unit);
  if ("target" in body) {
    const target = cleanTarget(body.target);
    if (target === undefined) return NextResponse.json({ error: "Check the target." }, { status: 400 });
    patch.target = target;
  }

  const saved = await updateStockItem((await params).id, patch, staff.name);
  if (!saved) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json(saved);
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await currentStaff())) return NextResponse.json({ error: "Log in again" }, { status: 401 });
  await deleteStockItem((await params).id);
  return NextResponse.json({ ok: true });
}
