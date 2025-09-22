"use client";
import { useEffect, useState } from "react";
import { Animal } from "./generated/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, PencilIcon } from "lucide-react";
import CardCount from "@/components/ui/cardCount";


export default function Home() {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [tabNumber, setTabNumber] = useState(0);

    useEffect(() => {
      async function fetchData() {
        try {
          const animalResponse = await fetch(`/api/pets`);
          const animalData = await animalResponse.json();
          setAnimals(animalData);
          console.log("Fetched animals:", animalData);
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        }
      }
    fetchData();
  }, []);

  return (
      <main className="flex flex-col h-full">
        { animals.length && (
          <>       
          <div className="px-4 py-2 flex w-full justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => setTabNumber(tabNumber - 1)} className={tabNumber !== 0 ? "" : "invisible"}>
          <ArrowLeft />
        </Button>
        <Button variant="ghost" size="icon" className="text-2xl font-semibold w-48 text-foreground">
          {animals[tabNumber]?.name ?? 'No Pets'}
          <PencilIcon className="scale-130" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setTabNumber(tabNumber + 1)} className={tabNumber === 0 ? "" : "invisible"}>
          <ArrowRight />
        </Button>
      </div>
      <CardCount animal={animals[tabNumber]} />

      </>
      )}
      
      </main>
  );
}


