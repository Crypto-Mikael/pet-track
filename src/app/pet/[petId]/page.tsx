"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import CardCount, { type DashboardMetrics } from "@/components/ui/cardCount";
import { Skeleton } from "@/components/ui/skeleton";
import type { Animal } from "@/lib/schema";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAnimal, getMetrics } from "@/app/actions/pet";

export default function Home() {
    const params = useParams<{ petId: string }>();
    const router = useRouter();
    const [animal, setAnimal] = useState<Animal | null >(null);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);


    useEffect(() => {

      async function fetchData() {
        try {
          const animalResult = await getAnimal(params.petId);
          if (animalResult.data) {
            setAnimal(animalResult.data);
            const metricsResult = await getMetrics(Number(params.petId));
            if (metricsResult.data) {
              setMetrics(metricsResult.data as DashboardMetrics);
            }
          }
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