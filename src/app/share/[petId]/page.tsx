"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { addUserToAnimal } from "@/app/actions/pet";
import { Button } from "@/components/ui/button";

export default function SharePage() {
  const params = useParams<{ petId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const petId = params.petId;
  const role = searchParams.get("role") as "owner" | "caretaker" | "vet" | null;
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (petId && role) {
      handleAddUser();
    } else {
      setLoading(false);
      setMessage("Link inválido");
    }
  }, [petId, role]);

  const handleAddUser = async () => {
    try {
      const result = await fetch(`/api/share?petId=${petId}&role=${role}`, {
        method: "POST",
      });
      
      const data = await result.json();
      
      if (data.error) {
        setMessage(data.error);
      } else {
        setMessage("Você agora é um cuidador deste pet!");
      }
    } catch (error) {
      setMessage("Erro ao adicionar como cuidador");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Processando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 border-2 border-border rounded-2xl bg-card">
        <h1 className="text-2xl font-bold text-center mb-4">Compartilhamento de Pet</h1>
        <p className="text-center text-muted-foreground mb-6">
          {message}
        </p>
        <Button 
          onClick={() => router.push("/")}
          className="w-full"
        >
          Voltar para o início
        </Button>
      </div>
    </div>
  );
}