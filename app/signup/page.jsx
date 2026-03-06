"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  User,
  Users,
  Building2,
  MapPin,
  Hash,
  Mail,
  Phone,
  FileDigit,
  Lock,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  KeyRound,
  ClipboardCopy,
  Copy,
  ArrowLeft,
  Home,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import {
  Field,
  SectionCard,
  SameAddressToggle,
} from "../components/AdminFormComponents";

export default function Signup() {
  const router = useRouter();

  const defaultExpiration = new Date();
  defaultExpiration.setFullYear(defaultExpiration.getFullYear() + 1);

  const [form, setForm] = useState({
    name: "",
    cognome: "",
    ragione_sociale: "",
    telefono: "",
    email: "",
    password: "",
    partita_iva: "",
    role: "CLIENTE",
    sede_legale: "",
    citta_legale: "",
    pr_legale: "",
    cap_legale: "",
    sede_operativa: "",
    citta_operativa: "",
    pr_operativa: "",
    cap_operativa: "",
    indirizzo_studio: "",
    citta_studio: "",
    cap_studio: "",
    pr_studio: "",
    codice_univoco: "",
    password_expiration: defaultExpiration.toISOString().slice(0, 10),
    condomini_max: 1,
  });

  const [copySedeOperativa, setCopySedeOperativa] = useState(false);
  const [copyStudio, setCopyStudio] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "password" && generatedPassword) setGeneratedPassword("");
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 14; i++)
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm((prev) => ({ ...prev, password }));
    setGeneratedPassword(password);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(form.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCredentials = async () => {
    if (!form.email || !form.password) return;
    await navigator.clipboard.writeText(
      `Email: ${form.email}\nPassword: ${form.password}`,
    );
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  useEffect(() => {
    if (copySedeOperativa) {
      setForm((prev) => ({
        ...prev,
        sede_operativa: prev.sede_legale,
        citta_operativa: prev.citta_legale,
        pr_operativa: prev.pr_legale,
        cap_operativa: prev.cap_legale,
      }));
    }
  }, [
    copySedeOperativa,
    form.sede_legale,
    form.citta_legale,
    form.pr_legale,
    form.cap_legale,
  ]);

  useEffect(() => {
    if (copyStudio) {
      setForm((prev) => ({
        ...prev,
        indirizzo_studio: prev.sede_legale,
        citta_studio: prev.citta_legale,
        pr_studio: prev.pr_legale,
        cap_studio: prev.cap_legale,
      }));
    }
  }, [
    copyStudio,
    form.sede_legale,
    form.citta_legale,
    form.pr_legale,
    form.cap_legale,
  ]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSuccess(true);
    } catch {
      setError("Errore durante la registrazione");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: "CLIENTE",
      label: "Cliente",
      icon: User,
      description: "Gestisce i propri condomini",
    },
    {
      value: "OWNER",
      label: "Amministratore",
      icon: Users,
      description: "Gestisce condomini e amministratori",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* ── Page Header ── */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/condo-managers")}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition mb-3"
          >
            <ArrowLeft size={13} />
            Torna agli amministratori
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-blue-600" />
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
              Gestione utenti
            </p>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Nuovo Amministratore
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Compila i dati per creare un nuovo account amministratore
          </p>
        </div>

        {/* ── Feedback ── */}
        {error && (
          <div className="mb-6 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            <span className="shrink-0">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          {/* ── Dati Anagrafici ── */}
          <SectionCard title="Dati Anagrafici" icon={User} accentColor="blue">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Nome"
                icon={User}
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Field
                label="Cognome"
                icon={User}
                name="cognome"
                value={form.cognome}
                onChange={handleChange}
              />
              <Field
                label="Ragione Sociale"
                icon={Building2}
                name="ragione_sociale"
                value={form.ragione_sociale}
                onChange={handleChange}
              />
              <Field
                label="Telefono"
                icon={Phone}
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
              />
              <Field
                label="Email"
                icon={Mail}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Field
                label="Partita IVA"
                icon={Hash}
                name="partita_iva"
                value={form.partita_iva}
                onChange={handleChange}
              />
            </div>
          </SectionCard>

          {/* ── Sede Legale ── */}
          <SectionCard title="Sede Legale" icon={MapPin} accentColor="emerald">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Indirizzo"
                icon={MapPin}
                name="sede_legale"
                value={form.sede_legale}
                onChange={handleChange}
              />
              <Field
                label="CAP"
                icon={Hash}
                name="cap_legale"
                value={form.cap_legale}
                onChange={handleChange}
              />
              <Field
                label="Città"
                icon={MapPin}
                name="citta_legale"
                value={form.citta_legale}
                onChange={handleChange}
              />
              <Field
                label="Provincia"
                icon={MapPin}
                name="pr_legale"
                value={form.pr_legale}
                onChange={handleChange}
              />
            </div>
          </SectionCard>

          {/* ── Sede Operativa ── */}
          <SectionCard title="Sede Operativa" icon={MapPin} accentColor="amber">
            <div className="flex flex-col gap-3">
              <SameAddressToggle
                checked={copySedeOperativa}
                onChange={setCopySedeOperativa}
                label="Uguale alla Sede Legale"
              />
              {copySedeOperativa ? (
                <div className="flex items-center gap-2 text-xs text-blue-500 bg-blue-50 border border-dashed border-blue-200 rounded-xl px-4 py-3">
                  <Copy size={13} />
                  Verranno usati gli stessi dati della Sede Legale
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Indirizzo"
                    icon={MapPin}
                    name="sede_operativa"
                    value={form.sede_operativa}
                    onChange={handleChange}
                  />
                  <Field
                    label="CAP"
                    icon={Hash}
                    name="cap_operativa"
                    value={form.cap_operativa}
                    onChange={handleChange}
                  />
                  <Field
                    label="Città"
                    icon={MapPin}
                    name="citta_operativa"
                    value={form.citta_operativa}
                    onChange={handleChange}
                  />
                  <Field
                    label="Provincia"
                    icon={MapPin}
                    name="pr_operativa"
                    value={form.pr_operativa}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Studio ── */}
          <SectionCard
            title="Studio Professionale"
            icon={Building2}
            accentColor="indigo"
          >
            <div className="flex flex-col gap-3">
              <SameAddressToggle
                checked={copyStudio}
                onChange={setCopyStudio}
                label="Uguale alla Sede Legale"
              />
              {copyStudio ? (
                <div className="flex items-center gap-2 text-xs text-blue-500 bg-blue-50 border border-dashed border-blue-200 rounded-xl px-4 py-3">
                  <Copy size={13} />
                  Verranno usati gli stessi dati della Sede Legale
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Indirizzo"
                    icon={MapPin}
                    name="indirizzo_studio"
                    value={form.indirizzo_studio}
                    onChange={handleChange}
                  />
                  <Field
                    label="CAP"
                    icon={Hash}
                    name="cap_studio"
                    value={form.cap_studio}
                    onChange={handleChange}
                  />
                  <Field
                    label="Città"
                    icon={MapPin}
                    name="citta_studio"
                    value={form.citta_studio}
                    onChange={handleChange}
                  />
                  <Field
                    label="Provincia"
                    icon={MapPin}
                    name="pr_studio"
                    value={form.pr_studio}
                    onChange={handleChange}
                  />
                </div>
              )}
              <Field
                label="Codice Univoco"
                icon={FileDigit}
                name="codice_univoco"
                value={form.codice_univoco}
                onChange={handleChange}
              />
            </div>
          </SectionCard>

          {/* ── Limite Condomini ── */}
          <SectionCard
            title="Limite Condomini"
            icon={Building2}
            accentColor="blue"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Max condomini
                </label>
                <input
                  type="number"
                  name="condomini_max"
                  min={1}
                  value={form.condomini_max}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      condomini_max: Number(e.target.value),
                    }))
                  }
                  className="w-28 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Numero massimo di condomini gestibili da questo amministratore.
              </p>
            </div>
          </SectionCard>

          {/* ── Password ── */}
          <SectionCard title="Password" icon={Lock} accentColor="rose">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Lock size={11} />
                  Password <span className="text-blue-400">*</span>
                </label>
                <div className="relative group">
                  <Lock
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Min. 12 caratteri"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-28 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                      title="Genera password"
                    >
                      <KeyRound size={14} />
                    </button>
                    {form.password && (
                      <button
                        type="button"
                        onClick={copyPassword}
                        className={`p-1.5 rounded-lg transition ${copied ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
                      >
                        <ClipboardCopy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {generatedPassword && (
                <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <KeyRound size={14} className="text-emerald-600 shrink-0" />
                    <code className="text-sm font-mono text-emerald-800">
                      {generatedPassword}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={copyPassword}
                    className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                      copied
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    {copied ? "Copiata!" : "Copia"}
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400">
                Clicca <KeyRound size={11} className="inline" /> per generare
                automaticamente una password sicura da 14 caratteri.
              </p>
            </div>
          </SectionCard>

          {/* ── Scadenza ── */}
          <SectionCard
            title="Scadenza Account"
            icon={Calendar}
            accentColor="amber"
          >
            <div className="flex flex-col gap-1.5 max-w-[220px]">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={11} />
                Data scadenza
              </label>
              <div className="relative group">
                <Calendar
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                />
                <input
                  type="date"
                  name="password_expiration"
                  value={form.password_expiration}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Default: 1 anno dalla data odierna
              </p>
            </div>
          </SectionCard>

          {/* ── Submit bar ── */}
          <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
            <p className="text-xs text-gray-400">
              I campi con <span className="text-blue-400 font-bold">*</span>{" "}
              sono obbligatori
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Vuoi tornare senza salvare?"))
                    router.push("/condo-managers");
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Creazione...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Crea Amministratore
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Success Modal ── */}
      {success && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0f172a] px-6 py-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">
                Amministratore creato!
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Le credenziali sono pronte
              </p>
            </div>

            {/* Credentials */}
            <div className="p-6 flex flex-col gap-3">
              <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={13} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500 text-xs">Email</span>
                  <span className="ml-auto font-semibold text-gray-800 text-xs truncate">
                    {form.email}
                  </span>
                </div>
                {form.password && (
                  <div className="flex items-center gap-2 text-sm">
                    <Lock size={13} className="text-gray-400 shrink-0" />
                    <span className="text-gray-500 text-xs">Password</span>
                    <code className="ml-auto font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                      {form.password}
                    </code>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {form.password && (
                  <button
                    onClick={copyCredentials}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      copiedCreds
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-800 hover:bg-gray-900 text-white"
                    }`}
                  >
                    {copiedCreds ? (
                      <>
                        <CheckCircle2 size={15} />
                        Credenziali copiate!
                      </>
                    ) : (
                      <>
                        <ClipboardCopy size={15} />
                        Copia credenziali
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => router.push("/condo-managers")}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-500/20"
                >
                  Vai agli Amministratori
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
