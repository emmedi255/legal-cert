"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" }); // 🔴 fondamentale
    setUser(null);
    router.replace("/login"); // ⬅️ replace, non push
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header onToggle={() => setOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {user && (
          <Sidebar
            open={open}
            onClose={() => setOpen(false)}
            role={user.role}
            onLogout={handleLogout}
          />
        )}
        <main className="flex-1 lg:ml-64 overflow-y-auto bg-gray-50 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
