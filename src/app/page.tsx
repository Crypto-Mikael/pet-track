"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import CardCount, { DashboardMetrics } from "@/components/ui/cardCount";
import { Skeleton } from "@/components/ui/skeleton";
import { Animal } from "@/lib/schema";
import CardNew from "@/components/ui/cardNew";

export default function Home() {
    const [animals, setAnimals] = useState<Animal[] | undefined | null >(null);
    const [tabNumber, setTabNumber] = useState(0);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

    useEffect(() => {

      async function fetchData() {
        try {
          const animalResponse = await fetch(`/api/pets`);
          
          const animalData = await animalResponse.json() as Animal[];
          if (animalData.length === 0) {
            setAnimals(undefined);
          }
          const metrics = await fetch(`/api/home?petId=${animalData[tabNumber].id}`);
          setMetrics(await metrics.json() as DashboardMetrics);
          setAnimals(animalData);
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        }
      }
      fetchData();

  }, [tabNumber]);

  if (animals === undefined) {
    return (
      <>
        <main className="flex items-center justify-center h-full p-4">
          <CardNew />
        </main>
      </>
    );
  }

  if (animals === null) {
    return (
      <>
        <header className="px-4 sticky top-0 py-2 flex w-full z-50 justify-center items-center bg-background/30 backdrop-blur-xs">
          <Skeleton className="h-9 w-48 rounded-full" />
        </header>
        <main className="flex flex-col">
          <CardCount animal={null} />
        </main>
      </>
    );
  }


  if (animals.length) {
    return (
      <>
        <header className="px-4 z-50 sticky top-0 py-2 flex w-full justify-between items-center bg-background/30 backdrop-blur-xs">
          <Button variant="ghost" size="icon" onClick={() => setTabNumber(tabNumber - 1)} className={tabNumber !== 0 ? "" : "invisible"}>
            <ArrowLeft />
          </Button>
          <Button variant="ghost" size="icon" className="text-2xl font-semibold w-48 text-foreground">
            {animals[tabNumber].name }
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTabNumber(tabNumber + 1)} className={animals.length > 0 && tabNumber !== animals.length - 1 ? "" : "invisible"}>
            <ArrowRight />
          </Button>
        </header>
        <CardCount animal={animals[tabNumber]} metrics={metrics} />
      </>
    );
  }
}