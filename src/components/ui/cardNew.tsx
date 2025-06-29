import { Plus } from "lucide-react";

export default function CardNew() {
  return (
    <a href="pet/new" className="flex gap-8 justify-center items-center w-full h-28 p-6 border-2 border-dashed border-border/70 rounded-2xl text-center text-foreground/40">
      <Plus className="scale-200" />
      <p className="text-2xl">Adicionar Novo Pet</p>
    </a>
  )
}