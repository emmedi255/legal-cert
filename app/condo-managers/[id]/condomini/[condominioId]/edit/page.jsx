"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import DataForm from "@/app/add-company/page";
import { mapDbToForm } from "@/app/utils/mappers/mapDbToForm";

export default function OwnerEditCondominioPage() {
  const { id, condominioId } = useParams();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "OWNER") {
      router.replace("/dashboard");
      return;
    }

    async function loadCondominio() {
      try {
        const res = await fetch(`/api/get-condomini?user_id=${id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const condominio = (data.condomini || []).find(
          (c) => c.condominio_id === condominioId,
        );

        if (!condominio) {
          setError("Condominio non trovato");
          setLoading(false);
          return;
        }

        setForm(mapDbToForm(condominio));
      } catch (err) {
        setError(err.message || "Errore nel caricamento del condominio");
      } finally {
        setLoading(false);
      }
    }

    loadCondominio();
  }, [user, userLoading, id, condominioId, router]);

  if (userLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Caricamento condominio...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );

  return (
    <DataForm
      initialForm={form}
      mode="edit"
      condominioId={condominioId}
      ownerOverrideUserId={id}
    />
  );
}
