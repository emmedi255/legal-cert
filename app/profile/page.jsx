"use client";

import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import {
  User,
  Mail,
  Phone,
  Building2,
  Hash,
  FileDigit,
  MapPin,
  Pencil,
  ShieldCheck,
  Briefcase,
} from "lucide-react";

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
        {Icon && <Icon size={11} className="text-gray-400" />}
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 min-h-[40px] flex items-center">
        {value || (
          <span className="text-gray-300 italic text-xs">Non specificato</span>
        )}
      </p>
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

function AddressBlock({ title, fields }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-slate-50/60 p-4">
      <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <MapPin size={11} />
        {title}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(({ label, value }) => (
          <InfoField key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <User className="w-7 h-7 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700">Nessun utente loggato</p>
          <p className="text-sm text-gray-400 mt-1">
            Effettua il login per continuare
          </p>
        </div>
      </div>
    );
  }

  const initials =
    `${user.name?.charAt(0) ?? ""}${user.cognome?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-blue-600" />
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
              Il tuo account
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Profilo
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Visualizza e gestisci i tuoi dati personali
              </p>
            </div>
            <button
              onClick={() => router.push("/profile/edit")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              <Pencil size={15} />
              Modifica Profilo
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* ── Hero avatar card ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-lg scale-110" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {initials || <User size={32} />}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
            </div>

            {/* Info principali */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900">
                {user.name} {user.cognome}
              </h2>
              {user.ragione_sociale && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {user.ragione_sociale}
                </p>
              )}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                {user.email && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-slate-50 border border-gray-200 rounded-full px-2.5 py-1">
                    <Mail size={11} className="text-gray-400" />
                    {user.email}
                  </span>
                )}
                {user.telefono && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-slate-50 border border-gray-200 rounded-full px-2.5 py-1">
                    <Phone size={11} className="text-gray-400" />
                    {user.telefono}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1">
                  <ShieldCheck size={11} />
                  {user.role ?? "Utente"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Dati Generali ── */}
          <SectionCard title="Dati Generali" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField icon={User} label="Nome" value={user.name} />
              <InfoField icon={User} label="Cognome" value={user.cognome} />
              <InfoField icon={Mail} label="Email" value={user.email} />
              <InfoField icon={Phone} label="Telefono" value={user.telefono} />
              <InfoField
                icon={Building2}
                label="Ragione Sociale"
                value={user.ragione_sociale}
              />
              <InfoField
                icon={Hash}
                label="Partita IVA"
                value={user.partita_iva}
              />
              <InfoField
                icon={FileDigit}
                label="Codice Univoco"
                value={user.codice_univoco}
              />
            </div>
          </SectionCard>

          {/* ── Sedi ── */}
          <SectionCard title="Sedi" icon={MapPin}>
            <div className="flex flex-col gap-4">
              <AddressBlock
                title="Sede Legale"
                fields={[
                  { label: "Indirizzo", value: user.sede_legale },
                  { label: "CAP", value: user.cap_legale },
                  { label: "Città", value: user.citta_legale },
                  { label: "Provincia", value: user.pr_legale },
                ]}
              />
              <AddressBlock
                title="Sede Operativa"
                fields={[
                  { label: "Indirizzo", value: user.sede_operativa },
                  { label: "CAP", value: user.cap_operativa },
                  { label: "Città", value: user.citta_operativa },
                  { label: "Provincia", value: user.pr_operativa },
                ]}
              />
              <AddressBlock
                title="Studio"
                fields={[
                  { label: "Indirizzo", value: user.indirizzo_studio },
                  { label: "CAP", value: user.cap_studio },
                  { label: "Città", value: user.citta_studio },
                  { label: "Provincia", value: user.pr_studio },
                ]}
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
