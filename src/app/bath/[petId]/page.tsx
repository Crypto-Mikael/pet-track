"use client";
import { Animal, Bath } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import HoldToConfirmButton from "@/components/ui/buttonHold";
import { CircularProgress } from "@/components/ui/circularProgress";
import SliderTooltip from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, ShowerHead } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const params = useParams<{ petId: string }>();
  const router = useRouter();
  const [bathWeeks, setBathWeeks] = useState([4]);
  const [bathPercent, setBathPercent] = useState(40);

  const [baths, setBaths] = useState<Bath[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const bathsResponse = await fetch(`/api/baths?id=${params.petId}`);
        const bathsData = await bathsResponse.json();
        setBaths(bathsData);
        console.log("Fetched baths:", bathsData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }
    fetchData();
  }, [params.petId]); // Adicionando params.petId como dependência

  return (
    <>
      <header className="text-3xl relative text-foreground text-center border-b-2 border-border py-2">
        <Button className="absolute left-2" variant="ghost" onClick={() => router.back()} size="icon">
          <ArrowLeft />
        </Button>
        Banhos
      </header>
      <main className="p-4 flex flex-col gap-4">
        <CircularProgress textValue="Banho" value={bathPercent ?? 100} icon={ShowerHead} />
        <HoldToConfirmButton onProgressChange={(b) => setBathPercent(b)} onHoldFinished={() => alert('Ação confirmada!')} />
        
      </main>
      <section className="flex h-full flex-col gap-4 p-4">
        <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Invoice</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        <Button className="w-full h-12 capitalize font-bold text-xl">
          ADICIONAR{" "}
          <Plus className="size-8" />
        </Button>
      </section>
    </>
  );
}
