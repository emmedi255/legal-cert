// components/AdminFormComponents.jsx
import { Copy } from "lucide-react";

export const inputClass =
  "w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

export function Field({
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

export function SectionCard({
  title,
  icon: Icon,
  accentColor = "blue",
  children,
}) {
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

export function SameAddressToggle({ checked, onChange, label }) {
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
