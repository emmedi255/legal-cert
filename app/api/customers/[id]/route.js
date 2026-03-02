import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY, // SERVICE ROLE lato server
);

export async function GET(req, context) {
  // 🔹 unwrap di params
  const { params } = context;
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    return NextResponse.json({ error: "ID cliente mancante" }, { status: 400 });
  }

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
  try {
    // ⚠️ unwrap della Promise
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID cliente mancante" },
        { status: 400 },
      );
    }

    const { error: documentsError } = await supabase
      .from("documents")
      .delete()
      .eq("user_id", id);

    if (documentsError) throw new Error(documentsError.message);

    // 2️⃣ elimina il profilo dalla tabella "profiles"
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) throw new Error(profileError.message);

    // 1️⃣ elimina dall'autenticazione
    const { data: userData, error: userError } =
      await supabase.auth.admin.deleteUser(id);
    if (userError) throw new Error(userError.message);

    return NextResponse.json({ message: "Cliente eliminato correttamente" });
  } catch (err) {
    console.error("DELETE CUSTOMER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, context) {
  try {
    // 🔹 unwrap params (Next 15+)
    const { params } = context;
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    const body = await req.json();
    const { password, email, ...profileData } = body;

    /* --------------------------------------------------
       1️⃣ UPDATE AUTH (email / password / metadata)
    -------------------------------------------------- */

    const authUpdate = {};

    if (email) authUpdate.email = email;
    if (password) {
      authUpdate.password = password;
    }

    authUpdate.user_metadata = {
      name: profileData.name,
      cognome: profileData.cognome,
      ragione_sociale: profileData.ragione_sociale,
      telefono: profileData.telefono,
    };

    const { error: authError } = await supabase.auth.admin.updateUserById(
      id,
      authUpdate,
    );

    if (authError) throw authError;

    /* --------------------------------------------------
       2️⃣ UPDATE PROFILES (NO password!)
    -------------------------------------------------- */

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        email,
      })
      .eq("id", id);

    if (profileError) throw profileError;

    /* --------------------------------------------------
       3️⃣ READ BACK
    -------------------------------------------------- */

    const { data: updatedUser, error: readError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (readError) throw readError;

    return NextResponse.json({
      message: "Utente aggiornato correttamente",
      admin: updatedUser,
    });
  } catch (err) {
    console.error("PUT AUTH + PROFILE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
