import { Bubbles, Syringe } from "lucide-react";
import Image from "next/image";

type CardPetProps = {
  name: string;
  details: string;
};

export default function CardPet({name, details}: CardPetProps) {
  return (
    <article className='flex relative bg-card border-2 border-border rounded-2xl h-28'>
      <Image className="rounded-l-2xl aspect-square" alt="Sol" width={112} height={112} src="/Sol.jpeg" />
      <div className="p-4 flex flex-col justify-between w-full">
        <h2 className="text-lg font-semibold text-card-foreground">{name}</h2>
        <p className="text-sm text-muted-foreground">{details}</p>
        <div className="flex self-end">
          <span className="flex gap-2 text-foreground">
            <Bubbles />
            <p>1d</p>
          </span>
          <span className="flex gap-2 ml-4 text-foreground">
            <Syringe />
            <p>1d</p>
          </span>
        </div>

      </div>
    </article>
  )
}