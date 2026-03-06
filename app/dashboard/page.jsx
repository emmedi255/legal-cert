"use client";

import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useCondomini } from "../context/CondominiContext";
import {
  FileText,
  FileSpreadsheet,
  LogOut,
  Trash2,
  ChevronRight,
  Pencil,
  Building2,
  Search,
  MapPin,
  Hash,
  FolderOpen,
  Plus,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import clsx from "clsx";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const { user, setUser, loading: userLoading } = useUser();
  const { condomini, setCondomini } = useCondomini();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDocs, setOpenDocs] = useState(null);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  /* ── FETCH ── */
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/get-condomini?user_id=${user.id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCondomini(data.condomini || []);
    } catch (err) {
      console.error(err);
      setError("Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  /* ── HANDLERS ── */
  const handleLogout = () => {
    setUser(null);
    document.cookie = "session_user=; path=/; max-age=0";
    router.push("/login");
  };

  const handleDeleteCondominio = async (condominio_id) => {
    if (!confirm("Sei sicuro di voler eliminare questo condominio?")) return;
    try {
      const res = await fetch(`/api/condomini/${condominio_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCondomini((prev) =>
        prev.filter((c) => c.condominio_id !== condominio_id),
      );
    } catch {
      alert("Errore durante l'eliminazione del condominio");
    }
  };

  /* ── UTILS ── */
  const renderDocumentIcon = (type) =>
    type.toLowerCase() === "pdf" ? (
      <FileText className="text-red-400 w-4 h-4 shrink-0" />
    ) : (
      <FileSpreadsheet className="text-emerald-400 w-4 h-4 shrink-0" />
    );

  /* ── GUARDS ── */
  if (userLoading)
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <p className="text-slate-400 font-medium">Accesso richiesto</p>
      </div>
    );

  const filteredCondomini = condomini.filter((c) =>
    `${c.condominio} ${c.citta} ${c.provincia} ${c.cf_condominio}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  /* ── RENDER ── */
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <DashboardLayout>
        {/* ── Wrapper a tutta altezza con flex colonna ── */}
        <div className="flex flex-col h-full max-w-6xl mx-auto px-6 md:px-8 pt-6 md:pt-8">
          {/* ══ PARTE FISSA (non scrolla) ══ */}
          <div className="shrink-0">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-blue-600" />
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
                  Area gestione
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    I miei Condomini
                  </h1>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {condomini.length} condomini registrati
                  </p>
                </div>
                <button
                  onClick={() => router.push("/add-company")}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20"
                >
                  <Plus size={16} />
                  Nuovo Condominio
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6 max-w-md">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Cerca per nome, città, CF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
              />
            </div>
          </div>

          {/* ══ PARTE SCROLLABILE ══ */}
          <div className="flex-1 overflow-y-auto pb-8 min-h-0">
            {/* ── States ── */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-400">Caricamento in corso...</p>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            ) : condomini.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">
                    Nessun condominio trovato
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Inizia aggiungendo il tuo primo condominio
                  </p>
                </div>
                <button
                  onClick={() => router.push("/add-company")}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-md shadow-blue-500/20"
                >
                  <Plus size={15} />
                  Aggiungi condominio
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* ── Table Header ── */}
                <div className="hidden sm:grid grid-cols-[1fr_1.5fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200">
                  {["Condominio", "Indirizzo", "Codice Fiscale", "Azioni"].map(
                    (h) => (
                      <p
                        key={h}
                        className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest last:text-right"
                      >
                        {h}
                      </p>
                    ),
                  )}
                </div>

                {filteredCondomini.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-gray-400 text-sm">
                      Nessun risultato per "{search}"
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {filteredCondomini.map((condominio) => {
                      const isOpen = openDocs === condominio.condominio_id;
                      return (
                        <li key={condominio.condominio_id}>
                          {/* ── Row ── */}
                          <div
                            className={clsx(
                              "px-4 sm:px-5 py-4 cursor-pointer transition-colors",
                              isOpen ? "bg-blue-50/60" : "hover:bg-gray-50",
                            )}
                            onClick={() =>
                              setOpenDocs(
                                isOpen ? null : condominio.condominio_id,
                              )
                            }
                          >
                            {/* Layout desktop: griglia 4 colonne */}
                            <div className="hidden sm:grid grid-cols-[1fr_1.5fr_1fr_auto] gap-4 items-center">
                              {/* Nome */}
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={clsx(
                                    "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                    isOpen
                                      ? "bg-blue-600 text-white"
                                      : "bg-slate-100 text-slate-500",
                                  )}
                                >
                                  <Building2 size={15} />
                                </div>
                                <p className="font-semibold text-gray-800 text-sm truncate">
                                  {condominio.condominio}
                                </p>
                              </div>

                              {/* Indirizzo */}
                              <div className="flex items-center gap-1.5 text-sm text-gray-500 min-w-0">
                                <MapPin
                                  size={13}
                                  className="shrink-0 text-gray-400"
                                />
                                <span className="truncate">
                                  {condominio.condominio_indirizzo}
                                  {condominio.cap
                                    ? `, ${condominio.cap}`
                                    : ""}{" "}
                                  {condominio.citta}
                                  {condominio.provincia
                                    ? ` (${condominio.provincia})`
                                    : ""}
                                </span>
                              </div>

                              {/* CF */}
                              <div className="flex items-center gap-1.5 text-sm text-gray-400 min-w-0">
                                <Hash size={13} className="shrink-0" />
                                <span className="truncate font-mono text-xs">
                                  {condominio.cf_condominio}
                                </span>
                              </div>

                              {/* Azioni */}
                              <div className="flex items-center gap-1 justify-end">
                                <ChevronRight
                                  size={15}
                                  className={clsx(
                                    "text-gray-400 transition-transform duration-200 mr-1",
                                    isOpen && "rotate-90 text-blue-500",
                                  )}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/condomini/${condominio.condominio_id}`,
                                    );
                                  }}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                  title="Modifica"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCondominio(
                                      condominio.condominio_id,
                                    );
                                  }}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                  title="Elimina"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            {/* Layout mobile: card verticale */}
                            <div className="flex sm:hidden items-start gap-3">
                              {/* Icona */}
                              <div
                                className={clsx(
                                  "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 transition-colors",
                                  isOpen
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-500",
                                )}
                              >
                                <Building2 size={16} />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm">
                                  {condominio.condominio}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <MapPin
                                    size={11}
                                    className="text-gray-400 shrink-0"
                                  />
                                  <p className="text-xs text-gray-500 truncate">
                                    {condominio.condominio_indirizzo}
                                    {condominio.cap
                                      ? `, ${condominio.cap}`
                                      : ""}{" "}
                                    {condominio.citta}
                                    {condominio.provincia
                                      ? ` (${condominio.provincia})`
                                      : ""}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Hash
                                    size={11}
                                    className="text-gray-400 shrink-0"
                                  />
                                  <p className="text-xs text-gray-400 font-mono">
                                    {condominio.cf_condominio}
                                  </p>
                                </div>
                              </div>

                              {/* Azioni mobile */}
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <ChevronRight
                                  size={15}
                                  className={clsx(
                                    "text-gray-400 transition-transform duration-200",
                                    isOpen && "rotate-90 text-blue-500",
                                  )}
                                />
                                <div className="flex items-center gap-0.5 mt-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(
                                        `/condomini/${condominio.condominio_id}`,
                                      );
                                    }}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCondominio(
                                        condominio.condominio_id,
                                      );
                                    }}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── Documenti espandibili ── */}
                          {isOpen && (
                            <div className="px-5 pb-4 pt-2 bg-blue-50/40 border-t border-blue-100">
                              <div className="flex items-center gap-2 mb-3">
                                <FolderOpen
                                  size={14}
                                  className="text-blue-500"
                                />
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                                  Documenti
                                </p>
                              </div>

                              {condominio.documents?.length > 0 ? (
                                <ul className="flex flex-col gap-1.5 pl-1">
                                  {condominio.documents.map((doc, index) => {
                                    const key =
                                      doc.id ||
                                      `${condominio.condominio_id}-doc-${index}`;
                                    let fileName = doc.document_key;
                                    if (
                                      doc.document_key ===
                                      "nomina-responsabile-esterno"
                                    ) {
                                      fileName =
                                        "fornitore-" +
                                        doc.file_url
                                          .split("/")
                                          .pop()
                                          .replace(".pdf", "")
                                          .split(
                                            "NOMINA_RESPONSABILE_ESTERNO_",
                                          )[1]
                                          ?.split("-")[0];
                                    }
                                    return (
                                      <li key={key}>
                                        <a
                                          href={doc.signedUrl || "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg px-3 py-1.5 transition-all"
                                        >
                                          {renderDocumentIcon(doc.type)}
                                          <span className="truncate max-w-xs">
                                            {fileName}
                                          </span>
                                        </a>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-gray-400 italic bg-white border border-dashed border-gray-200 rounded-xl px-4 py-3">
                                  <FolderOpen
                                    size={14}
                                    className="text-gray-300"
                                  />
                                  Nessun documento censito
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
