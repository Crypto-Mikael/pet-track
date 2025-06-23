import CardCount from "@/components/ui/cardCount";
import { Bird, Cat, Dog, PawPrint } from "lucide-react";

export default async function Home() {
  return (
    <>
      <h1 className="text-3xl text-foreground text-center border-b-2 border-border py-2">Home</h1>
      <section className="flex flex-col gap-4 p-4">
        <h2 className="text-2xl font-semibold text-foreground">Visão Geral</h2>
        <div className="grid grid-cols-2 gap-4 ">
          <CardCount text="Pets" Icon={PawPrint} count={0} />
          <CardCount text="Cachorros" Icon={Dog} count={0} />
          <CardCount text="Gatos" Icon={Cat} count={0} />
          <CardCount text="Outros" Icon={Bird} count={0} />
        </div>
      </section>
      <main className="flex flex-col gap-4 p-4">
        <h2 className="text-2xl font-semibold text-foreground">Atualizações</h2>
        <div className="grid grid-cols-2 gap-4 ">
          <CardCount text="Pets" Icon={PawPrint} count={0} />
          <CardCount text="Cachorros" Icon={Dog} count={0} />
          <CardCount text="Gatos" Icon={Cat} count={0} />
          <CardCount text="Outros" Icon={Bird} count={0} />
        </div>
      </main>
    </>
  );
}
