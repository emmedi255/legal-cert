import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { capitalizeWords } from "@/app/utils/formatters";
import { getSession, unauthorized, forbidden } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);

export async function POST(req) {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const formData = await req.json();
    const { id, password, role: clientRole, ...rest } = formData;

    if (!id) return NextResponse.json({ error: "ID mancante" }, { status: 400 });

    // Un utente può aggiornare solo il proprio profilo
    if (id !== session.id) return forbidden();

    const authUpdate = {};
    if (rest.email) authUpdate.email = rest.email;
    if (password) authUpdate.password = password;
    authUpdate.user_metadata = {
      name: capitalizeWords(rest.name),
      cognome: capitalizeWords(rest.cognome),
      ragione_sociale: capitalizeWords(rest.ragione_sociale),
      telefono: rest.telefono,
    };

    const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdate);
    if (authError) throw authError;

    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    const safeRole = existing?.role || "CLIENTE";

    await supabase
      .from("profiles")
      .upsert([{ id, ...rest, role: safeRole }], { onConflict: ["id"] });

    const { data: updatedUser, error: readError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (readError) throw readError;

    const res = NextResponse.json({ user: updatedUser });
    res.cookies.set("session_user", JSON.stringify(updatedUser), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Errore aggiornamento Auth+Profile:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
