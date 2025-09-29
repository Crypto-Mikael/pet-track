import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Page() {
  return (
    <>
      <header className="text-3xl text-foreground text-center border-b-2 border-border py-2">Banhos</header>
      <main className="flex h-full flex-col gap-4 p-4">
        <div className="h-full border-border border-2 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.2)]"></div>
        <Button className="w-full h-12 capitalize font-bold text-xl">ADICIONAR <Plus className="size-8" /></Button>
      </main>
    </>
  );
}
