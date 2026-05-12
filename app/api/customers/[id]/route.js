import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession, unauthorized, forbidden } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);

export async function GET(req, context) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (session.role !== "OWNER") return forbidden();

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID cliente mancante" }, { status: 400 });

  try {
    const { data: admin, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json({ admin });
  } catch (err) {
    console.error("GET CUSTOMER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (session.role !== "OWNER") return forbidden();

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID cliente mancante" }, { status: 400 });

  try {
    // 1. Recupera tutti i condomini dell'utente
    const { data: condomini } = await supabase
      .from("condomini")
      .select("condominio_id")
      .eq("user_id", id);

    const condominioIds = (condomini || []).map((c) => c.condominio_id);

    if (condominioIds.length > 0) {
      // 2. Recupera i file PDF da rimuovere dallo storage
      const { data: docFiles } = await supabase
        .from("documents")
        .select("file_url")
        .in("condominio_id", condominioIds);

      const filePaths = (docFiles || []).map((d) => d.file_url).filter(Boolean);
      if (filePaths.length > 0) {
        await supabase.storage.from("documents").remove(filePaths);
      }

      // 3. Elimina documenti dei condomini
      await supabase
        .from("documents")
        .delete()
        .in("condominio_id", condominioIds);

      // 4. Elimina relazioni condomini-fornitori
      await supabase
        .from("condomini_fornitori")
        .delete()
        .in("condominio_id", condominioIds);

      // 5. Elimina i condomini
      await supabase
        .from("condomini")
        .delete()
        .in("condominio_id", condominioIds);
    }

    // 6. Elimina i fornitori dell'utente
    await supabase.from("fornitori").delete().eq("user_id", id);

    // 7. Elimina documenti diretti dell'utente (non legati a condomini)
    await supabase.from("documents").delete().eq("user_id", id);

    // 8. Elimina il profilo
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);
    if (profileError) throw new Error(profileError.message);

    // 9. Elimina dall'autenticazione Supabase
    const { error: userError } = await supabase.auth.admin.deleteUser(id);
    if (userError) throw new Error(userError.message);

    return NextResponse.json({ message: "Cliente eliminato correttamente" });
  } catch (err) {
    console.error("DELETE CUSTOMER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, context) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (session.role !== "OWNER") return forbidden();

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID mancante" }, { status: 400 });

  try {
    const body = await req.json();
    const { password, email, ...profileData } = body;

    const authUpdate = {};
    if (email) authUpdate.email = email;
    if (password) authUpdate.password = password;
    authUpdate.user_metadata = {
      name: profileData.name,
      cognome: profileData.cognome,
      ragione_sociale: profileData.ragione_sociale,
      telefono: profileData.telefono,
    };

    const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdate);
    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ ...profileData, email })
      .eq("id", id);
    if (profileError) throw profileError;

    const { data: updatedUser, error: readError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (readError) throw readError;

    return NextResponse.json({ message: "Utente aggiornato correttamente", admin: updatedUser });
  } catch (err) {
    console.error("PUT AUTH + PROFILE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
