"use client";

import { useState, useRef, useEffect } from "react";
import {
  Home,
  Building,
  Users,
  PlusCircle,
  LogOut,
  User,
  Settings,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";
import { useUser } from "../context/UserContext";

export default function Sidebar({ open, onClose, role, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ownerMenu = [
    { label: "I miei condomini", icon: Building, path: "/dashboard" },
    { label: "Lista amministratori", icon: Users, path: "/condo-managers" },
    { label: "Nuovo Condominio", icon: PlusCircle, path: "/add-company" },
    { label: "Nuovo Amministratore", icon: User, path: "/signup" },
  ];

  const clientMenu = [
    { label: "I miei condomini", icon: Building, path: "/dashboard" },
    { label: "Nuovo Condominio", icon: PlusCircle, path: "/add-company" },
  ];

  const menu = role === "OWNER" ? ownerMenu : clientMenu;

  const initials =
    `${user?.name?.charAt(0) ?? ""}${user?.cognome?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed top-[64px] left-0 h-[calc(100vh-64px)] w-64 z-50",
          "flex flex-col",
          "bg-[#0f172a] border-r border-white/10",
          "transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Blob decorativo */}
        <div className="absolute top-[-60px] left-[-60px] w-48 h-48 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        {/* ── USER HEADER ── */}
        <div
          ref={profileRef}
          className="relative px-3 py-4 border-b border-white/10"
        >
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className={clsx(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150",
              profileOpen ? "bg-white/10" : "hover:bg-white/8",
            )}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-900/40">
                {initials}
              </div>
              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0f172a] rounded-full" />
            </div>

            <div className="flex flex-col text-left flex-1 min-w-0">
              <span className="text-sm font-semibold text-white truncate leading-tight">
                {user?.name} {user?.cognome}
              </span>
              <span className="text-xs text-slate-400 capitalize">
                {role === "OWNER" ? "Owner" : ""}
              </span>
            </div>

            <ChevronDown
              size={14}
              className={clsx(
                "text-slate-400 transition-transform duration-200 shrink-0",
                profileOpen && "rotate-180",
              )}
            />
          </button>

          {/* ── DROPDOWN ── */}
          {profileOpen && (
            <div className="absolute left-3 right-3 mt-1.5 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-1">
                <button
                  onClick={() => {
                    router.push("/profile");
                    setProfileOpen(false);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-white/8 text-sm text-slate-300 hover:text-white transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  Visualizza profilo
                </button>

                <button
                  onClick={() => {
                    router.push("/profile/edit");
                    setProfileOpen(false);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-white/8 text-sm text-slate-300 hover:text-white transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center">
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  Modifica dati
                </button>
              </div>

              <div className="h-px bg-white/10 mx-3" />

              <div className="p-1">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-red-500/15 text-sm text-red-400 hover:text-red-300 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── MENU LABEL ── */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Menu principale
          </p>
        </div>

        {/* ── NAV ── */}
        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          {menu.map(({ label, icon: Icon, path }) => {
            const isActive = pathname === path;
            return (
              <button
                key={label}
                onClick={() => {
                  router.push(path);
                  onClose();
                }}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "text-slate-400 hover:bg-white/8 hover:text-white",
                )}
              >
                <div
                  className={clsx(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                    isActive
                      ? "bg-white/20"
                      : "bg-white/5 group-hover:bg-white/10",
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {label}

                {/* Active indicator */}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── FOOTER ── */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            Esci dall'applicazione
          </button>
        </div>
      </aside>
    </>
  );
}
