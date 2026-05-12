"use client";

import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

export default function SessionTimeoutModal() {
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async () => {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    router.push("/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Sessione scaduta</h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          Sei rimasto inattivo per 30 minuti.<br />Accedi nuovamente per continuare.
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors"
        >
          Vai al login
        </button>
      </div>
    </div>
  );
}
