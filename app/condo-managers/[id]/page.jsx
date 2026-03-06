"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  FileText,
  FileSpreadsheet,
  Building2,
  Search,
  MapPin,
  Hash,
  Mail,
  Phone,
  ChevronRight,
  FolderOpen,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  User,
  X,
  FileCheck,
  BadgeCheck,
} from "lucide-react";
import clsx from "clsx";

export default function AdminClientDashboard() {
  const { id } = useParams();
  const router = useRouter();

  const [client, setClient] = useState(null);
  const [condomini, setCondomini] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDocs, setOpenDocs] = useState(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [resUser, resCond] = await Promise.all([
        fetch(`/api/profile/${id}`),
        fetch(`/api/get-condomini?user_id=${id}`),
      ]);
      const [dataUser, dataCond] = await Promise.all([
        resUser.json(),
        resCond.json(),
      ]);
      if (dataUser.error) throw new Error(dataUser.error);
      if (dataCond.error) throw new Error(dataCond.error);
      setClient(dataUser.user);
      setCondomini(dataCond.condomini || []);
    } catch (err) {
      setError(err.message || "Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const renderDocumentIcon = (type) =>
    type?.toLowerCase() === "pdf" ? (
      <FileText className="text-red-400 w-4 h-4 shrink-0" />
    ) : (
      <FileSpreadsheet className="text-emerald-400 w-4 h-4 shrink-0" />
    );

  const formatAddress = (...parts) => parts.filter(Boolean).join(" ");

  /* ── Guards ── */
  if (loading)
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-400">Caricamento dati cliente...</p>
        </div>
      </DashboardLayout>
    );

  if (error || !client)
    return (
      <DashboardLayout>
        <div className="p-8 max-w-lg mx-auto mt-16">
          <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error || "Cliente non trovato"}</span>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition shrink-0"
            >
              <RefreshCw size={12} />
              Riprova
            </button>
          </div>
        </div>
      </DashboardLayout>
    );

  const filteredCondomini = condomini.filter((c) =>
    `${c.condominio} ${c.citta} ${c.provincia} ${c.cf_condominio}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const totalDocs = condomini.reduce(
    (acc, c) => acc + (c.documents?.length ?? 0),
    0,
  );
  const conWithDocs = condomini.filter((c) => c.documents?.length > 0).length;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        {/* ── Back ── */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition mb-6"
        >
          <ArrowLeft size={13} />
          Torna alla lista
        </button>

        {/* ── Client Header Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="bg-[#0f172a] px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-white leading-tight">
                  {client.ragione_sociale || `${client.name} ${client.cognome}`}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-500/20 border border-blue-400/30 text-blue-300 px-2 py-0.5 rounded-full">
                  <BadgeCheck size={10} />
                  {client.role || "CLIENTE"}
                </span>
              </div>
              {client.ragione_sociale && (
                <p className="text-slate-400 text-sm mt-0.5">
                  {client.name} {client.cognome}
                </p>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {[
              { icon: Mail, label: "Email", value: client.email },
              { icon: Phone, label: "Telefono", value: client.telefono || "—" },
              {
                icon: MapPin,
                label: "Sede Legale",
                value: formatAddress(
                  client.sede_legale,
                  client.cap_legale,
                  client.citta_legale,
                  client.pr_legale ? `(${client.pr_legale})` : "",
                ),
              },
              {
                icon: Building2,
                label: "Partita IVA",
                value: client.partita_iva || "—",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    {label}
                  </p>
                  <p className="text-sm text-gray-700 font-medium truncate">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        {condomini.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: "Condomini totali",
                value: condomini.length,
                icon: Building2,
                color: "blue",
              },
              {
                label: "Con documenti",
                value: conWithDocs,
                icon: FileCheck,
                color: "emerald",
              },
              {
                label: "Documenti totali",
                value: totalDocs,
                icon: FolderOpen,
                color: "violet",
              },
            ].map(({ label, value, icon: Icon, color }) => {
              const colors = {
                blue: "bg-blue-50 text-blue-600 border-blue-100",
                emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
                violet: "bg-violet-50 text-violet-600 border-violet-100",
              };
              return (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${colors[color]}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Section header + Search ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-800">
              Condomini ({condomini.length})
            </h2>
          </div>
          {condomini.length > 0 && (
            <div className="relative max-w-xs w-full">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Cerca condominio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Condomini list ── */}
        {condomini.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">Nessun condominio</p>
              <p className="text-sm text-gray-400 mt-1">
                Questo cliente non ha ancora condomini registrati
              </p>
            </div>
          </div>
        ) : filteredCondomini.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-400 text-sm">
              Nessun risultato per "
              <span className="font-medium">{search}</span>"
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[1fr_1.5fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200">
              {["Condominio", "Indirizzo", "Codice Fiscale", "Documenti"].map(
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

            <ul className="divide-y divide-gray-100">
              {filteredCondomini.map((condominio) => {
                const isOpen = openDocs === condominio.condominio_id;
                const docCount = condominio.documents?.length ?? 0;
                return (
                  <li key={condominio.condominio_id}>
                    {/* ── Row ── */}
                    <div
                      className={clsx(
                        "px-4 sm:px-5 py-4 cursor-pointer transition-colors",
                        isOpen ? "bg-blue-50/60" : "hover:bg-gray-50",
                      )}
                      onClick={() =>
                        setOpenDocs(isOpen ? null : condominio.condominio_id)
                      }
                    >
                      {/* Desktop */}
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
                            {formatAddress(
                              condominio.condominio_indirizzo,
                              condominio.cap,
                              condominio.citta,
                              condominio.provincia
                                ? `(${condominio.provincia})`
                                : "",
                            )}
                          </span>
                        </div>

                        {/* CF */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Hash size={13} className="shrink-0 text-gray-400" />
                          <span className="truncate font-mono text-xs text-gray-500">
                            {condominio.cf_condominio}
                          </span>
                        </div>

                        {/* Docs badge + chevron */}
                        <div className="flex items-center gap-2 justify-end">
                          {docCount > 0 && (
                            <span className="text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                              {docCount} doc
                            </span>
                          )}
                          <ChevronRight
                            size={15}
                            className={clsx(
                              "text-gray-400 transition-transform duration-200",
                              isOpen && "rotate-90 text-blue-500",
                            )}
                          />
                        </div>
                      </div>

                      {/* Mobile */}
                      <div className="flex sm:hidden items-start gap-3">
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
                              {formatAddress(
                                condominio.condominio_indirizzo,
                                condominio.cap,
                                condominio.citta,
                              )}
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
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <ChevronRight
                            size={15}
                            className={clsx(
                              "text-gray-400 transition-transform duration-200",
                              isOpen && "rotate-90 text-blue-500",
                            )}
                          />
                          {docCount > 0 && (
                            <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full">
                              {docCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Documenti espandibili ── */}
                    {isOpen && (
                      <div className="px-5 pb-4 pt-2 bg-blue-50/40 border-t border-blue-100">
                        <div className="flex items-center gap-2 mb-3">
                          <FolderOpen size={14} className="text-blue-500" />
                          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                            Documenti
                          </p>
                        </div>
                        {docCount > 0 ? (
                          <ul className="flex flex-wrap gap-2">
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
                                    ?.split("/")
                                    .pop()
                                    ?.replace(".pdf", "")
                                    ?.split("NOMINA_RESPONSABILE_ESTERNO_")[1]
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
                                    <span className="truncate max-w-[200px] text-xs">
                                      {fileName}
                                    </span>
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl px-4 py-3">
                            <FolderOpen size={14} className="text-gray-300" />
                            Nessun documento censito
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
