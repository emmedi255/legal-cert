"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function Header({ onToggle, sidebarOpen }) {
  return (
    <header className="sticky top-0 z-50 h-16 bg-[#0f172a] border-b border-white/10 flex items-center">
      <div className="flex items-center justify-between w-full px-4 md:px-6">
        {/* ── Logo ── */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-md" />
            <div className="relative bg-white/10 border border-white/15 rounded-xl p-1.5">
              <Image
                src="/logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
          </div>
          <span className="hidden sm:block text-white font-semibold text-base tracking-tight">
            Gestione Condomini
          </span>
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2">
          {/* Badge ambiente — opzionale, rimuovi se non serve */}

          {/* Hamburger mobile */}
          <button
            onClick={onToggle}
            className={clsx(
              "lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-150",
              sidebarOpen
                ? "bg-white/15 border-white/20 text-white"
                : "bg-white/8 border-white/10 text-slate-400 hover:bg-white/12 hover:text-white",
            )}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
