"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import DashboardLayout from "../../components/DashboardLayout";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Building2,
  Hash,
  FileDigit,
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Copy,
} from "lucide-react";

/* ══════════════════════════════════════════
   COMPONENTI — definiti FUORI dal page
══════════════════════════════════════════ */
const inputClass =
  "w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

function Field({
  label,
  icon: Icon,
  type = "text",
  field,
  required,
  form,
  updateField,
  disabled,
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
          value={form[field] || ""}
          onChange={(e) => updateField(field, e.target.value)}
          required={required}
          disabled={disabled}
          className={inputClass}
        />
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon size={14} className="text-blue-600" />
        </div>
        <h2 className="text-sm font-bold text-gray-800 tracking-tight">
          {title}
        </h2>
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
      className={`
        w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-200
        ${
          checked
            ? "bg-blue-50 border-blue-200 text-blue-700"
            : "bg-slate-50 border-gray-200 text-gray-500 hover:border-gray-300"
        }
      `}
    >
      <div className="flex items-center gap-2.5">
        <Copy
          size={14}
          className={checked ? "text-blue-500" : "text-gray-400"}
        />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      {/* Toggle pill */}
      <div
        className={`
        relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0
        ${checked ? "bg-blue-500" : "bg-gray-300"}
      `}
      >
        <div
          className={`
          absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
          ${checked ? "translate-x-4" : "translate-x-0.5"}
        `}
        />
      </div>
    </button>
  );
}

