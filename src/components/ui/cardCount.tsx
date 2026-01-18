
import Image from "next/image";

import { Bone, ShowerHead, Syringe, Weight } from "lucide-react";
import { formatDistance } from "date-fns";
import { CircularProgress } from "./circularProgress";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "./skeleton";
import Link from "next/link";
import type { Animal } from "@/lib/schema";

export type DashboardMetrics = {
  bathPercentage: number;
  bathQtd: number;
  dailyCaloriePercentage: number;
  dailyCalories: number;
  vaccinePercentage: number;
  vaccineTotal: number;
  vaccineValid: number;
};

export default function CardCount({ animal, metrics }: { animal: Animal | null; metrics?: DashboardMetrics | null }) {
  if (!animal || !metrics) {
    return (
      <>
        <main className='flex flex-col justify-center items-center px-8 gap-4 h-full'>
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
              <CircularProgress textValue="Comida" value={null} icon={Bone} />
              <CircularProgress textValue="Vacina" value={null} icon={Syringe} />
            </div>  
          </div>
        </main>
        <section className="flex flex-col items-center p-8 gap-4 flex-1 justify-center">
          <Skeleton className="h-28 max-w-80 w-full rounded-2xl" />
          <Skeleton className="h-28 max-w-80 w-full rounded-2xl" />
          <Skeleton className="h-28 max-w-80 w-full rounded-2xl" />
        </section>
      </>
    );
  }
  
  return (
    <>
      <main className='flex flex-col items-center flex-1 px-8 gap-4 h-full'>
        <Image
          src={animal.imageUrl ?? ""}
          alt={animal.name || "Animal image"}
          width={240}
          height={240}
          className="rounded-full border-6 border-border"
        />
        <div>
          <h1 className="text-6xl text-center text-foreground font-semibold">
            { formatDistance(new Date(), animal.age, { locale: ptBR }).split(" ")[2] }
          </h1>
          <p className="text-foreground text-center text-3xl font-semibold capitalize">
            { formatDistance(new Date(), animal.age, { locale: ptBR }).split(" ")[3] }
          </p>
          <div className="flex items-center gap-1 text-foreground text-center text-xl font-semibold capitalize"><Weight /> {animal.weightKg}kg</div>
        </div>
        <div className="flex flex-col h-full gap-16 items-center pt-8">
          <div className="flex gap-8">
            <Link href={`/bath/${animal.id}`}>
              <CircularProgress textValue="Banho" value={metrics.bathPercentage} icon={ShowerHead} />
            </Link>
            <Link href={`/food/${animal.id}`}>
              <CircularProgress
                textValue="Comida"
                value={metrics.dailyCaloriePercentage}
                icon={Bone}
              />
            </Link>
            <Link href={`/vaccine/${animal.id}`}>
              <CircularProgress textValue="Vacina" value={metrics.vaccinePercentage} icon={Syringe} />
            </Link>
          </div>  
        </div>
      </main>
      <section className="flex flex-col items-center p-8 gap-4 flex-1 justify-center">
  <Link href={`/bath/${animal.id}`} className="border-border flex w-full max-w-80 bg-card border-2 rounded-2xl h-28 cursor-pointer hover:bg-card/60 transition-colors">
          <div className="flex items-center justify-center p-8">
            <ShowerHead className="size-12 text-card-foreground rounded-full" />
          </div>
          <div className="relative flex flex-col justify-center hover:border-border/60 border-border border-l-2 p-4 w-full">
            <h2 className="text-3xl text-card-foreground font-semibold text-center">{metrics.bathQtd}</h2>
            <h1 className="text-2xl text-card-foreground font-semibold text-center">Banhos</h1>
          </div>
        </Link>
  <Link href={`/food/${animal.id}`} className="border-border flex w-full max-w-80 bg-card border-2 rounded-2xl h-28 cursor-pointer hover:bg-card/60 transition-colors">
          <div className="flex items-center justify-center p-8">
            <Bone className="size-12 text-card-foreground rounded-full" />
          </div>
          <div className="relative flex flex-col justify-center hover:border-border/60 border-border border-l-2 p-4 w-full">
            <h1 className="text-3xl text-card-foreground font-semibold text-center">{metrics.dailyCalories}</h1>
            <p className="text-2xl text-center font-semibold text-card-foreground">kcal</p>
          </div>
        </Link>
  <Link href={`vaccine/${animal.id}`} className="border-border flex w-full max-w-80 bg-card border-2 rounded-2xl h-28 cursor-pointer hover:bg-card/60 transition-colors">
          <div className="flex items-center justify-center p-8">
            <Syringe className="size-12 text-card-foreground rounded-full" />
          </div>
          <div className="relative flex flex-col justify-center hover:border-border/60 border-border border-l-2 p-4 w-full">
            <h1 className="text-3xl text-card-foreground font-semibold text-center">{metrics.vaccineValid} de {metrics.vaccineTotal}</h1>
            <p className="text-2xl text-center font-semibold text-card-foreground">em dia</p>
          </div>
        </Link>
      </section>
    </>
  )
}