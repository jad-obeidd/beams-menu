import type { Metadata } from "next";
import { currentStaff } from "@/lib/auth";
import { getOpenCheck, listFinishedChecks, listStockItems } from "@/lib/db";
import { StockApp } from "./StockApp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Beams · Stock check", robots: { index: false } };

export default async function StockPage() {
  const staff = await currentStaff();
  const [items, open, history] = staff
    ? await Promise.all([listStockItems(), getOpenCheck(), listFinishedChecks(10)])
    : [[], null, []];
  return <StockApp staffName={staff?.name ?? null} initialItems={items} initialOpen={open} initialHistory={history} />;
}
