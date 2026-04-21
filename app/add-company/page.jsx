"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { FornitoriSection } from "../fornitori-section/FornitoriSection";
import {
  Home,
  RefreshCw,
  FilePen,
  Building2,
  Users,
  MapPin,
  Shield,
  Server,
  Cloud,
  FileText,
  Camera,
  Briefcase,
  UserCheck,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Save,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { provinceItaliane } from "../utils/provinceItaliane";
import DashboardLayout from "../components/DashboardLayout";

/* ══════════════════════════════════════════
   COMPONENTI — fuori da DataForm
══════════════════════════════════════════ */

function SectionCard({
  number,
  title,
  icon: Icon,
  accentColor = "blue",
  children,
}) {
  const colors = {
    blue: {
      card: "border-blue-100",
      header: "bg-blue-50 text-blue-600",
      badge: "bg-blue-600",
    },
    indigo: {
      card: "border-indigo-100",
      header: "bg-indigo-50 text-indigo-600",
      badge: "bg-indigo-600",
    },
    emerald: {
      card: "border-emerald-100",
      header: "bg-emerald-50 text-emerald-600",
      badge: "bg-emerald-600",
    },
    amber: {
      card: "border-amber-100",
      header: "bg-amber-50 text-amber-600",
      badge: "bg-amber-600",
    },
    rose: {
      card: "border-rose-100",
      header: "bg-rose-50 text-rose-600",
      badge: "bg-rose-600",
    },
    violet: {
      card: "border-violet-100",
      header: "bg-violet-50 text-violet-600",
      badge: "bg-violet-600",
    },
    slate: {
      card: "border-slate-100",
      header: "bg-slate-50 text-slate-600",
      badge: "bg-slate-600",
    },
  };
  const c = colors[accentColor] ?? colors.blue;
  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${c.card}`}
    >
      <div
        className={`flex items-center gap-3 px-6 py-4 border-b border-gray-100 ${c.header}`}
      >
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${c.badge}`}
        >
          {number}
        </div>
        <div className="w-5 h-5 flex items-center justify-center ">
          <Icon size={15} />
        </div>
        <h3 className="text-sm font-bold text-gray-800 tracking-tight ">
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Cb({ label, path, disabled = false, form, toggle }) {
  const isChecked = path.reduce((a, k) => a?.[k] ?? false, form);
  return (
    <label
      className={`inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all duration-150 select-none ${
        disabled
          ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200"
          : isChecked
            ? "bg-blue-50 border-blue-300 text-blue-800 shadow-sm"
            : "bg-white border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50/30"
      }`}
    >
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
          isChecked ? "bg-blue-600 border-blue-600" : "border-gray-300"
        } ${disabled ? "border-gray-300" : ""}`}
      >
        {isChecked && (
          <CheckCircle2 size={10} className="text-white" strokeWidth={3} />
        )}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

function InlineInput({
  value,
  onChange,
  placeholder,
  className = "",
  required,
  ...rest
}) {
  return (
    <input
      required={required}
      type="text"
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition text-gray-600 ${className}`}
      {...rest}
    />
  );
}

