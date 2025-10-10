import { Animal } from "@/app/generated/prisma";

import Image from "next/image";

import { ShowerHead, Syringe } from "lucide-react";
type CardCountProps = {
  animal: Animal;
};

import {
  differenceInYears,
  differenceInMonths,
  differenceInDays,
} from "date-fns";
import { CircularProgress } from "./circularProgress";
import { Skeleton } from "./skeleton";

function getAnimalAge(birthDate: Date): string {
  const now = new Date();

  const years = differenceInYears(now, birthDate);
  if (years > 0) {
    return years === 1 ? "1 ano" : `${years} anos`;
  }

  const months = differenceInMonths(now, birthDate);
  if (months > 0) {
    return months === 1 ? "1 mês" : `${months} meses`;
  }

  const days = differenceInDays(now, birthDate);
  return days === 1 ? "1 dia" : `${days} dias`;
}

export default function CardCount({ animal }: CardCountProps) {
  return (
      <div className='flex flex-col items-center p-8 gap-4 h-full'>
          { animal ? (<Image
            src={animal.imageUrl ?? ""}
            alt={animal.name || "Animal image"}
            width={240}
            height={240}
            className="rounded-full border-6 border-border"
          />) : <Skeleton className="rounded-full h-[480px] w-60" /> }
            <div>
              { animal ? (<h1 className="text-6xl text-center text-foreground font-semibold">{getAnimalAge(animal.age).split(' ')[0]}</h1>) : <Skeleton className="h-15 w-20 rounded-full" /> }
            { animal ? (<p className="text-foreground text-center text-3xl font-semibold capitalize">{getAnimalAge(animal.age).split(' ')[1]}</p>
) : <Skeleton className="rounded-full h-[30px] w-full mt-1" /> }
</div>
          <div className="flex flex-col h-full gap-16 items-center pt-8">
            <div className="flex gap-8">
              <a href={`/bath/${animal?.id}`}>
                <CircularProgress textValue="Banho" value={30} icon={ShowerHead} />
              </a>
              {/* <CircularProgress textValue="Comida" value={60} icon={Cookie} /> */}
              <CircularProgress textValue="Vacina" value={100} icon={Syringe} />
            </div>  
          </div>
      </div>
  )
}