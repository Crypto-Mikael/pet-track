"use client";
import { useEffect, useState } from "react";
import { Animal } from "./generated/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ShowerHead, Syringe } from "lucide-react";
import CardCount from "@/components/ui/cardCount";
import { Skeleton } from "@/components/ui/skeleton";

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
    <>
      <div className="px-4 sticky top-0 py-2 flex w-full justify-between items-center bg-background/30 backdrop-blur-xs">
        <Button variant="ghost" size="icon" onClick={() => setTabNumber(tabNumber - 1)} className={tabNumber !== 0 ? "" : "invisible"}>
          <ArrowLeft />
        </Button>
        <Button disabled={animals.length ? false : true} variant="ghost" size="icon" className="text-2xl font-semibold w-48 text-foreground">
          {animals[tabNumber]?.name ?? <Skeleton className="h-8 w-24 rounded-full" />}
        </Button>
        <Button disabled={animals.length ? false : true} variant="ghost" size="icon" onClick={() => setTabNumber(tabNumber + 1)} className={tabNumber === 0 ? "" : "invisible"}>
          <ArrowRight />
        </Button>
      </div>
      <main className="flex flex-col">
        <CardCount animal={animals[tabNumber]} />
      </main>
      <section className="flex flex-col p-4 gap-4">
        <a href={`/bath/${animals[tabNumber]?.id}`} className="border-border flex bg-card border-2 rounded-2xl h-28 cursor-pointer hover:bg-card/60 transition-colors">
          <a className="flex flex-col gap-2 relative items-center justify-center px-4">
            <ShowerHead className="size-12 text-card-foreground rounded-full" />
            <p className="absolute bottom-1 text-xs">14/09/2025</p>
          </a>
          <div className="relative flex flex-col justify-center hover:border-border/60 border-border border-l-2 p-4 w-full">
            <h2 className="text-3xl text-card-foreground font-semibold text-center">10</h2>
            <h1 className="text-2xl text-card-foreground font-semibold text-center">Banhos</h1>
            <small className="absolute text-xs right-2 bottom-1 flex items-center gap-1 font-extralight">Ver mais detalhes<ArrowRight className="size-3" /></small>
          </div>
        </a>
        {/* <a href="/food" className="border-border flex bg-card border-2 rounded-2xl h-28 cursor-pointer hover:bg-card/60 transition-colors">
          <div className="flex flex-col gap-2 relative items-center justify-center px-4">
            <Cookie className="size-12 text-card-foreground rounded-full" />
            <p className="absolute bottom-1 text-xs">14/09/2025</p>
          </div>
          <div className="relative flex flex-col justify-center hover:border-border/60 border-border border-l-2 p-4 w-full">
            <h1 className="text-3xl text-card-foreground font-semibold text-center">1,200 </h1>
            <p className="text-2xl text-center font-semibold text-card-foreground">kcal</p>
            <small className="absolute text-xs right-2 bottom-1 flex items-center gap-1 font-extralight">Ver mais detalhes<ArrowRight className="size-3" /></small>
          </div>
        </a> */}
        <a href="/vacine" className="border-border flex bg-card border-2 rounded-2xl h-28 cursor-pointer hover:bg-card/60 transition-colors">
          <div className="flex flex-col gap-2 relative items-center justify-center px-4">
            <Syringe className="size-12 text-card-foreground rounded-full" />
            <p className="absolute bottom-1 text-xs">14/09/2025</p>
          </div>
          <div className="relative flex flex-col justify-center hover:border-border/60 border-border border-l-2 p-4 w-full">
            <h1 className="text-3xl text-card-foreground font-semibold text-center">3/3</h1>
            <p className="text-2xl text-center font-semibold text-card-foreground">em dia</p>
            <small className="absolute text-xs right-2 bottom-1 flex items-center gap-1 font-extralight">Ver mais detalhes<ArrowRight className="size-3" /></small>
          </div>
        </a>
      </section>
      </>
  );
}


