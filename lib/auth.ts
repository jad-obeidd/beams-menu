import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { findStaff, type StaffRow } from "./db";

// Baristas log in with the same name + PIN as on the loyalty card's /staff page.
// PIN hashes use the same "scrypt$salt$hash" format the loyalty app writes.

const COOKIE = "beams_menu_staff";
const SHIFT_HOURS = 12;

const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is not set");
  return value ?? "dev-secret";
};

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

const sameText = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

const pinMatches = (pin: string, stored: string) => {
  const [, salt, hash] = stored.split("$");
  return Boolean(salt && hash) && sameText(scryptSync(pin, salt, 32).toString("hex"), hash);
};

export const staffNameKey = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

export const checkLogin = async (name: string, pin: string): Promise<StaffRow | null> => {
  const member = await findStaff("name_key", staffNameKey(name));
  return member?.active && pinMatches(pin, member.pin_hash) ? member : null;
};

type Session = { exp: number; id: string; v: string };

export const startSession = async (member: StaffRow) => {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SHIFT_HOURS * 3600_000, id: member.id, v: member.version } satisfies Session),
  ).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: SHIFT_HOURS * 3600,
    path: "/",
  });
};

export const endSession = async () => (await cookies()).delete(COOKIE);

// Checked against the account every time, so a barista removed or given a new PIN
// on the loyalty /owner page is signed out here too.
export const currentStaff = async () => {
  const [payload, signature] = (await cookies()).get(COOKIE)?.value.split(".") ?? [];
  if (!payload || !signature || !sameText(signature, sign(payload))) return null;
  const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
  if (session.exp < Date.now()) return null;
  const member = await findStaff("id", session.id);
  return member?.active && member.version === session.v ? { id: member.id, name: member.name } : null;
};

export const clientIp = async () => {
  const list = (await headers()).get("x-forwarded-for");
  return list?.split(",")[0]?.trim() || (await headers()).get("x-real-ip") || "local";
};
