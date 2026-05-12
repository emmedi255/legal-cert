import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession, unauthorized, forbidden } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);

export async function DELETE(req, context) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "ID condominio mancante" }, { status: 400 });

  try {
    // Verifica ownership
    const { data: existing, error: fetchOwnerError } = await supabase
      .from("condomini")
      .select("user_id")
      .eq("condominio_id", id)
      .single();

    if (fetchOwnerError || !existing) {
      return NextResponse.json({ error: "Condominio non trovato" }, { status: 404 });
    }

    if (existing.user_id !== session.id && session.role !== "OWNER") {
      return forbidden();
    }

    // Recupero e rimozione file storage
    const { data: documents, error: fetchError } = await supabase
      .from("documents")
      .select("file_url")
      .eq("condominio_id", id);
    if (fetchError) throw fetchError;

    if (documents?.length) {
      const filePaths = documents.map((d) => d.file_url).filter(Boolean);
      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove(filePaths);
        if (storageError) throw storageError;
      }
    }

    await supabase.from("documents").delete().eq("condominio_id", id);

    const { error } = await supabase
      .from("condomini")
      .delete()
      .eq("condominio_id", id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Condominio e documenti eliminati con successo" });
  } catch (error) {
    console.error("Errore DELETE condominio:", error);
    return NextResponse.json({ error: error.message || "Errore server" }, { status: 500 });
  }
}
