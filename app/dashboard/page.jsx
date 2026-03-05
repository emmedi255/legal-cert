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
} from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const { user, setUser, loading: userLoading } = useUser();
  const { condomini, setCondomini } = useCondomini();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDocs, setOpenDocs] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/login"); // rimanda a login
    }
  }, [user, router]);
  /* ===================== FETCH DATI ===================== */
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

  /* ===================== HANDLERS ===================== */
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

      // ✅ Fix: usa condominio_id, non id
      setCondomini((prev) =>
        prev.filter((c) => c.condominio_id !== condominio_id),
      );
    } catch (err) {
      alert("Errore durante l'eliminazione del condominio"); // ✅ Fix: testo corretto
    }
  };

  const goToSignup = () => router.push("/signup");

  /* ===================== UTILS ===================== */
  const renderDocumentIcon = (type) =>
    type.toLowerCase() === "pdf" ? (
      <FileText className="text-red-500 w-5 h-5" />
    ) : (
      <FileSpreadsheet className="text-green-500 w-5 h-5" />
    );

  /* ===================== HEADER ===================== */
  const StickyHeader = ({ title }) => (
    <div className="sticky top-0 z-50 bg-gray-50 p-6 md:p-10 flex justify-between items-center border-b border-gray-200">
      <h1 className="text-3xl font-bold text-blue-900">{title}</h1>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
      >
        <LogOut size={20} /> Logout
      </button>
    </div>
  );

  /* ===================== GUARD ===================== */
  if (userLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loader w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-center mt-10 text-gray-500 font-medium">
          Accesso richiesto
        </p>
      </div>
    );

  const filteredCondomini = condomini.filter((c) =>
    `${c.condominio} ${c.citta} ${c.provincia} ${c.cf_condominio}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  /* ===================== DASHBOARD CLIENT ===================== */
  return (
    <div className="min-h-screen justify-center bg-gradient-to-b from-blue-100 to-white font-sans">
      <DashboardLayout>
        <div className="">
          <input
            placeholder="Cerca condominio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md mb-6 px-4 py-2 border border-gray-200 rounded-lg text-gray-600"
          />
          {loading ? (
            <div className="flex justify-center items-center mt-20">
              <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : condomini.length === 0 ? (
            <div className="flex flex-col items-center gap-6 mt-20">
              <p className="text-gray-500 text-lg">Nessun condominio trovato</p>
            </div>
          ) : (
            <>
              <div className="hidden sm:flex items-center text-xs font-semibold text-gray-500 border-b border-gray-200 pb-2 mb-3">
                <span className="w-12"></span> {/* spazio per freccia */}
                <span className="flex-1 min-w-[120px]">CONDOMINIO</span>
                <span className="flex-1 min-w-[150px]">INDIRIZZO</span>
                <span className="flex-1 min-w-[130px]">CODICE FISCALE</span>
                <span className="w-24 text-right">AZIONI</span>
              </div>
              {filteredCondomini.length === 0 ? (
                <p className="text-gray-400 text-center mt-10">
                  Nessun risultato trovato
                </p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-1 ">
                  {filteredCondomini.map((condominio) => (
                    <li
                      key={condominio.condominio_id}
                      className="w-full relative p-4  hover:bg-gray-100 transition border-b-2 "
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* FRECCIA */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDocs(
                              openDocs === condominio.condominio_id
                                ? null
                                : condominio.condominio_id,
                            );
                          }}
                          className="text-gray-500 hover:text-gray-800"
                        >
                          <ChevronRight
                            className={`transition ${
                              openDocs === condominio.condominio_id
                                ? "rotate-90"
                                : ""
                            }`}
                            size={18}
                          />
                        </button>

                        {/* DATI CONDOMINIO */}
                        <div
                          className="flex-1 cursor-pointer flex flex-wrap items-center text-sm gap-2 md:gap-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDocs(
                              openDocs === condominio.condominio_id
                                ? null
                                : condominio.condominio_id,
                            );
                          }}
                        >
                          <span className="flex-1 min-w-[120px] font-semibold text-gray-700">
                            {condominio.condominio}
                          </span>

                          <span className="flex-1 min-w-[150px] text-gray-500">
                            {condominio.condominio_indirizzo} {condominio.cap}{" "}
                            {condominio.citta}{" "}
                            {condominio?.provincia
                              ? "(" + condominio.provincia + ")"
                              : ""}
                          </span>

                          <span className="flex-1 min-w-[130px] text-gray-400">
                            {condominio.cf_condominio}
                          </span>

                          {/* BOTTONI */}
                          <div className="flex items-center gap-2 mt-2 md:mt-0">
                            <button
                              onClick={() =>
                                router.push(
                                  `/condomini/${condominio.condominio_id}`,
                                )
                              }
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCondominio(
                                  condominio.condominio_id,
                                );
                              }}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                      {openDocs === condominio.condominio_id && (
                        <div className="top-full  p-4 mt-2 z-10 pl-8  p-4">
                          {condominio.documents?.length > 0 ? (
                            <ul className="flex flex-col gap-2">
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
                                      .pop() // prende solo il nome del file
                                      .replace(".pdf", "") // rimuove l'estensione
                                      .split("NOMINA_RESPONSABILE_ESTERNO_")[1] // prende solo la parte dopo il prefisso
                                      .split("-")[0]; // prende solo la parte prima dell'ID lungo
                                }

                                return (
                                  <li key={key}>
                                    <a
                                      href={doc.signedUrl || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-2 text-sm text-gray-600 hover:underline"
                                    >
                                      {renderDocumentIcon(doc.type)}
                                      {fileName}
                                    </a>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              Nessun documento censito
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </div>
  );
}
