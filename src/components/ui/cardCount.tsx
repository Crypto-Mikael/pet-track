import { Animal } from "@/app/generated/prisma";

import Image from "next/image";

import { Mars, ShowerHead, Syringe, Venus } from "lucide-react";
type CardCountProps = {
  animal: Animal;
};

import {
  differenceInYears,
  differenceInMonths,
  differenceInDays,
} from "date-fns";
import { CircularProgress } from "./circularProgress";

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
        <Image
          src={animal.imageUrl ?? ""}
          alt={animal.name || "Animal image"}
          width={235}
          height={235}
          className="rounded-full border-6 border-border"
        />
        <div className="flex flex-col items-center text-center">
          <div className="flex items-end relative">
            <h1 className="text-6xl text-foreground font-semibold">{getAnimalAge(animal.age).split(' ')[0]}</h1>
          </div>
          <p className="text-foreground text-3xl font-semibold capitalize">{getAnimalAge(animal.age).split(' ')[1]}</p>
        </div>
        <div className="flex flex-col h-full gap-16 items-center pt-8">
          <div className="flex gap-16">
            <CircularProgress textValue="Banho" value={100} icon={ShowerHead} />
            <CircularProgress textValue="Vacina" value={100} icon={Syringe} />
          </div>  
        </div>
    </div>
  )
}