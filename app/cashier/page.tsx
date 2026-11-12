import type { Metadata, Viewport } from "next";
import { CashierApp } from "./CashierApp";

export const metadata: Metadata = { title: "Beams · Cashier", robots: { index: false } };
export const viewport: Viewport = { themeColor: "#1b29eb" };

export default function CashierPage() {
  return <CashierApp />;
}
