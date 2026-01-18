'use client';
import { Button } from "@/components/ui/button";
import HoldToConfirmButton from "@/components/ui/buttonHold";
import CardNew from "@/components/ui/cardNew";
import ListItem from "@/components/ui/listItem";
import { type Animal, users } from "@/lib/schema";
import { Edit, List, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
    const [animals, setAnimals] = useState<Animal[] | null >(null);

    const deleteAnimal = async (id: number) => {
      try {
        await fetch(`/api/pets?id=${id}`, {
          method: 'DELETE',
        })
        setAnimals(prevAnimals => prevAnimals ? prevAnimals.filter(animal => animal.id !== id) : null);
        
      } catch (error) {
        
      }
    }

    useEffect(() => {
      async function fetchData() {
        try {
           const animalResponse = await fetch("/api/pets");
          const animalData = await animalResponse.json() as Animal[];
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
        <h1 className="text-3xl text-foreground text-center border-b-2 border-border py-2">Pets</h1>
        <main className="flex flex-col gap-4 p-4">
          <CardNew />
          <ListItem props={null} />
        </main>
      </>
    );
  }
  return (
    <>
      <h1 className="text-3xl text-foreground text-center border-b-2 border-border py-2">Pets</h1>
      <main className="flex flex-col gap-4 p-4">
        <CardNew />
        {animals.map(animal => (
          <div className="flex items-center  gap-4" key={animal.id}>
            <Link className="grow" href={`/pet/${animal.id}`}>
              <ListItem props={{ name: animal.name, details: animal.details ?? '', imageUrl: animal.imageUrl }} />
            </Link>
            <div className="flex justify-between flex-col ">
              <HoldToConfirmButton icon={<Trash className="z-50" />} progressColor="bg-destructive" buttonText="" onHoldFinished={() => {deleteAnimal(animal.id)}} />
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
