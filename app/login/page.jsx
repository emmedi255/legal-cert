"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function Login() {
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "Errore di login");
        return;
      }
      setUser(data.user);
      router.push("/dashboard");
    } catch (err) {
      setLoading(false);
      setError("Errore durante il login");
      console.error(err);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Inserisci prima la tua email");
      return;
    }
    setResetLoading(true);
    setResetMessage("");
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setResetMessage(
        "Ti abbiamo inviato un'email per reimpostare la password",
      );
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden bg-[#0f172a]">
        {/* Blob decorativi */}
        <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/2 right-[-60px] w-[200px] h-[200px] rounded-full bg-cyan-400/10 blur-2xl" />

        {/* Griglia decorativa */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Contenuto */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-sm">
          {/* Logo con alone */}
          <div className="relative mb-10">
            <div className="absolute inset-0 rounded-3xl bg-blue-500/30 blur-xl scale-110" />
            <div className="relative bg-white/10 border border-white/15 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
              <Image
                src="/logo.png"
                alt="Logo"
                width={110}
                height={110}
                className="object-contain drop-shadow-xl"
              />
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Bentornato
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Accedi alla tua area personale e gestisci tutto da un unico posto.
          </p>

          {/* Stats / feature strip */}
          <div className="w-full flex flex-col gap-3">
            {[
              {
                icon: "🏢",
                label: "Gestione Condomini",
                sub: "Monitora e gestisci ogni condominio",
              },
              {
                icon: "🔐",
                label: "Documenti Privacy",
                sub: "Archiviazione e gestione documenti",
              },
              {
                icon: "✅",
                label: "Gestione Checklist",
                sub: "Aggiorna la checklist",
              },
            ].map(({ icon, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl px-4 py-3 transition-all duration-200 text-left"
              >
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">
                    {label}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Versione / footer sinistro */}
        <p className="absolute bottom-6 text-slate-600 text-xs">
          v1.0 · © 2026
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Logo mobile */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Image
              src="/logo.png"
              alt="Logo"
              width={72}
              height={72}
              className="object-contain"
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
              Portale di accesso
            </p>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Accedi al tuo account
            </h1>
            <p className="text-gray-400 text-sm mt-1.5">
              Inserisci le tue credenziali per continuare
            </p>
          </div>

          {/* Feedback */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {resetMessage && (
            <div className="mb-5 flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
              <span className="shrink-0 mt-0.5">✅</span>
              <span>{resetMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Email
              </label>
              <div className="relative group">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                />
                <input
                  type="email"
                  placeholder="nome@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm hover:border-gray-300"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm hover:border-gray-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 rounded-xl font-semibold text-sm transition-all duration-150 shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Accesso in corso...
                </>
              ) : (
                <>
                  Accedi
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Accedendo accetti i nostri{" "}
            <span className="text-blue-500 hover:underline cursor-pointer">
              Termini di servizio
            </span>{" "}
            e la{" "}
            <span className="text-blue-500 hover:underline cursor-pointer">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
