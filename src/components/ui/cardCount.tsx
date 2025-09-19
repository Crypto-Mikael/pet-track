import { Animal } from "@/app/generated/prisma";
import { Progress } from "./progress";

import Image from "next/image";

import { Mars, Venus } from "lucide-react";
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
    <div className='flex flex-col items-center p-8 gap-4'>
        <Image
          src={animal.imageUrl ?? ""}
          alt={animal.name || "Animal image"}
          width={200}
          height={200}
          className="rounded-full border-6 border-border"
        />
        <div className="flex flex-col items-center">
          <div className="flex gap-1 items-center">
            <h1 className="text-3xl text-foreground">{animal.name}</h1>
            <small className="text-foreground">{animal.gender === 'male' ? <Mars /> : <Venus /> } </small>
          </div>
          <small className="self-start text-foreground">Idade: {getAnimalAge(animal.age)}</small>
        </div>
        <div className="h-42">
          <CircularProgress className="" value={100} />
        </div>
    </div>
  )
}