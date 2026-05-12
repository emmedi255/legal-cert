import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession, unauthorized } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);

export async function POST(req) {
  const session = await getSession();
  if (!session) return unauthorized();

  const body = await req.json();
  const { condominio_id } = body;

  // Usa sempre l'ID dalla sessione, non dal client
  let query = supabase
    .from("documents")
    .select("*")
    .eq("user_id", session.id)
    .eq("type", "PDF");

  if (condominio_id) query = query.eq("condominio_id", condominio_id);

  const { data: documents, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const docsWithUrls = await Promise.all(
    documents.map(async (doc) => {
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_url, 60 * 60);
      return { ...doc, signedUrl: data?.signedUrl || null };
    }),
  );

  return NextResponse.json({ documents: docsWithUrls });
}
