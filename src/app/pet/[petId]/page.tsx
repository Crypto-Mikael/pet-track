"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import CardCount, { DashboardMetrics } from "@/components/ui/cardCount";
import { Skeleton } from "@/components/ui/skeleton";
import { Animal } from "@/lib/schema";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Home() {
    const params = useParams<{ petId: string }>();
    const router = useRouter();
    const [animal, setAnimal] = useState<Animal | null >(null);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);


    useEffect(() => {

      async function fetchData() {
        try {
          const animalResponse = await fetch(`/api/pets?id=${params.petId}`);
          const animalData = await animalResponse.json() as Animal;
          const metrics = await fetch(`/api/home?petId=${animalData.id}`);
          setMetrics(await metrics.json() as DashboardMetrics);
          setAnimal(animalData);
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        }
      }
      fetchData();

  }, [params.petId]);


  if (!animal) {
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


  if (animal) {
    return (
      <>
        <header className="px-4 z-50 sticky top-0 py-2 flex w-full justify-center items-center bg-background/30 backdrop-blur-xs">
          <Button
            className="absolute left-2"
            variant="ghost"
            onClick={() => router.back()}
            size="icon"
          >
            <ArrowLeft />
          </Button>
          <Button variant="ghost" size="icon" className="text-2xl self-center font-semibold w-48 text-foreground">
            {animal.name }
          </Button>
        </header>
        <CardCount animal={animal} metrics={metrics} />
      </>
    );
  }
}