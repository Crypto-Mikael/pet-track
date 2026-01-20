"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus, Share, Share2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CardCount, { type DashboardMetrics } from "@/components/ui/cardCount";
import { Skeleton } from "@/components/ui/skeleton";
import type { Animal } from "@/lib/schema";

type AnimalWithRole = Animal & { role: "owner" | "caretaker" | "vet" };
import CardNew from "@/components/ui/cardNew";
import { getAnimals, getMetrics } from "@/app/actions/pet";

export default function Home() {
    const [animals, setAnimals] = useState<AnimalWithRole[] | undefined | null >(null);
    const [tabNumber, setTabNumber] = useState(0);
    const [metrics, setMetrics] = useState<DashboardMetrics | undefined | null>(null);

    const sharePet = async (petId: number) => {
      try {
        const shareUrl = `${window.location.origin}/share/${petId}?role=caretaker`;
        
        if (navigator.share) {
          await navigator.share({
            title: 'Compartilhar Pet',
            text: 'Clique no link para se tornar cuidador deste pet',
            url: shareUrl,
          });
        } else {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link de compartilhamento copiado!');
        }
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    };

    useEffect(() => {

      async function fetchData() {
        setAnimals(null)
        try {
          const animalsResult = await getAnimals();
          
          if (!animalsResult.data || animalsResult.data.length === 0) {
            setAnimals(undefined);
            return;
          }
          
          setAnimals(animalsResult.data);
          const getMetricsResult = await getMetrics(animalsResult.data[tabNumber].id);
          if (!animalsResult.data || getMetricsResult.data === null) {
            setMetrics(undefined);
            return;
          }
          
          setMetrics(getMetricsResult.data);

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
        <CardCount animal={animals[tabNumber] as Animal} metrics={metrics} />
        
        {/* FAB Share Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="fixed top-15 right-3 h-14 w-14 rounded-2xl shadow-lg z-50 bg-primary hover:bg-primary/90"
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Compartilhar Pet</DialogTitle>
              <DialogDescription>
                Compartilhe este pet com outras pessoas para que elas possam ajudar no cuidado do animal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Como funciona?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Clique em "Compartilhar" para gerar um link</li>
                  <li>• Envie o link para a pessoa que você quer adicionar</li>
                  <li>• Ao clicar no link, a pessoa se tornará cuidadora</li>
                  <li>• A cuidadora poderá visualizar e adicionar informações</li>
                </ul>
              </div>
              <Button 
                onClick={() => sharePet(animals[tabNumber].id)}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar {animals[tabNumber].name}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}