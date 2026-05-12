import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function POST() {
  try {
    await supabase.auth.signOut();

    const res = NextResponse.json({ success: true });
    res.cookies.set({ name: "session_user", value: "", path: "/", maxAge: 0 });
    return res;
  } catch (err) {
    console.error("Errore logout:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
