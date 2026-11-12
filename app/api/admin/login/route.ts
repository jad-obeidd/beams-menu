import { NextResponse } from "next/server";
import { checkLogin, clientIp, startSession } from "@/lib/auth";
import { clearRateLimit, hitRateLimit } from "@/lib/db";

export async function POST(request: Request) {
  const { name, pin } = (await request.json()) as { name?: string; pin?: string };
  // Shares the loyalty card's lock: 5 wrong tries, then 15 minutes.
  const key = `staff-pin:${await clientIp()}`;
  if (!(await hitRateLimit(key, 5, 15 * 60))) {
    return NextResponse.json({ error: "Too many wrong tries. Try again in 15 minutes." }, { status: 429 });
  }
  const member = await checkLogin(name ?? "", pin ?? "");
  if (!member) return NextResponse.json({ error: "Wrong name or PIN" }, { status: 401 });
  await clearRateLimit(key);
  await startSession(member);
  return NextResponse.json({ name: member.name });
}
