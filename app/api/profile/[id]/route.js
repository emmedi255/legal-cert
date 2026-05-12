import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSession, unauthorized, forbidden } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);

export async function GET(req, context) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID mancante" }, { status: 400 });

  // Un utente può leggere solo il proprio profilo; OWNER può leggere tutti
  if (id !== session.id && session.role !== "OWNER") return forbidden();

  try {
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Errore GET profilo:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
