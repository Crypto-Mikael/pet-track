"use client";
import { useEffect, useState } from "react";
import { Animal } from "./generated/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CardCount from "@/components/ui/cardCount";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
    const [animals, setAnimals] = useState<Animal[] | null>(null);
    const [tabNumber, setTabNumber] = useState(0);

    useEffect(() => {
      async function fetchData() {
        try {
          const animalResponse = await fetch(`/api/pets`);
          const animalData = await animalResponse.json();
          setAnimals(animalData);
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        }
      }
    fetchData();
  }, []);

  if (!animals) {
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

  return (
    <>
      <header className="px-4 z-50 sticky top-0 py-2 flex w-full justify-between items-center bg-background/30 backdrop-blur-xs">
        <Button variant="ghost" size="icon" onClick={() => setTabNumber(tabNumber - 1)} className={tabNumber !== 0 ? "" : "invisible"}>
          <ArrowLeft />
        </Button>
        <Button variant="ghost" size="icon" className="text-2xl font-semibold w-48 text-foreground">
          {animals[tabNumber].name }
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setTabNumber(tabNumber + 1)} className={tabNumber === 0 ? "" : "invisible"}>
          <ArrowRight />
        </Button>
      </header>
      <CardCount animal={animals[tabNumber]} />
    </>
  );
}


