import type { Metadata } from "next";
import { currentStaff } from "@/lib/auth";
import { listMenuRows } from "@/lib/db";
import { sectionMetas } from "@/lib/menu";
import { AdminApp } from "./AdminApp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Beams · Menu dashboard", robots: { index: false } };

export default async function AdminPage() {
  const staff = await currentStaff();
  return (
    <AdminApp
      staffName={staff?.name ?? null}
      initialRows={staff ? await listMenuRows() : []}
      sections={sectionMetas.map(({ id, title }) => ({ id, title }))}
    />
  );
}
