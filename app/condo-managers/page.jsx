"use client";

import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import {
  Trash2,
  Pencil,
  Search,
  Users,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  ShieldCheck,
  CalendarClock,
} from "lucide-react";
import EditAdminModal from "../components/EditAdminModal";
import clsx from "clsx";

export default function ClientsPage() {
  const { user } = useUser();
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const fetchClients = () => {
    if (user?.role !== "OWNER") return;
    setLoading(true);
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, [user]);
  useEffect(() => {
    fetchClients();
  }, [selectedAdminId]);

  if (!user || user.role !== "OWNER") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-red-400" />
          </div>
          <p className="font-semibold text-gray-700">Accesso non autorizzato</p>
          <p className="text-sm text-gray-400 mt-1">
            Non hai i permessi per visualizzare questa pagina
          </p>
        </div>
      </div>
    );
  }

  const filteredClients = clients.filter((c) =>
    `${c.ragione_sociale} ${c.name} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleDelete = async (adminId) => {
    if (!confirm("Eliminare definitivamente questo amministratore?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/customers/${adminId}`, { method: "DELETE" });
      setClients(clients.filter((c) => c.id !== adminId));
    } catch {
      alert("Errore eliminazione");
    }
    setDeleting(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-blue-600" />
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
              Gestione utenti
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Amministratori
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {clients.length} amministratori registrati
              </p>
            </div>
            <button
              onClick={() => router.push("/signup")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              <Plus size={16} />
              Nuovo Amministratore
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative mb-6 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            placeholder="Cerca per nome, email, ragione sociale..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
          />
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-400">
              Caricamento amministratori...
            </p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {search
                  ? `Nessun risultato per "${search}"`
                  : "Nessun amministratore trovato"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {!search && "Inizia aggiungendo il primo amministratore"}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => router.push("/signup")}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-md shadow-blue-500/20"
              >
                <Plus size={15} />
                Aggiungi amministratore
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* ── Table Header (desktop) ── */}
            <div className="hidden sm:grid grid-cols-[1fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200">
              {[
                "Amministratore",
                "Email",
                "Validità",
                "Condomini",
                "Azioni",
              ].map((h) => (
                <p
                  key={h}
                  className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest last:text-right"
                >
                  {h}
                </p>
              ))}
            </div>

            {filteredClients.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-400 text-sm">
                  Nessun risultato per "{search}"
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredClients.map((c) => {
                  const isActive =
                    new Date(c.password_expiration) >= new Date();
                  const initials =
                    `${c.name?.charAt(0) ?? ""}${c.cognome?.charAt(0) ?? ""}`.toUpperCase();
                  const condPercent =
                    c.condomini_max > 0
                      ? Math.min(
                          (c.condomini_count / c.condomini_max) * 100,
                          100,
                        )
                      : 0;

                  return (
                    <li key={c.id}>
                      {/* ── Desktop row ── */}
                      <div
                        className="hidden sm:grid grid-cols-[1fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/condo-managers/${c.id}`)}
                      >
                        {/* Amministratore */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={clsx(
                              "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                              isActive
                                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                                : "bg-gray-200 text-gray-500",
                            )}
                          >
                            {initials || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate leading-tight">
                              {c.ragione_sociale || "—"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {c.name} {c.cognome}
                            </p>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 min-w-0">
                          <Mail size={13} className="shrink-0 text-gray-400" />
                          <span className="truncate text-xs">{c.email}</span>
                        </div>

                        {/* Validità */}
                        <div
                          className={clsx(
                            "flex items-center gap-1.5 text-xs min-w-0",
                            isActive ? "text-gray-500" : "text-red-500",
                          )}
                        >
                          <CalendarClock size={13} className="shrink-0" />
                          <span className="truncate">
                            {c.password_expiration}
                          </span>
                        </div>

                        {/* Condomini progress */}
                        <div className="min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">
                              {c.condomini_count}
                              <span className="text-gray-400">
                                /{c.condomini_max}
                              </span>
                            </span>
                            <span
                              className={clsx(
                                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                                isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-600",
                              )}
                            >
                              {isActive ? "Attivo" : "Scaduto"}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={clsx(
                                "h-full rounded-full transition-all duration-500",
                                condPercent >= 90
                                  ? "bg-red-400"
                                  : condPercent >= 60
                                    ? "bg-amber-400"
                                    : "bg-blue-500",
                              )}
                              style={{ width: `${condPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Azioni */}
                        <div
                          className="flex items-center gap-1 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelectedAdminId(c.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Modifica"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deleting}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                            title="Elimina"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* ── Mobile card ── */}
                      <div
                        className="flex sm:hidden items-start gap-3 px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/condo-managers/${c.id}`)}
                      >
                        {/* Avatar */}
                        <div
                          className={clsx(
                            "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold mt-0.5",
                            isActive
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                              : "bg-gray-200 text-gray-500",
                          )}
                        >
                          {initials || "?"}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {c.ragione_sociale || "—"}
                            </p>
                            <span
                              className={clsx(
                                "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
                                isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-red-50 text-red-600 border-red-200",
                              )}
                            >
                              {isActive ? (
                                <CheckCircle2 size={9} />
                              ) : (
                                <XCircle size={9} />
                              )}
                              {isActive ? "Attivo" : "Scaduto"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {c.name} {c.cognome}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Mail
                              size={11}
                              className="text-gray-400 shrink-0"
                            />
                            <p className="text-xs text-gray-400 truncate">
                              {c.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <CalendarClock
                              size={11}
                              className={clsx(
                                "shrink-0",
                                isActive ? "text-gray-400" : "text-red-400",
                              )}
                            />
                            <p
                              className={clsx(
                                "text-xs",
                                isActive ? "text-gray-400" : "text-red-500",
                              )}
                            >
                              {c.password_expiration}
                            </p>
                          </div>
                          {/* Progress mobile */}
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1">
                                <Building2
                                  size={11}
                                  className="text-gray-400"
                                />
                                <span className="text-xs text-gray-400">
                                  {c.condomini_count}/{c.condomini_max}
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={clsx(
                                  "h-full rounded-full",
                                  condPercent >= 90
                                    ? "bg-red-400"
                                    : condPercent >= 60
                                      ? "bg-amber-400"
                                      : "bg-blue-500",
                                )}
                                style={{ width: `${condPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Azioni mobile */}
                        <div
                          className="flex flex-col gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelectedAdminId(c.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deleting}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {selectedAdminId && (
        <EditAdminModal
          adminId={selectedAdminId}
          onClose={() => setSelectedAdminId(null)}
        />
      )}
    </DashboardLayout>
  );
}