function SubCard({ title, active, accentColor = "blue", children }) {
  const styles = {
    blue: { active: "bg-blue-50 border-blue-300", dot: "bg-blue-500" },
    green: { active: "bg-green-50 border-green-300", dot: "bg-green-500" },
  };
  const s = styles[accentColor] ?? styles.blue;
  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${active ? s.active : "border-gray-200 bg-gray-50"}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-2 h-2 rounded-full ${active ? s.dot : "bg-gray-300"}`}
        />
        <span className="text-sm font-semibold text-gray-700">{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════
   DATAFORM
══════════════════════════════════════════ */
export default function DataForm({
  initialForm = null,
  mode = "create",
  condominioId = null,
}) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [loading, setLoading] = useState(false);
  const [creatingPdf, setCreatingPdf] = useState(false);
  const [loadingBozza, setLoadingBozza] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const isEdit = mode === "edit";

  const openAuthModal = (type) => {
    setSelectedType(type);
    setShowAuthModal(true);
  };
  const closeAuthModal = (withAuth) => {
    if (selectedType) {
      update(["sezione03", "elettronica", selectedType, "checked"], true);
      update(
        ["sezione03", "elettronica", selectedType, "autenticazione"],
        withAuth,
      );
      update(
        ["sezione03", "elettronica", selectedType, "noAutenticazione"],
        !withAuth,
      );
    }
    setShowAuthModal(false);
    setSelectedType(null);
  };

  const defaultForm = {
    intestazione: {
      data: new Date().toISOString().split("T")[0],
      condominio: "",
      condominio_indirizzo: "",
      citta: "",
      cap: "",
      provincia: "",
      cfCondominio: "",
    },
    sezione01: {
      nessunDipendente: false,
      portiere: { checked: false, numero: "" },
      pulizie: { checked: false, numero: "" },
      giardiniere: { checked: false, numero: "" },
      manutentore: { checked: false, numero: "" },
      isAltro: false,
      altro: "",
    },
    sezione02: {
      portierato: false,
      consulenteLavoro: false,
      videosorveglianza: false,
      letturaContatori: false,
      rspp: false,
      isAltro: false,
      altro: "",
    },
    sezione03: {
      elettronica: {
        enabled: false,
        serverLocale: {
          checked: false,
          autenticazione: false,
          noAutenticazione: false,
          password: false,
          isAltro: false,
          altro: "",
        },
        cloud: {
          checked: false,
          autenticazione: false,
          noAutenticazione: false,
          password: false,
          isAltro: false,
          altro: "",
        },
      },
      cartacea: { enabled: false, archivio: false, isAltro: false, altro: "" },
      sicurezza: {
        armadio: false,
        backup: false,
        password: false,
        cambioPassword: false,
        antivirus: false,
        firewall: false,
        screensaver: false,
        isAltro: false,
        altro: "",
      },
    },
    sezione04: false,
    sezione05: {
      amministratore: `${user?.name ?? ""} ${user?.cognome ?? ""}`.trim(),
      specifica: user?.ragione_sociale ?? "",
    },
    sezione06: {
      dipendenti: false,
      fornitori: false,
      isAltro: false,
      altro: "",
    },
    sezione07: {
      indirizzoStudio: [
        user?.indirizzo_studio,
        user?.cap_studio,
        user?.citta_studio,
        user?.pr_studio,
      ]
        .filter(Boolean)
        .join(" "),
      sedeLegale: [
        user?.sede_legale,
        user?.cap_legale,
        user?.citta_legale,
        user?.pr_legale,
      ]
        .filter(Boolean)
        .join(" "),
      sedeOperativa: [
        user?.sede_operativa,
        user?.cap_operativa,
        user?.citta_operativa,
        user?.pr_operativa,
      ]
        .filter(Boolean)
        .join(" "),
      codiceUnivoco: user?.codice_univoco || "",
    },
    sezione071: false,
    sezione0711: { valore: false, note: "" },
    sezione8: { addedFornitori: [] },
  };

  const merge = (base, override) =>
    override ? { ...base, ...override } : base;

  const [form, setForm] = useState(() => {
    if (!initialForm) return defaultForm;
    return {
      ...defaultForm,
      ...initialForm,
      sezione01: merge(defaultForm.sezione01, initialForm.sezione01),
      sezione02: merge(defaultForm.sezione02, initialForm.sezione02),
      sezione03: merge(defaultForm.sezione03, initialForm.sezione03),
      sezione05: merge(defaultForm.sezione05, initialForm.sezione05),
      sezione06: merge(defaultForm.sezione06, initialForm.sezione06),
      sezione07: merge(defaultForm.sezione07, initialForm.sezione07),
      sezione0711: merge(defaultForm.sezione0711, initialForm.sezione0711),
      sezione8: merge(defaultForm.sezione8, initialForm.sezione8),
    };
  });

  const resetForm = () => {
    setForm(defaultForm);
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    if (!initialForm) return;
    setForm((prev) => ({
      ...prev,
      ...defaultForm,
      ...initialForm,
      sezione01: merge(defaultForm.sezione01, initialForm.sezione01),
      sezione02: merge(defaultForm.sezione02, initialForm.sezione02),
      sezione03: merge(defaultForm.sezione03, initialForm.sezione03),
      sezione05: merge(defaultForm.sezione05, initialForm.sezione05),
      sezione06: merge(defaultForm.sezione06, initialForm.sezione06),
      sezione07: merge(defaultForm.sezione07, initialForm.sezione07),
      sezione0711: merge(defaultForm.sezione0711, initialForm.sezione0711),
      sezione8: merge(defaultForm.sezione8, initialForm.sezione8),
    }));
  }, [initialForm]);

  useEffect(() => {
    setLoading(true);
    if (mode === "edit" && condominioId) {
      fetch(`/api/get-condominio-fornitori?condominioId=${condominioId}`)
        .then(async (res) => {
          const t = await res.text();
          try {
            return JSON.parse(t);
          } catch {
            return { fornitori: [] };
          }
        })
        .then((data) => {
          if (data?.fornitori) {
            setForm((prev) => ({
              ...prev,
              sezione8: { ...prev.sezione8, addedFornitori: data.fornitori },
            }));
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [mode, condominioId]);

  const update = (path, value) => {
    if (!Array.isArray(path) || path.length === 0) return;
    setForm((prev) => {
      const copy = structuredClone(prev);
      let ref = copy;
      path.slice(0, -1).forEach((k) => {
        if (
          ref[k] === null ||
          typeof ref[k] !== "object" ||
          Array.isArray(ref[k])
        )
          ref[k] = {};
        ref = ref[k];
      });
      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  const toggle = (path) =>
    update(path, !path.reduce((a, k) => a?.[k] ?? false, form));

  const resetSezione03 = () => {
    ["serverLocale", "cloud"].forEach((type) => {
      [
        "checked",
        "autenticazione",
        "noAutenticazione",
        "password",
        "isAltro",
      ].forEach((k) => update(["sezione03", "elettronica", type, k], false));
      update(["sezione03", "elettronica", type, "altro"], "");
    });
  };

  const saveDraft = async () => {
    setLoadingBozza(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/save-condominio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, form, condominioId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante il salvataggio");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Errore durante il salvataggio");
    } finally {
      setLoadingBozza(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setCreatingPdf(true);
    try {
      const res = await fetch("/api/submit-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, form, condominioId }),
      });
      const data = await res.json();
      if (data.error) {
        setCreatingPdf(false);
        setError(data.error);
        return;
      }
      setSuccess("Modulo salvato con successo!");
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch (err) {
      setError(`Errore: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Caricamento...</p>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-red-500 font-medium">Utente non loggato</p>
      </div>
    );

  const sicurezzaLabels = {
    armadio: "Armadio sicuro",
    backup: "Backup",
    password: "Password",
    cambioPassword: "Cambio password",
    antivirus: "Antivirus",
    firewall: "Firewall",
    screensaver: "Screensaver",
  };

  const sez02Labels = {
    portierato: "Portierato",
    consulenteLavoro: "Consulente del lavoro",
    videosorveglianza: "Videosorveglianza",
    letturaContatori: "Lettura contatori",
    rspp: "RSPP",
  };

  return (
    <DashboardLayout>
      {/* ── Overlay generazione PDF ── */}
      {creatingPdf && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-sm w-full p-10 text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30">
              <FilePen className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Generazione documenti
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Attendere, non chiudere la pagina...
            </p>
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 max-w-4xl mx-auto pb-28">
        {/* ── Page header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
              {mode === "edit" ? "Modifica" : "Nuovo"} documento
            </p>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Check-list Privacy
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Compila tutte le sezioni per generare la documentazione
          </p>
        </div>

        {/* ── Feedback ── */}
        {error && (
          <div className="mb-6 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
            <CheckCircle2 size={15} className="shrink-0" />
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`flex flex-col gap-5 ${creatingPdf || loading ? "opacity-50 pointer-events-none" : ""}`}
        >
          {/* ── INTESTAZIONE ── */}
          <SectionCard
            number="0"
            title="Intestazione"
            icon={Building2}
            accentColor="slate"
          >
            <fieldset disabled={mode === "edit"}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Data */}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Data
                  </label>
                  <input
                    type="date"
                    value={form.intestazione.data}
                    onChange={(e) =>
                      update(["intestazione", "data"], e.target.value)
                    }
                    className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm text-gray-600
focus:outline-none focus:ring-2 focus:ring-blue-500

disabled:bg-gray-100
disabled:border-gray-300
disabled:text-gray-500
disabled:cursor-not-allowed
disabled:shadow-none"
                  />
                </div>
                {/* Condominio */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ">
                    Nome Condominio *
                  </label>
                  <InlineInput
                    value={form.intestazione.condominio}
                    className="disabled:bg-gray-100
disabled:border-gray-300
disabled:text-gray-500
disabled:cursor-not-allowed
disabled:shadow-none"
                    required
                    onChange={(e) =>
                      update(["intestazione", "condominio"], e.target.value)
                    }
                    placeholder="es. Condominio Primavera"
                  />
                </div>
                {/* Indirizzo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Indirizzo *
                  </label>
                  <InlineInput
                    className="disabled:bg-gray-100
disabled:border-gray-300
disabled:text-gray-500
disabled:cursor-not-allowed
disabled:shadow-none"
                    value={form.intestazione.condominio_indirizzo}
                    required
                    onChange={(e) =>
                      update(
                        ["intestazione", "condominio_indirizzo"],
                        e.target.value,
                      )
                    }
                    placeholder="Via Roma, 8"
                  />
                </div>
                {/* Città */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Città *
                  </label>
                  <InlineInput
                    className="disabled:bg-gray-100
disabled:border-gray-300
disabled:text-gray-500
disabled:cursor-not-allowed
disabled:shadow-none"
                    required
                    value={form.intestazione.citta}
                    onChange={(e) =>
                      update(["intestazione", "citta"], e.target.value)
                    }
                    placeholder="Roma"
                  />
                </div>
                {/* Provincia */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Provincia *
                  </label>
                  <select
                    value={form.intestazione.provincia ?? ""}
                    required
                    onChange={(e) =>
                      update(["intestazione", "provincia"], e.target.value)
                    }
                    className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleziona...</option>
                    {provinceItaliane.map((p) => (
                      <option key={p.sigla} value={p.sigla}>
                        {p.nome} ({p.sigla})
                      </option>
                    ))}
                  </select>
                </div>
                {/* CAP */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    CAP
                  </label>
                  <InlineInput
                    value={form.intestazione.cap}
                    className="disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    onChange={(e) =>
                      update(
                        ["intestazione", "cap"],
                        e.target.value.replace(/\D/g, "").slice(0, 5),
                      )
                    }
                    placeholder="00100"
                  />
                </div>
                {/* CF */}
                <div className="flex flex-col gap-1.5 md:col-span-3">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Codice Fiscale Condominio *
                  </label>
                  <InlineInput
                    value={form.intestazione.cfCondominio}
                    onChange={(e) =>
                      update(
                        ["intestazione", "cfCondominio"],
                        e.target.value.toUpperCase().slice(0, 11),
                      )
                    }
                    placeholder="12345678901"
                    className="max-w-xs disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </fieldset>
          </SectionCard>

          {/* ── SEZ. 01 – DIPENDENTI ── */}
          <SectionCard
            number="01"
            title="Dipendenti Condominiali"
            icon={Users}
            accentColor="blue"
          >
            <div className="flex flex-wrap items-center gap-2">
              {/* Nessun dipendente */}
              <label
                className={`inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                  form.sezione01.nessunDipendente
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-white border-gray-200 hover:border-red-200"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all  ${
                    form.sezione01.nessunDipendente
                      ? "bg-red-500 border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  {form.sezione01.nessunDipendente && (
                    <CheckCircle2
                      size={10}
                      className="text-white"
                      strokeWidth={3}
                    />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.sezione01.nessunDipendente}
                  onChange={() => {
                    const v = !form.sezione01.nessunDipendente;
                    update(["sezione01", "nessunDipendente"], v);
                    if (v) {
                      [
                        "portiere",
                        "pulizie",
                        "giardiniere",
                        "manutentore",
                      ].forEach((r) => {
                        update(["sezione01", r, "checked"], false);
                        update(["sezione01", r, "numero"], "");
                      });
                      update(["sezione01", "altro"], "");
                      update(["sezione01", "isAltro"], false);
                    }
                  }}
                />
                <span className="text-sm font-medium text-gray-600">
                  Nessun dipendente
                </span>
              </label>

              {/* Ruoli */}
              {["portiere", "pulizie", "giardiniere", "manutentore"].map(
                (role) => {
                  const r = form.sezione01[role];
                  const disabled = form.sezione01.nessunDipendente;
                  return (
                    <div key={role} className="flex items-center gap-1.5">
                      <label
                        className={`inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                          disabled
                            ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200"
                            : r.checked
                              ? "bg-blue-50 border-blue-300 text-blue-800"
                              : "bg-white border-gray-200 hover:border-blue-200 text-gray-600"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                            r.checked
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300 "
                          }`}
                        >
                          {r.checked && (
                            <CheckCircle2
                              size={10}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          disabled={disabled}
                          checked={r.checked}
                          onChange={() => {
                            const nc = !r.checked;
                            update(["sezione01", role, "checked"], nc);
                            update(
                              ["sezione01", role, "numero"],
                              nc ? "1" : "",
                            );
                            if (nc)
                              update(["sezione01", "nessunDipendente"], false);
                          }}
                        />
                        <span className="text-sm font-medium capitalize">
                          {role}
                        </span>
                      </label>
                      {r.checked && !disabled && (
                        <input
                          type="number"
                          min={1}
                          value={r.numero}
                          onChange={(e) =>
                            update(
                              ["sezione01", role, "numero"],
                              Math.max(
                                1,
                                Number(e.target.value) || 1,
                              ).toString(),
                            )
                          }
                          className="w-16 px-2 py-2 bg-white border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-600"
                        />
                      )}
                    </div>
                  );
                },
              )}

              {/* Altro */}
              {/* Altro */}
              <label
                className={`inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                  form.sezione01.nessunDipendente
                    ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200"
                    : form.sezione01.isAltro || !!form.sezione01.altro // ← aggiunto
                      ? "bg-blue-50 border-blue-300 text-blue-800"
                      : "bg-white border-gray-200 hover:border-blue-200"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    form.sezione01.isAltro || !!form.sezione01.altro // ← aggiunto
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {(form.sezione01.isAltro || !!form.sezione01.altro) && ( // ← aggiunto
                    <CheckCircle2
                      size={10}
                      className="text-white"
                      strokeWidth={3}
                    />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  disabled={form.sezione01.nessunDipendente}
                  checked={form.sezione01.isAltro || !!form.sezione01.altro}
                  onChange={(e) =>
                    update(["sezione01", "isAltro"], e.target.checked)
                  }
                />
                <span className="text-sm font-medium text-gray-600">Altro</span>
              </label>

              {/* Mostra input se isAltro O se altro ha già un valore (es. in edit) */}
              {(form.sezione01.isAltro || !!form.sezione01.altro) && ( // ← aggiunto
                <InlineInput
                  value={form.sezione01.altro}
                  onChange={(e) => {
                    update(["sezione01", "altro"], e.target.value);
                    if (!e.target.value)
                      update(["sezione01", "isAltro"], false);
                  }}
                  placeholder="Specificare..."
                  className="w-40"
                />
              )}
            </div>
          </SectionCard>

          {/* ── SEZ. 02 – CONTRATTI ── */}
          <SectionCard
            number="02"
            title="Contratti / Fornitori"
            icon={Briefcase}
            accentColor="indigo"
          >
            <div className="flex flex-wrap gap-2">
              {Object.entries(sez02Labels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(["sezione02", key])}
                  className={`inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
                    form.sezione02[key]
                      ? "bg-indigo-50 border-indigo-300 text-indigo-800"
                      : "bg-white border-gray-200 hover:border-indigo-200 text-gray-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      form.sezione02[key]
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300"
                    }`}
                  >
                    {form.sezione02[key] && (
                      <CheckCircle2
                        size={10}
                        className="text-white"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  update(["sezione02", "isAltro"], !form.sezione02.isAltro)
                }
                className={`inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
                  form.sezione02.isAltro || !!form.sezione02.altro
                    ? "bg-indigo-50 border-indigo-300 text-indigo-800"
                    : "bg-white border-gray-200 hover:border-indigo-200 text-gray-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    form.sezione02.isAltro || !!form.sezione02.altro
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-gray-300"
                  }`}
                >
                  {(form.sezione02.isAltro || !!form.sezione02.altro) && (
                    <CheckCircle2
                      size={10}
                      className="text-white"
                      strokeWidth={3}
                    />
                  )}
                </div>
                <span className="text-sm font-medium">Altro</span>
              </button>
              {(form.sezione02.isAltro || !!form.sezione02.altro) && (
                <InlineInput
                  value={form.sezione02.altro}
                  onChange={(e) => {
                    update(["sezione02", "altro"], e.target.value);
                    if (!e.target.value)
                      update(["sezione02", "isAltro"], false);
                  }}
                  placeholder="Specificare..."
                  className="w-48"
                />
              )}
            </div>
          </SectionCard>

          {/* ── SEZ. 03 – TRATTAMENTO DATI ── */}
          <SectionCard
            number="03"
            title="Modalità di Trattamento Dati"
            icon={Shield}
            accentColor="emerald"
          >
            <div className="flex flex-col gap-4">
              {/* Elettronica */}
              <div
                className={`rounded-xl border-2 p-4 transition-all ${
                  form.sezione03.elettronica.enabled
                    ? "border-blue-200 bg-blue-50/30"
                    : "border-gray-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    const v = !form.sezione03.elettronica.enabled;
                    update(["sezione03", "elettronica", "enabled"], v);

                    // ✅ Resetta tutti i campi interni
                    if (!v) resetSezione03();
                  }}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        form.sezione03.elettronica.enabled
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {form.sezione03.elettronica.enabled && (
                        <CheckCircle2
                          size={12}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Server
                        size={15}
                        className={
                          form.sezione03.elettronica.enabled
                            ? "text-blue-600"
                            : "text-gray-400"
                        }
                      />
                      <span
                        className={`font-semibold text-sm ${form.sezione03.elettronica.enabled ? "text-blue-800" : "text-gray-700"}`}
                      >
                        Elettronica
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${form.sezione03.elettronica.enabled ? "rotate-180" : ""}`}
                  />
                </button>

                {form.sezione03.elettronica.enabled && (
                  <div className="mt-4 flex flex-col gap-3">
                    {/* Server Locale */}
                    <SubCard
                      title="Server Locale"
                      active={form.sezione03.elettronica.serverLocale.checked}
                      accentColor="blue"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const nc =
                            !form.sezione03.elettronica.serverLocale.checked;
                          update(
                            [
                              "sezione03",
                              "elettronica",
                              "serverLocale",
                              "checked",
                            ],
                            nc,
                          );
                          if (!nc) {
                            [
                              "autenticazione",
                              "noAutenticazione",
                              "password",
                              "isAltro",
                            ].forEach((k) =>
                              update(
                                ["sezione03", "elettronica", "serverLocale", k],
                                false,
                              ),
                            );
                            update(
                              [
                                "sezione03",
                                "elettronica",
                                "serverLocale",
                                "altro",
                              ],
                              "",
                            );
                          }
                        }}
                        className={`w-full text-left mb-3 flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
                          form.sezione03.elettronica.serverLocale.checked
                            ? "bg-blue-100 border-blue-300"
                            : "bg-white border-gray-200 hover:border-blue-200"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            form.sezione03.elettronica.serverLocale.checked
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {form.sezione03.elettronica.serverLocale.checked && (
                            <CheckCircle2
                              size={10}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <Server size={13} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">
                          Abilita Server Locale
                        </span>
                      </button>

                      {form.sezione03.elettronica.serverLocale.checked && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[
                            {
                              path: [
                                "sezione03",
                                "elettronica",
                                "serverLocale",
                                "autenticazione",
                              ],
                              label: "Con autenticazione",
                              disabled:
                                form.sezione03.elettronica.serverLocale
                                  .noAutenticazione,
                            },
                            {
                              path: [
                                "sezione03",
                                "elettronica",
                                "serverLocale",
                                "noAutenticazione",
                              ],
                              label: "Senza autenticazione",
                              disabled:
                                form.sezione03.elettronica.serverLocale
                                  .autenticazione,
                            },
                            {
                              path: [
                                "sezione03",
                                "elettronica",
                                "serverLocale",
                                "password",
                              ],
                              label: "Password",
                              disabled: false,
                            },
                          ].map(({ path, label, disabled: d }) => (
                            <button
                              key={label}
                              type="button"
                              disabled={d}
                              onClick={() => toggle(path)}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                d
                                  ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200"
                                  : path.reduce((a, k) => a?.[k] ?? false, form)
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "bg-white border-gray-200 hover:border-blue-300 text-gray-700"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "serverLocale",
                                  "isAltro",
                                ],
                                !form.sezione03.elettronica.serverLocale
                                  .isAltro,
                              )
                            }
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              form.sezione03.elettronica.serverLocale.isAltro ||
                              !!form.sezione03.elettronica.serverLocale.altro
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white border-gray-200 hover:border-blue-300 text-gray-700"
                            }`}
                          >
                            Altro
                          </button>
                          {(form.sezione03.elettronica.serverLocale.isAltro ||
                            !!form.sezione03.elettronica.serverLocale
                              .altro) && (
                            <InlineInput
                              value={
                                form.sezione03.elettronica.serverLocale.altro
                              }
                              onChange={(e) => {
                                update(
                                  [
                                    "sezione03",
                                    "elettronica",
                                    "serverLocale",
                                    "altro",
                                  ],
                                  e.target.value,
                                );
                                if (!e.target.value)
                                  update(
                                    [
                                      "sezione03",
                                      "elettronica",
                                      "serverLocale",
                                      "isAltro",
                                    ],
                                    false,
                                  );
                              }}
                              placeholder="Specificare..."
                              className="text-xs py-1.5 w-36"
                            />
                          )}
                        </div>
                      )}
                    </SubCard>

                    {/* Cloud */}
                    <SubCard
                      title="Cloud"
                      active={form.sezione03.elettronica.cloud.checked}
                      accentColor="green"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const nc = !form.sezione03.elettronica.cloud.checked;
                          update(
                            ["sezione03", "elettronica", "cloud", "checked"],
                            nc,
                          );
                          if (!nc) {
                            [
                              "autenticazione",
                              "noAutenticazione",
                              "password",
                              "isAltro",
                            ].forEach((k) =>
                              update(
                                ["sezione03", "elettronica", "cloud", k],
                                false,
                              ),
                            );
                            update(
                              ["sezione03", "elettronica", "cloud", "altro"],
                              "",
                            );
                          }
                        }}
                        className={`w-full text-left mb-3 flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
                          form.sezione03.elettronica.cloud.checked
                            ? "bg-emerald-100 border-emerald-300"
                            : "bg-white border-gray-200 hover:border-emerald-200"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            form.sezione03.elettronica.cloud.checked
                              ? "bg-emerald-600 border-emerald-600"
                              : "border-gray-300"
                          }`}
                        >
                          {form.sezione03.elettronica.cloud.checked && (
                            <CheckCircle2
                              size={10}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <Cloud size={13} className="text-emerald-600" />
                        <span className="text-sm font-medium text-gray-600">
                          Abilita Cloud
                        </span>
                      </button>

                      {form.sezione03.elettronica.cloud.checked && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[
                            {
                              path: [
                                "sezione03",
                                "elettronica",
                                "cloud",
                                "autenticazione",
                              ],
                              label: "Con autenticazione",
                              disabled:
                                form.sezione03.elettronica.cloud
                                  .noAutenticazione,
                            },
                            {
                              path: [
                                "sezione03",
                                "elettronica",
                                "cloud",
                                "noAutenticazione",
                              ],
                              label: "Senza autenticazione",
                              disabled:
                                form.sezione03.elettronica.cloud.autenticazione,
                            },
                            {
                              path: [
                                "sezione03",
                                "elettronica",
                                "cloud",
                                "password",
                              ],
                              label: "Password",
                              disabled: false,
                            },
                          ].map(({ path, label, disabled: d }) => (
                            <button
                              key={label}
                              type="button"
                              disabled={d}
                              onClick={() => toggle(path)}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                d
                                  ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200"
                                  : path.reduce((a, k) => a?.[k] ?? false, form)
                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                    : "bg-white border-gray-200 hover:border-emerald-300 text-gray-700"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "cloud",
                                  "isAltro",
                                ],
                                !form.sezione03.elettronica.cloud.isAltro,
                              )
                            }
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              form.sezione03.elettronica.cloud.isAltro ||
                              !!form.sezione03.elettronica.cloud.altro
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-white border-gray-200 hover:border-emerald-300 text-gray-700"
                            }`}
                          >
                            Altro
                          </button>
                          {(form.sezione03.elettronica.cloud.isAltro ||
                            !!form.sezione03.elettronica.cloud.altro) && (
                            <InlineInput
                              value={form.sezione03.elettronica.cloud.altro}
                              onChange={(e) => {
                                update(
                                  [
                                    "sezione03",
                                    "elettronica",
                                    "cloud",
                                    "altro",
                                  ],
                                  e.target.value,
                                );
                                if (!e.target.value) {
                                  ([
                                    "sezione03",
                                    "elettronica",
                                    "cloud",
                                    "isAltro",
                                  ],
                                    false);
                                }
                              }}
                              placeholder="Specificare..."
                              className="text-xs py-1.5 w-36"
                            />
                          )}
                        </div>
                      )}
                    </SubCard>
                  </div>
                )}
              </div>

              {/* Cartacea */}
              <div
                className={`rounded-xl border-2 p-4 transition-all ${
                  form.sezione03.cartacea.enabled
                    ? "border-amber-200 bg-amber-50/30"
                    : "border-gray-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    const v = !form.sezione03.cartacea.enabled;
                    update(["sezione03", "cartacea", "enabled"], v);

                    // ✅ Resetta SEMPRE i campi interni quando si disabilita
                    if (!v) {
                      update(["sezione03", "cartacea", "archivio"], false);
                      update(["sezione03", "cartacea", "isAltro"], false);
                      update(["sezione03", "cartacea", "altro"], "");
                    }
                  }}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        form.sezione03.cartacea.enabled
                          ? "bg-amber-500 border-amber-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {form.sezione03.cartacea.enabled && (
                        <CheckCircle2
                          size={12}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <FileText
                      size={15}
                      className={
                        form.sezione03.cartacea.enabled
                          ? "text-amber-600"
                          : "text-gray-400"
                      }
                    />
                    <span
                      className={`font-semibold text-sm ${form.sezione03.cartacea.enabled ? "text-amber-800" : "text-gray-700"}`}
                    >
                      Cartacea
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${form.sezione03.cartacea.enabled ? "rotate-180" : ""}`}
                  />
                </button>

                {form.sezione03.cartacea.enabled && (
                  <div className="mt-3 pt-3 border-t border-amber-100">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Archivio cartaceo tenuto presso:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toggle(["sezione03", "cartacea", "archivio"])
                        }
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          form.sezione03.cartacea.archivio
                            ? "bg-amber-500 border-amber-500 text-white"
                            : "bg-white border-gray-200 hover:border-amber-300 text-gray-700"
                        }`}
                      >
                        Sede amministratore
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            ["sezione03", "cartacea", "isAltro"],
                            !form.sezione03.cartacea.isAltro,
                          )
                        }
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          form.sezione03.cartacea.isAltro ||
                          !!form.sezione03.cartacea.altro
                            ? "bg-amber-500 border-amber-500 text-white"
                            : "bg-white border-gray-200 hover:border-amber-300 text-gray-700"
                        }`}
                      >
                        Altro
                      </button>
                      {(form.sezione03.cartacea.isAltro ||
                        !!form.sezione03.cartacea.altro) && (
                        <InlineInput
                          value={form.sezione03.cartacea.altro}
                          onChange={(e) => {
                            update(
                              ["sezione03", "cartacea", "altro"],
                              e.target.value,
                            );
                            if (!e.target.value)
                              update(
                                ["sezione03", "cartacea", "isAltro"],
                                false,
                              );
                          }}
                          placeholder="Specificare..."
                          className="text-xs py-1.5 w-40"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sicurezza */}
              <div className="rounded-xl border-2 border-gray-200 p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Shield size={12} />
                  Misure di sicurezza adottate
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(sicurezzaLabels).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => toggle(["sezione03", "sicurezza", k])}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        form.sezione03.sicurezza[k]
                          ? "bg-slate-700 border-slate-700 text-white"
                          : "bg-white border-gray-200 hover:border-slate-300 text-gray-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        ["sezione03", "sicurezza", "isAltro"],
                        !form.sezione03.sicurezza.isAltro,
                      )
                    }
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      form.sezione03.sicurezza.isAltro ||
                      !!form.sezione03.sicurezza.altro
                        ? "bg-slate-700 border-slate-700 text-white"
                        : "bg-white border-gray-200 hover:border-slate-300 text-gray-700"
                    }`}
                  >
                    Altro
                  </button>
                  {(form.sezione03.sicurezza.isAltro ||
                    !!form.sezione03.sicurezza.altro) && (
                    <InlineInput
                      value={form.sezione03.sicurezza.altro}
                      onChange={(e) => {
                        update(
                          ["sezione03", "sicurezza", "altro"],
                          e.target.value,
                        );
                        if (!e.target.value)
                          (update[("sezione03", "sicurezza", "isAltro")],
                            false);
                      }}
                      placeholder="Specificare..."
                      className="text-xs py-1.5 w-40"
                    />
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── SEZ. 04 ── */}
          <SectionCard
            number="04"
            title="Piattaforme Web"
            icon={Cloud}
            accentColor="blue"
          >
            <button
              type="button"
              onClick={() => toggle(["sezione04"])}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all ${
                form.sezione04
                  ? "bg-blue-50 border-blue-300 text-blue-800"
                  : "bg-white border-gray-200 hover:border-blue-200 text-gray-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  form.sezione04
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-300"
                }`}
              >
                {form.sezione04 && (
                  <CheckCircle2
                    size={10}
                    className="text-white"
                    strokeWidth={3}
                  />
                )}
              </div>
              <span className="text-sm font-medium">
                Il condominio utilizza piattaforme per assemblee online
              </span>
            </button>
          </SectionCard>

          {/* ── SEZ. 05 ── */}
          <SectionCard
            number="05"
            title="Nomina Responsabile"
            icon={UserCheck}
            accentColor="indigo"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Responsabile *
                </label>
                <InlineInput
                  value={form.sezione05?.amministratore}
                  onChange={(e) =>
                    update(["sezione05", "amministratore"], e.target.value)
                  }
                  placeholder="Nome amministratore"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Ragione Sociale
                </label>
                <InlineInput
                  value={form.sezione05?.specifica}
                  onChange={(e) =>
                    update(["sezione05", "specifica"], e.target.value)
                  }
                  placeholder="es. Studio Rossi"
                />
              </div>
            </div>
          </SectionCard>

          {/* ── SEZ. 06 ── */}
          <SectionCard
            number="06"
            title="Autorizzati al Trattamento"
            icon={Users}
            accentColor="violet"
          >
            <div className="flex flex-wrap gap-2">
              {["dipendenti", "fornitori"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(["sezione06", key])}
                  className={`inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all capitalize ${
                    form.sezione06[key]
                      ? "bg-violet-50 border-violet-300 text-violet-800"
                      : "bg-white border-gray-200 hover:border-violet-200 text-gray-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      form.sezione06[key]
                        ? "bg-violet-600 border-violet-600"
                        : "border-gray-300"
                    }`}
                  >
                    {form.sezione06[key] && (
                      <CheckCircle2
                        size={10}
                        className="text-white"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium capitalize">{key}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  update(["sezione06", "isAltro"], !form.sezione06.isAltro)
                }
                className={`inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
                  form.sezione06.isAltro
                    ? "bg-violet-50 border-violet-300 text-violet-800"
                    : "bg-white border-gray-200 hover:border-violet-200 text-gray-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    form.sezione06.isAltro || !!form.sezione06.altro
                      ? "bg-violet-600 border-violet-600"
                      : "border-gray-300"
                  }`}
                >
                  {(form.sezione06.isAltro || !!form.sezione06.altro) && (
                    <CheckCircle2
                      size={10}
                      className="text-white"
                      strokeWidth={3}
                    />
                  )}
                </div>
                <span className="text-sm font-medium">Altro</span>
              </button>
              {(form.sezione06.isAltro || !!form.sezione06.altro) && (
                <InlineInput
                  value={form.sezione06.altro}
                  onChange={(e) => {
                    update(["sezione06", "altro"], e.target.value);
                    if (!e.target.value)
                      update(["sezione06", "isAltro"], false);
                  }}
                  placeholder="Specificare..."
                  className="w-48"
                />
              )}
            </div>
          </SectionCard>

          {/* ── SEZ. 07 ── */}
          <SectionCard
            number="07"
            title="Studio Amministratore"
            icon={MapPin}
            accentColor="emerald"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "indirizzoStudio", label: "Indirizzo Studio" },
                { key: "sedeLegale", label: "Sede Legale" },
                { key: "sedeOperativa", label: "Sede Operativa" },
                { key: "codiceUnivoco", label: "Codice Univoco" },
              ].map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    {label}
                  </label>
                  <InlineInput
                    value={form.sezione07?.[key]}
                    onChange={(e) => update(["sezione07", key], e.target.value)}
                    placeholder={label}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── SEZ. 07.1 ── */}
          <SectionCard
            number="07.1"
            title="Videosorveglianza"
            icon={Camera}
            accentColor="rose"
          >
            <button
              type="button"
              onClick={() => toggle(["sezione071"])}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all ${
                form.sezione071
                  ? "bg-rose-50 border-rose-300 text-rose-800"
                  : "bg-white border-gray-200 hover:border-rose-200 text-gray-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  form.sezione071
                    ? "bg-rose-600 border-rose-600"
                    : "border-gray-300"
                }`}
              >
                {form.sezione071 && (
                  <CheckCircle2
                    size={10}
                    className="text-white"
                    strokeWidth={3}
                  />
                )}
              </div>
              <span className="text-sm font-medium">
                Presenza videosorveglianza
              </span>
            </button>
          </SectionCard>

          {/* ── SEZ. 07.1.1 ── */}
          <SectionCard
            number="07.1.1"
            title="Ispettorato del Lavoro"
            icon={Briefcase}
            accentColor="amber"
          >
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => toggle(["sezione0711", "valore"])}
                className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all w-fit ${
                  form.sezione0711?.valore
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-white border-gray-200 hover:border-amber-200 text-gray-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    form.sezione0711?.valore
                      ? "bg-amber-500 border-amber-500"
                      : "border-gray-300"
                  }`}
                >
                  {form.sezione0711?.valore && (
                    <CheckCircle2
                      size={10}
                      className="text-white"
                      strokeWidth={3}
                    />
                  )}
                </div>
                <span className="text-sm font-medium">
                  Autorizzazione richiesta
                </span>
              </button>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Note
                </label>
                <textarea
                  value={form.sezione0711?.note ?? ""}
                  onChange={(e) =>
                    update(["sezione0711", "note"], e.target.value)
                  }
                  placeholder="Note aggiuntive..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm resize-none transition"
                />
              </div>
            </div>
          </SectionCard>

          {/* ── SEZ. 08 – FORNITORI ── */}
          <SectionCard
            number="08"
            title="Fornitori"
            icon={Briefcase}
            accentColor="slate"
          >
            <FornitoriSection
              addedFornitori={
                Array.isArray(form.sezione8?.addedFornitori)
                  ? form.sezione8.addedFornitori
                  : []
              }
              setAddedFornitori={(list) =>
                update(["sezione8", "addedFornitori"], list)
              }
              userId={user.id}
            />
          </SectionCard>

          {/* ── Submit bar ── */}
          <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
            <p className="text-xs text-gray-400 hidden sm:block">
              Salva bozza per continuare dopo, oppure genera i documenti finali
            </p>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={saveDraft}
                disabled={loadingBozza}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-60"
              >
                {loadingBozza ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Salva bozza
                  </>
                )}
              </button>
              <button
                type="submit"
                disabled={loading || creatingPdf}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Generazione...
                  </>
                ) : (
                  <>
                    <FileCheck size={14} />
                    Salva e crea documenti
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── FABs ── */}
      <button
        type="button"
        onClick={() => {
          if (confirm("Vuoi svuotare il documento?")) resetForm();
        }}
        title="Reset form"
        className="fixed bottom-6 right-24 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-800 text-white shadow-xl transition-all"
      >
        <RefreshCw size={18} />
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm("Vuoi tornare alla Home senza salvare?"))
            router.push("/dashboard");
        }}
        title="Torna alla Home"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl transition-all"
      >
        <Home size={18} />
      </button>
    </DashboardLayout>
  );
}
