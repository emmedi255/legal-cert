"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  User,
  Users,
  MapPin,
  Hash,
  Mail,
  Phone,
  Building2,
  FileDigit,
  Lock,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  X,
  Copy,
  KeyRound,
  ClipboardCopy,
  Hash as HashIcon,
} from "lucide-react";

/* ══════════════════════════════════════════
   COMPONENTI — definiti FUORI dal modal
══════════════════════════════════════════ */
const inputClass =
  "w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

function Field({
  label,
  icon: Icon,
  type = "text",
  name,
  value,
  onChange,
  required,
  disabled,
  placeholder,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
        {Icon && <Icon size={11} />}
        {label}
        {required && <span className="text-blue-400">*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
          />
        )}
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder || label}
          className={inputClass}
        />
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, accentColor = "blue", children }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[accentColor]}`}
        >
          <Icon size={14} />
        </div>
        <h3 className="text-sm font-bold text-gray-800 tracking-tight">
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function SameAddressToggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
        checked
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : "bg-slate-50 border-gray-200 text-gray-500 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Copy
          size={14}
          className={checked ? "text-blue-500" : "text-gray-400"}
        />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <div
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${checked ? "bg-blue-500" : "bg-gray-300"}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════
   MODAL
══════════════════════════════════════════ */
export default function EditAdminModal({ adminId, onClose }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copySedeOperativa, setCopySedeOperativa] = useState(false);
  const [copyStudio, setCopyStudio] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const defaultExpiration = new Date();
  defaultExpiration.setFullYear(defaultExpiration.getFullYear() + 1);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const res = await fetch(`/api/customers/${adminId}`);
        const data = await res.json();
        const today = new Date();
        const adminExpiration = new Date(data.admin.password_expiration);
        if (data.admin) {
          setForm({
            ...data.admin,
            password_expiration:
              adminExpiration >= today
                ? adminExpiration.toISOString().slice(0, 10)
                : defaultExpiration.toISOString().slice(0, 10),
          });
        }
      } catch (err) {
        setError("Errore nel caricamento dell'amministratore");
      } finally {
        setLoading(false);
      }
    }
    loadAdmin();
  }, [adminId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSuccess(false);
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  useEffect(() => {
    setSuccess(false);
    if (copySedeOperativa && form) {
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
    form?.sede_legale,
    form?.citta_legale,
    form?.pr_legale,
    form?.cap_legale,
  ]);

  useEffect(() => {
    setSuccess(false);
    if (copyStudio && form) {
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
    form?.sede_legale,
    form?.citta_legale,
    form?.pr_legale,
    form?.cap_legale,
  ]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");
    try {
      const res = await fetch(`/api/customers/${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSuccess(true);
    } catch {
      setError("Errore durante l'aggiornamento");
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading state ── */
  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 shadow-2xl">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Caricamento dati...</p>
        </div>
      </div>
    );

  if (!form) return null;

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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-3xl relative overflow-y-auto max-h-[92vh] border border-gray-200">
        {/* ── Modal Header ── */}
        <div className="sticky top-0 z-10 bg-[#0f172a] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <User size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Modifica Amministratore
              </h2>
              <p className="text-xs text-slate-400">
                {form.name} {form.cognome}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-5">
          {/* ── Feedback ── */}
          {success && (
            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
              <CheckCircle2 size={16} className="shrink-0" />
              Amministratore aggiornato con successo!
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              <span className="shrink-0">⚠️</span>
              {error}
            </div>
          )}

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

          {/* ── Ruolo ── */}
          <SectionCard title="Ruolo Utente" icon={Users} accentColor="indigo">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map((role) => {
                const isSelected = form.role === role.value;
                return (
                  <label key={role.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={isSelected}
                      onChange={handleChange}
                      className="sr-only"
                      required
                    />
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-150 ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-300 shadow-sm"
                          : "bg-white border-gray-200 hover:border-indigo-200"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <role.icon size={16} />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${isSelected ? "text-indigo-800" : "text-gray-700"}`}
                        >
                          {role.label}
                        </p>
                        <p className="text-xs text-gray-400">
                          {role.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2
                          size={16}
                          className="text-indigo-500 ml-auto shrink-0"
                        />
                      )}
                    </div>
                  </label>
                );
              })}
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

          {/* ── Condomini ── */}
          <SectionCard
            title="Limite Condomini"
            icon={Building2}
            accentColor="blue"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1.5 max-w-[160px]">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Max condomini
                </label>
                <input
                  type="number"
                  name="condomini_max"
                  min={1}
                  value={form.condomini_max ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      condomini_max: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm text-center font-semibold"
                />
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Numero massimo di condomini che questo amministratore può
                gestire.
              </p>
            </div>
          </SectionCard>

          {/* ── Password ── */}
          <SectionCard title="Password" icon={Lock} accentColor="rose">
            <div className="flex flex-col gap-3">
              {/* Input password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Lock size={11} />
                  Nuova Password <span className="text-blue-400">*</span>
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
                    value={form.password || ""}
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
                      title="Genera password"
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                    >
                      <KeyRound size={14} />
                    </button>
                    {form.password && (
                      <button
                        type="button"
                        onClick={copyPassword}
                        title="Copia password"
                        className={`p-1.5 rounded-lg transition ${copied ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
                      >
                        <ClipboardCopy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Password generata */}
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
                  value={form.password_expiration ?? ""}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Default: 1 anno dalla data odierna
              </p>
            </div>
          </SectionCard>

          {/* ── Submit ── */}
          <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
            <p className="text-xs text-gray-400">
              I campi con <span className="text-blue-400 font-bold">*</span>{" "}
              sono obbligatori
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Salva Modifiche
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
