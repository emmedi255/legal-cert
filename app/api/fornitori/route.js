import { createClient } from "@supabase/supabase-js";
import { capitalizeWords } from "../../utils/formatters";
import { getSession, unauthorized, forbidden } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY,
);

export async function GET(req) {
  const session = await getSession();
  if (!session) return unauthorized();

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId)
    return new Response(JSON.stringify({ error: "userId mancante" }), { status: 400 });

  // Solo OWNER può leggere fornitori altrui
  if (userId !== session.id && session.role !== "OWNER")
    return new Response(JSON.stringify({ error: "Accesso non autorizzato" }), { status: 403 });

  try {
    const { data, error } = await supabase
      .from("fornitori")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error)
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (err) {
    console.error("GET fornitori error:", err);
    return new Response(JSON.stringify({ error: "Errore interno server" }), { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id)
    return new Response(JSON.stringify({ error: "ID fornitore mancante" }), { status: 400 });

  try {
    // Verifica ownership prima di cancellare
    const { data: fornitore, error: fetchError } = await supabase
      .from("fornitori")
      .select("user_id")
      .eq("fornitore_id", id)
      .single();

    if (fetchError || !fornitore)
      return new Response(JSON.stringify({ error: "Fornitore non trovato" }), { status: 404 });

    if (fornitore.user_id !== session.id && session.role !== "OWNER")
      return new Response(JSON.stringify({ error: "Accesso non autorizzato" }), { status: 403 });

    const { error } = await supabase
      .from("fornitori")
      .delete()
      .eq("fornitore_id", id);

    if (error)
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Errore interno server" }), { status: 500 });
  }
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const {
      userId,
      nome,
      cognome,
      ragioneSociale,
      indirizzo,
      cap,
      citta,
      provincia,
      cf,
      attivita,
    } = await req.json();

    // Solo OWNER può creare fornitori per conto di altri utenti
    const targetUserId = userId || session.id;
    if (targetUserId !== session.id && session.role !== "OWNER")
      return new Response(JSON.stringify({ error: "Accesso non autorizzato" }), { status: 403 });

    if (!nome)
      return new Response(JSON.stringify({ error: "Dati mancanti" }), { status: 400 });

    const { data, error } = await supabase
      .from("fornitori")
      .insert({
        user_id: targetUserId,
        nome: capitalizeWords(nome),
        indirizzo: capitalizeWords(indirizzo),
        citta: capitalizeWords(citta),
        cf,
        attivita: capitalizeWords(attivita),
        cognome: capitalizeWords(cognome),
        ragione_sociale: capitalizeWords(ragioneSociale),
        cap,
        provincia,
      })
      .select()
      .single();

    if (error)
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (err) {
    console.error("POST fornitori error:", err);
    return new Response(JSON.stringify({ error: "Errore interno server" }), { status: 500 });
  }
}
