import { Animal } from "@/app/generated/prisma";

import Image from "next/image";

import { Cookie, ShowerHead, Syringe } from "lucide-react";
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
import Link from "next/link";

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
  if (!animal) {
    return (
      <div className='flex flex-col justify-center items-center p-8 gap-4 h-full'>
        <div>
          <Skeleton className="rounded-full size-60" /> 
        </div>
        <div className="flex flex-col items-center">
          <Skeleton className="h-15 w-23 rounded-full" />
          <Skeleton className="rounded-full h-9 w-23 mt-1" />
        </div>
        <div className="flex flex-col h-full gap-16 items-center pt-8">
          <div className="flex gap-8">
            <CircularProgress textValue="Banho" value={null} icon={ShowerHead} />
            <CircularProgress textValue="Comida" value={null} icon={Cookie} />
            <CircularProgress textValue="Vacina" value={null} icon={Syringe} />
          </div>  
        </div>
      </div>
    );
  }
  
  return (
      <div className='flex flex-col items-center p-8 gap-4 h-full'>
          <Image
            src={animal.imageUrl ?? ""}
            alt={animal.name || "Animal image"}
            width={240}
            height={240}
            className="rounded-full border-6 border-border"
          />
          <div>
            <h1 className="text-6xl text-center text-foreground font-semibold">{getAnimalAge(animal.age).split(' ')[0]}</h1>
            <p className="text-foreground text-center text-3xl font-semibold capitalize">{getAnimalAge(animal.age).split(' ')[1]}</p>
          </div>
          <div className="flex flex-col h-full gap-16 items-center pt-8">
            <div className="flex gap-8">
              <Link href={`/bath/${animal.id}`}>
                <CircularProgress textValue="Banho" value={40} icon={ShowerHead} />
              </Link>
              <CircularProgress textValue="Comida" value={60} icon={Cookie} />
              <CircularProgress textValue="Vacina" value={100} icon={Syringe} />
            </div>  
          </div>
      </div>
  )
}