"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, type FieldValues } from "react-hook-form";
import { differenceInDays, intlFormat } from "date-fns";
import {
  ArrowLeft,
  Plus,
  ShowerHead,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HoldToConfirmButton from "@/components/ui/buttonHold";
import { CircularProgress } from "@/components/ui/circularProgress";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DatePickerField } from "@/components/ui/datePickerField";
import { Skeleton } from "@/components/ui/skeleton";
import SliderTooltip from "@/components/ui/slider";
import type { Animal, Bath } from "@/lib/schema";
import { getBaths, createBath, deleteBath } from "@/app/actions/bath";
import { getAnimal, updateBathsCycleDays } from "@/app/actions/pet";

export default function Page() {
  const params = useParams<{ petId: string }>();
  const router = useRouter();

  const { control, handleSubmit } = useForm<FieldValues>({
    defaultValues: { date: new Date().toISOString() },
  });

  const [bathWeeks, setBathWeeks] = useState<number[]>([1]);
  const [bathPercent, setBathPercent] = useState<{ initialValue: number; value: number } | null>(null);
  const [baths, setBaths] = useState<Bath[] | null>(null);
  const [daysWithoutBath, setDaysWithoutBath] = useState<number | null>(null);

   // --- Effects ---
    useEffect(() => {
      const loadData = async () => {
        try {
          const petId = Number(params.petId);
          const [bathsResult, animalResult] = await Promise.all([
            getBaths(petId),
            getAnimal(String(petId)),
          ]);
          if (bathsResult.data) {
            setBaths(bathsResult.data.sort((a: Bath, b: Bath) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          }
          if (animalResult.data) {
            setBathWeeks([animalResult.data.bathsCycleDays / 7]);
          }
        } catch (err) {
          console.error("Erro ao carregar dados:", err);
        }
      };

      loadData();
    }, [params.petId]);

  useEffect(() => {
    if (!baths || baths.length === 0) {
      setDaysWithoutBath(0);
      setBathPercent({ initialValue: 100, value: 0 });
      return;
    }

    // Último banho registrado
    const lastBath = baths[0];
    const lastBathDate = new Date(lastBath.date);

    const days = differenceInDays(new Date(), lastBathDate);
    setDaysWithoutBath(days);

    const cycleDays = (bathWeeks[0] ?? 1) * 7;
    const percent = Math.round(Math.max(0, 100 - (days / cycleDays) * 100));

    setBathPercent({ initialValue: percent, value: 0 });
  }, [baths, bathWeeks]);

  const onSubmit = async (data: FieldValues) => {
      try {
        const dateValue = typeof data.date === 'string' ? new Date(data.date) : (data.date as Date);
        const result = await createBath({
          date: dateValue,
          petId: Number(params.petId),
        });
 
        if (result.data) {
          // Prepend to keep newest bath at the top of the list
          setBaths((prev) => (prev ? [result.data, ...prev] : [result.data]));
        }
      } catch (err) {
        console.error("Erro ao criar banho:", err);
      }
    };


   const onCycleChange = async () => {
     await updateBathsCycleDays(params.petId, bathWeeks[0] * 7);
   };

   const removeBath = async (bathId: number) => {
     try {
       const result = await deleteBath(bathId);
       if (result.success) {
         setBaths((prev) => prev?.filter((b) => b.id !== bathId) ?? []);
       }
     } catch {
       alert("Erro ao deletar banho");
     }
   };

  if (!baths) {
    return (
      <>
        <header className="relative py-2 border-b-2 border-border text-center text-3xl text-foreground shrink-0">
          <Button
            className="absolute left-2"
            variant="ghost"
            onClick={() => router.back()}
            size="icon"
          >
            <ArrowLeft />
          </Button>
          Banhos
        </header>
        <div className="flex-1 overflow-y-auto">
          <section className="p-4 bg-muted/30 flex flex-col gap-4">
            <div className="space-y-4 flex flex-col items-center">
              <Skeleton className="w-[188px] h-[188px] rounded-full" />
              <Skeleton className="w-40 h-10 rounded-full" />
            </div>
          </section>
          <section className="p-4 border-t-2 border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Configurações</h2>
            <Skeleton className="w-full h-10 rounded-md" />
          </section>
          <section className="flex flex-col gap-2 p-4 border-t-2 border-border">
            <h2 className="text-xl font-semibold text-foreground mb-2">Histórico de Banhos</h2>
            <div className="border-2 border-border rounded-2xl overflow-hidden">
              <div className="max-h-[200px] overflow-y-auto">
                <div className="p-4 space-y-2">
                  <Skeleton className="w-full h-8" />
                  <Skeleton className="w-full h-8" />
                </div>
              </div>
              <div className="border-t border-border bg-muted/50 p-3 flex items-center justify-between">
                <div className="font-semibold text-foreground">
                  <Skeleton className="w-12 h-6" />
                </div>
                <div className="text-foreground">
                  <Skeleton className="w-48 h-6" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="relative py-2 border-b-2 border-border text-center text-3xl text-foreground shrink-0">
        <Button
          className="absolute left-2"
          variant="ghost"
          onClick={() => router.push("/")}
          size="icon"
        >
          <ArrowLeft />
        </Button>
        Banhos
      </header>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="rounded-full fixed bottom-19 right-3 h-14 w-14 p-0 z-50 shadow-lg">
            <Plus className="size-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Adicionar Manualmente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            <DatePickerField control={control} name="date" label="Data do banho" />
            <DialogFooter>
              <Button type="submit" className="w-full h-10 capitalize font-bold text-sm">
                Adicionar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <section className="p-4 bg-muted/30 flex flex-col gap-4">
        <CircularProgress
          textValue="Banho"
          size={188}
          value={
            bathPercent
              ? Math.max(bathPercent.value, bathPercent.initialValue)
              : 0
          }
          icon={ShowerHead}
        />
        <HoldToConfirmButton
          buttonText="DAR BANHO"
          onProgressChange={(value) =>
            setBathPercent((prev) => ({
              initialValue: prev?.initialValue ?? 0,
              value,
            }))
          }
          onHoldFinished={() => onSubmit({ date: new Date() })}
        />
      </section>
      <section className="p-4 border-t-2 border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Configurações</h2>
        <SliderTooltip
          max={12}
          step={1}
          min={1}
          labelFor="TTempo sem banho em semanas"
          value={bathWeeks}
          labelValue={Math.floor(bathWeeks[0])}
          onValueChange={setBathWeeks}
          onValueCommit={onCycleChange}
          labelTitle="Tempo sem banho em semanas"
        />
      </section>
      <section className="flex flex-col gap-2 p-4 border-t-2 border-border">
        <h2 className="text-xl font-semibold text-foreground mb-2">Histórico de Banhos</h2>
        <div className="border-2 border-border rounded-2xl overflow-hidden">
          <div className="max-h-[200px] overflow-y-auto">        
            <div className="flex flex-col divide-y divide-border">
              {baths.map((bath, index) => (
                <div
                  key={bath.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/30"
                >
                  <div>
                    <div className="text-sm text-muted-foreground">#{index + 1}</div>
                    <div className="text-base font-semibold">
                      {intlFormat(bath.date, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <Button
                    onClick={() => removeBath(bath.id)}
                    variant="destructive"
                    className="size-10"
                  >
                    <Trash />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-border bg-muted/50 p-3 flex items-center justify-between">
            <div className="font-semibold text-foreground">{baths.length}</div>
            <div className="text-foreground">
              {baths.length === 0 ? "Nenhum banho registrado" : `${daysWithoutBath} dias desde o último banho`}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
