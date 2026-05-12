import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("session_user");
    if (!cookie) return null;
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

export const unauthorized = () =>
  NextResponse.json({ error: "Non autenticato" }, { status: 401 });

export const forbidden = () =>
  NextResponse.json({ error: "Accesso non autorizzato" }, { status: 403 });

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidUUID = (v) => UUID_RE.test(v);