function AddressBlock({
  title,
  fieldPrefix,
  form,
  updateField,
  sameAsLegal,
  disabled,
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${
        disabled
          ? "bg-slate-50/40 border-gray-100"
          : "bg-slate-50/60 border-gray-100"
      }`}
    >
      <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <MapPin size={11} />
        {title}
        {disabled && (
          <span className="ml-auto text-[10px] font-semibold text-blue-400 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full normal-case tracking-normal">
            Copia da Sede Legale
          </span>
        )}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Indirizzo"
          icon={MapPin}
          field={`${fieldPrefix}`}
          form={form}
          updateField={updateField}
          disabled={disabled}
        />
        <Field
          label="CAP"
          icon={Hash}
          field={`cap_${fieldPrefix.split("_")[1] || fieldPrefix}`}
          form={form}
          updateField={updateField}
          disabled={disabled}
        />
        <Field
          label="Città"
          icon={MapPin}
          field={`citta_${fieldPrefix.split("_")[1] || fieldPrefix}`}
          form={form}
          updateField={updateField}
          disabled={disabled}
        />
        <Field
          label="Provincia"
          icon={MapPin}
          field={`pr_${fieldPrefix.split("_")[1] || fieldPrefix}`}
          form={form}
          updateField={updateField}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function EditProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [sameOperativa, setSameOperativa] = useState(false);
  const [sameStudio, setSameStudio] = useState(false);

  useEffect(() => {
    if (user) setForm({ ...user, role: "CLIENTE" });
  }, [user]);

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  /* Quando si attiva "stesso indirizzo", copia i campi della sede legale */
  const handleSameOperativa = (val) => {
    setSameOperativa(val);
    if (val) {
      setForm((prev) => ({
        ...prev,
        sede_operativa: prev.sede_legale,
        cap_operativa: prev.cap_legale,
        citta_operativa: prev.citta_legale,
        pr_operativa: prev.pr_legale,
      }));
    }
  };

  const handleSameStudio = (val) => {
    setSameStudio(val);
    if (val) {
      setForm((prev) => ({
        ...prev,
        indirizzo_studio: prev.sede_legale,
        cap_studio: prev.cap_legale,
        citta_studio: prev.citta_legale,
        pr_studio: prev.pr_legale,
      }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <User className="w-7 h-7 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700">Nessun utente loggato</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setUser(data.user);
      document.cookie = `session_user=${JSON.stringify(data.user)}; path=/`;
      setSuccess("Profilo aggiornato con successo!");
      setTimeout(() => router.push("/profile"), 1500);
    } catch (err) {
      alert("Errore aggiornamento: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* ── Page Header ── */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition mb-3"
          >
            <ArrowLeft size={13} />
            Torna al profilo
          </button>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-blue-600" />
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
              Il tuo account
            </p>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Modifica Profilo
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Aggiorna i tuoi dati personali e le sedi
          </p>
        </div>

        {/* ── Feedback ── */}
        {success && (
          <div className="mb-6 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
            <CheckCircle2 size={16} className="shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* ── Dati Generali ── */}
          <SectionCard title="Dati Generali" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Nome"
                icon={User}
                field="name"
                required
                form={form}
                updateField={updateField}
              />
              <Field
                label="Cognome"
                icon={User}
                field="cognome"
                form={form}
                updateField={updateField}
              />
              <Field
                label="Email"
                icon={Mail}
                type="email"
                field="email"
                required
                form={form}
                updateField={updateField}
              />
              <Field
                label="Telefono"
                icon={Phone}
                field="telefono"
                form={form}
                updateField={updateField}
              />
              <Field
                label="Ragione Sociale"
                icon={Building2}
                field="ragione_sociale"
                form={form}
                updateField={updateField}
              />
              <Field
                label="Partita IVA"
                icon={Hash}
                field="partita_iva"
                form={form}
                updateField={updateField}
              />
              <Field
                label="Codice Univoco"
                icon={FileDigit}
                field="codice_univoco"
                form={form}
                updateField={updateField}
              />
            </div>
          </SectionCard>

          {/* ── Sedi ── */}
          <SectionCard title="Sedi" icon={MapPin}>
            <div className="flex flex-col gap-4">
              {/* Sede Legale — sempre editabile */}
              <div className="rounded-xl border border-gray-100 bg-slate-50/60 p-4">
                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <MapPin size={11} />
                  Sede Legale
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Indirizzo"
                    icon={MapPin}
                    field="sede_legale"
                    form={form}
                    updateField={updateField}
                  />
                  <Field
                    label="CAP"
                    icon={Hash}
                    field="cap_legale"
                    form={form}
                    updateField={updateField}
                  />
                  <Field
                    label="Città"
                    icon={MapPin}
                    field="citta_legale"
                    form={form}
                    updateField={updateField}
                  />
                  <Field
                    label="Provincia"
                    icon={MapPin}
                    field="pr_legale"
                    form={form}
                    updateField={updateField}
                  />
                </div>
              </div>

              {/* Sede Operativa */}
              <div className="flex flex-col gap-2">
                <SameAddressToggle
                  checked={sameOperativa}
                  onChange={handleSameOperativa}
                  label="Sede Operativa uguale alla Sede Legale"
                />
                {!sameOperativa && (
                  <div className="rounded-xl border border-gray-100 bg-slate-50/60 p-4">
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <MapPin size={11} />
                      Sede Operativa
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Indirizzo"
                        icon={MapPin}
                        field="sede_operativa"
                        form={form}
                        updateField={updateField}
                      />
                      <Field
                        label="CAP"
                        icon={Hash}
                        field="cap_operativa"
                        form={form}
                        updateField={updateField}
                      />
                      <Field
                        label="Città"
                        icon={MapPin}
                        field="citta_operativa"
                        form={form}
                        updateField={updateField}
                      />
                      <Field
                        label="Provincia"
                        icon={MapPin}
                        field="pr_operativa"
                        form={form}
                        updateField={updateField}
                      />
                    </div>
                  </div>
                )}
                {sameOperativa && (
                  <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/30 px-4 py-3 text-xs text-blue-500 flex items-center gap-2">
                    <Copy size={13} />
                    Verranno usati gli stessi dati della Sede Legale
                  </div>
                )}
              </div>

              {/* Studio */}
              <div className="flex flex-col gap-2">
                <SameAddressToggle
                  checked={sameStudio}
                  onChange={handleSameStudio}
                  label="Studio uguale alla Sede Legale"
                />
                {!sameStudio && (
                  <div className="rounded-xl border border-gray-100 bg-slate-50/60 p-4">
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <MapPin size={11} />
                      Studio
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Indirizzo"
                        icon={MapPin}
                        field="indirizzo_studio"
                        form={form}
                        updateField={updateField}
                      />
                      <Field
                        label="CAP"
                        icon={Hash}
                        field="cap_studio"
                        form={form}
                        updateField={updateField}
                      />
                      <Field
                        label="Città"
                        icon={MapPin}
                        field="citta_studio"
                        form={form}
                        updateField={updateField}
                      />
                      <Field
                        label="Provincia"
                        icon={MapPin}
                        field="pr_studio"
                        form={form}
                        updateField={updateField}
                      />
                    </div>
                  </div>
                )}
                {sameStudio && (
                  <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/30 px-4 py-3 text-xs text-blue-500 flex items-center gap-2">
                    <Copy size={13} />
                    Verranno usati gli stessi dati della Sede Legale
                  </div>
                )}
              </div>
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
                onClick={() => router.push("/profile")}
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
    </DashboardLayout>
  );
}
