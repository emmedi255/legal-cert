"use client";

import { useState, useEffect } from "react";
import { provinceItaliane } from "../utils/provinceItaliane";
import {
  Plus,
  Trash2,
  UserPlus,
  X,
  CheckCircle2,
  Search,
  Building2,
  User,
  MapPin,
  Hash,
  Briefcase,
  ChevronDown,
  Loader2,
} from "lucide-react";

/* ══════════════════════════════════════════
   COMPONENTI — fuori da FornitoriSection
══════════════════════════════════════════ */
function ModalField({
  label,
  icon: Icon,
  field,
  value,
  onChange,
  placeholder,
  required,
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
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
          />
        )}
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder || label}
          required={required}
          className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   FORNITORI SECTION
══════════════════════════════════════════ */
export function FornitoriSection({
  userId,
  addedFornitori,
  setAddedFornitori,
}) {
  const [fornitoriList, setFornitoriList] = useState([]);
  const [selectedFornitoreId, setSelectedFornitoreId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newFornitore, setNewFornitore] = useState({
    nome: "",
    cognome: "",
    ragioneSociale: "",
    indirizzo: "",
    citta: "",
    cap: "",
    provincia: "",
    cf: "",
    attivita: "",
  });

  useEffect(() => {
    async function fetchFornitori() {
      try {
        const res = await fetch(`/api/fornitori?userId=${userId}`);
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setFornitoriList(result.data || []);
      } catch (err) {
        console.error("Errore caricamento fornitori:", err.message);
      }
    }
    if (userId) fetchFornitori();
  }, [userId]);

  const displayName = (f) =>
    f.ragione_sociale?.trim() ||
    `${f.nome ?? ""} ${f.cognome ?? ""}`.trim() ||
    "N/D";

  const addSelectedFornitore = () => {
    if (!selectedFornitoreId) return;
    const forn = fornitoriList.find(
      (f) => String(f.fornitore_id) === String(selectedFornitoreId),
    );
    if (!forn) return;
    if (
      addedFornitori.some(
        (f) => String(f.fornitore_id) === String(forn.fornitore_id),
      )
    )
      return;
    setAddedFornitori([...addedFornitori, forn]);
    setSelectedFornitoreId("");
  };

  const removeFromTable = (id) =>
    setAddedFornitori(
      addedFornitori.filter((f) => String(f.fornitore_id) !== String(id)),
    );

  const deleteSelectedFornitore = async () => {
    if (!selectedFornitoreId) return;
    if (
      !confirm(
        "Eliminare questo fornitore dalla tua lista? L'operazione è irreversibile.",
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/fornitori?id=${selectedFornitoreId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        alert(`Errore: ${data.error}`);
        return;
      }
      setAddedFornitori(
        addedFornitori.filter(
          (f) => String(f.fornitore_id) !== String(selectedFornitoreId),
        ),
      );
      setFornitoriList(
        fornitoriList.filter(
          (f) => String(f.fornitore_id) !== String(selectedFornitoreId),
        ),
      );
      setSelectedFornitoreId("");
    } catch {
      alert("Errore di rete durante l'eliminazione");
    } finally {
      setDeleting(false);
    }
  };

  const updateNewFornitore = (field, value) =>
    setNewFornitore((prev) => ({ ...prev, [field]: value }));

  const addNewFornitore = async (e) => {
    if (!newFornitore.nome.trim() && !newFornitore.ragioneSociale.trim())
      return;
    setSaving(true);
    try {
      const res = await fetch("/api/fornitori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...newFornitore }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setFornitoriList((prev) => [...prev, result.data]);
      setAddedFornitori([...addedFornitori, result.data]);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowModal(false);
        setNewFornitore({
          nome: "",
          cognome: "",
          ragioneSociale: "",
          indirizzo: "",
          citta: "",
          cap: "",
          provincia: "",
          cf: "",
          attivita: "",
        });
      }, 800);
    } catch (err) {
      console.error("Errore inserimento fornitore:", err.message);
    } finally {
      setSaving(false);
    }
  };

  const alreadyAdded = (id) =>
    addedFornitori.some((f) => String(f.fornitore_id) === String(id));

  return (
    <div className="flex flex-col gap-5">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Select */}
        <div className="relative flex-1 min-w-[200px] group">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
          />
          <select
            value={selectedFornitoreId}
            onChange={(e) => setSelectedFornitoreId(e.target.value)}
            className="w-full pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm appearance-none cursor-pointer"
          >
            <option value="">Seleziona fornitore...</option>
            {fornitoriList.map((f) => (
              <option
                key={f.fornitore_id}
                value={f.fornitore_id}
                disabled={alreadyAdded(f.fornitore_id)}
              >
                {displayName(f)}
                {alreadyAdded(f.fornitore_id) ? " ✓" : ""}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Aggiungi da select */}
        <button
          type="button"
          onClick={addSelectedFornitore}
          disabled={!selectedFornitoreId || alreadyAdded(selectedFornitoreId)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-sm shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          Aggiungi
        </button>

        {/* Elimina da DB */}
        <button
          type="button"
          onClick={deleteSelectedFornitore}
          disabled={!selectedFornitoreId || deleting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {deleting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
          Elimina
        </button>

        {/* Nuovo fornitore */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition shadow-sm shadow-emerald-500/20"
        >
          <UserPlus size={14} />
          Nuovo
        </button>
      </div>

      {/* ── Tabella fornitori aggiunti ── */}
      {addedFornitori.length > 0 ? (
        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  "Nome / Ragione Sociale",
                  "Indirizzo",
                  "CF / P.IVA",
                  "Attività",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {addedFornitori.map((f, i) => (
                <tr
                  key={f.fornitore_id}
                  className={`border-b border-gray-100 last:border-0 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"} hover:bg-blue-50/30`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        {f.ragione_sociale?.trim() ? (
                          <Building2 size={13} className="text-blue-600" />
                        ) : (
                          <User size={13} className="text-blue-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {displayName(f)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {[f.indirizzo, f.cap, f.citta, f.provincia]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-0.5 rounded-lg text-gray-700">
                      {f.cf || "—"}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {f.attivita || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeFromTable(f.fornitore_id)}
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-500 transition ml-auto"
                    >
                      <X size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-10 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/40">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Building2 size={18} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            Nessun fornitore aggiunto
          </p>
          <p className="text-xs text-gray-400">
            Seleziona dalla lista o crea un nuovo fornitore
          </p>
        </div>
      )}

      {/* ── Modal nuovo fornitore ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0f172a] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <UserPlus size={15} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Nuovo Fornitore
                  </h4>
                  <p className="text-xs text-slate-400">
                    Verrà salvato nella tua lista
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <div
              className="p-6 flex flex-col gap-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") addNewFornitore();
              }}
            >
              {/* Anagrafica */}
              <div>
                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <User size={11} />
                  Anagrafica
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ModalField
                    label="Ragione Sociale"
                    icon={Building2}
                    field="ragioneSociale"
                    value={newFornitore.ragioneSociale}
                    onChange={updateNewFornitore}
                  />
                  <ModalField
                    label="Nome"
                    icon={User}
                    field="nome"
                    value={newFornitore.nome}
                    onChange={updateNewFornitore}
                  />
                  <ModalField
                    label="Cognome"
                    icon={User}
                    field="cognome"
                    value={newFornitore.cognome}
                    onChange={updateNewFornitore}
                  />
                  <ModalField
                    label="CF / P.IVA"
                    icon={Hash}
                    field="cf"
                    value={newFornitore.cf}
                    onChange={updateNewFornitore}
                  />
                  <ModalField
                    label="Tipo Attività"
                    icon={Briefcase}
                    field="attivita"
                    value={newFornitore.attivita}
                    onChange={updateNewFornitore}
                    className="sm:col-span-2"
                  />
                </div>
              </div>

              {/* Indirizzo */}
              <div>
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <MapPin size={11} />
                  Indirizzo
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ModalField
                    label="Indirizzo"
                    icon={MapPin}
                    field="indirizzo"
                    value={newFornitore.indirizzo}
                    onChange={updateNewFornitore}
                    className="sm:col-span-2"
                  />
                  <ModalField
                    label="CAP"
                    icon={Hash}
                    field="cap"
                    value={newFornitore.cap}
                    onChange={updateNewFornitore}
                  />
                  <ModalField
                    label="Città"
                    icon={MapPin}
                    field="citta"
                    value={newFornitore.citta}
                    onChange={updateNewFornitore}
                  />
                  {/* Provincia */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin size={11} />
                      Provincia
                    </label>
                    <div className="relative group">
                      <MapPin
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                      />
                      <select
                        value={newFornitore.provincia}
                        onChange={(e) =>
                          updateNewFornitore("provincia", e.target.value)
                        }
                        className="w-full pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm appearance-none"
                      >
                        <option value="">Seleziona provincia...</option>
                        {provinceItaliane.map((p) => (
                          <option key={p.sigla} value={p.sigla}>
                            {p.nome} ({p.sigla})
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={13}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Success */}
              {success && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
                  <CheckCircle2 size={15} className="shrink-0" />
                  Fornitore aggiunto con successo!
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      Salva Fornitore
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
