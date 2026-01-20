'use client';
import { Button } from "@/components/ui/button";
import HoldToConfirmButton from "@/components/ui/buttonHold";
import CardNew from "@/components/ui/cardNew";
import ListItem from "@/components/ui/listItem";
import { type Animal } from "@/lib/schema";

type AnimalWithRole = Animal & {
  role: "owner" | "caretaker" | "vet";
};
import { Edit, List, Trash, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAnimals, deleteAnimal as deleteAnimalAction, removeAnimalAssociation } from "@/app/actions/pet";

export default function Page() {
    const [animals, setAnimals] = useState<AnimalWithRole[] | null >(null);

const handleDeleteAnimal = async (id: number) => {
      try {
        const result = await deleteAnimalAction(String(id));
        if (result.success) {
          setAnimals(prevAnimals => prevAnimals ? prevAnimals.filter(animal => animal.id !== id) : null);
        }
      } catch (error) {
        console.error("Erro ao deletar animal:", error);
      }
    }

    const handleRemoveAssociation = async (animalId: number) => {
      try {
        const result = await removeAnimalAssociation(animalId);
        if ('success' in result && result.success) {
          setAnimals(prevAnimals => prevAnimals ? prevAnimals.filter(animal => animal.id !== animalId) : null);
        }
      } catch (error) {
        console.error("Erro ao remover associação do animal:", error);
      }
    }

    useEffect(() => {
      async function fetchData() {
        try {
          const result = await getAnimals();
          if (result.data) {
            setAnimals(result.data);
            console.log(result);

          }
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
<div className="flex justify-between flex-col gap-2">
              {animal.role === 'owner' && (
                <HoldToConfirmButton 
                  icon={<Trash className="z-50" />} 
                  progressColor="bg-destructive" 
                  buttonText="Delete" 
                  onHoldFinished={() => {handleDeleteAnimal(animal.id)}} 
                />
              )}
              {(animal.role === 'caretaker' || animal.role === 'vet') && (
                <HoldToConfirmButton 
                  icon={<X className="z-50" />} 
                  progressColor="bg-secondary" 
                  buttonText="Remove" 
                  onHoldFinished={() => {handleRemoveAssociation(animal.id)}} 
                />
              )}
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
