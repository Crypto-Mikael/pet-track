"use client";
import { Animal, Bath } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import HoldToConfirmButton from "@/components/ui/buttonHold";
import { Calendar } from "@/components/ui/calendar";
import { CircularProgress } from "@/components/ui/circularProgress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import SliderTooltip from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { differenceInDays, format, intlFormat } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CalendarIcon, Plus, ShowerHead } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

export default function Page() {
  const params = useParams<{ petId: string }>();
  const router = useRouter();
  const {
      control,
      handleSubmit,
    } = useForm({
      defaultValues: {
        date: new Date(),
      },
    });
  const [bathWeeks, setBathWeeks] = useState([1]);

  const [bathPercent, setBathPercent] = useState({
    initialValue: 40,
    value: 0,
  });

  const [baths, setBaths] = useState<Bath[] | null>(null);
  const [daysWithoutBath, setDaysWithoutBath] = useState<number | null>(null);

  const calcCleanPercent = (daysWithoutBath: number, cycleDays: number) => {
    const percent = Math.max(0, 100 - (daysWithoutBath / cycleDays) * 100)
    return Math.round(percent)
  }
  
  const fetchBaths = async (petId: number) => {
    const bathsResponse = await fetch(`/api/baths?id=${petId}`);
    const bathsData = await bathsResponse.json() as Bath[];
    return bathsData;
  }

  const fetchAnimal = async (petId: number) => {
    const animalResponse = await fetch(`/api/pets?id=${petId}`);
    const animalData = await animalResponse.json() as Animal;
    return animalData;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const baths = await fetchBaths(Number(params.petId));
        setBaths(baths);
        const animal = await fetchAnimal(Number(params.petId));
        setBathWeeks([animal.bathsCycleDays / 7])

        if (baths && baths.length > 0) {
          const daysWithoutBath = differenceInDays(new Date(), baths[baths.length - 1].date)
          setDaysWithoutBath(daysWithoutBath)
          setBathPercent({initialValue: calcCleanPercent(daysWithoutBath, animal.bathsCycleDays), value: 0 })
        } else {
          setDaysWithoutBath(0)
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }
    fetchData();
  }, [params.petId, daysWithoutBath]);

  const onSubmit = async ({ date }: { date: Date }) => {
    try {
      const bathCreateResponse = await fetch("/api/baths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, petId: Number(params.petId) }),
      });
      const bathCreateData = await bathCreateResponse.json() as Bath;

      if (!bathCreateResponse.ok) {
        throw new Error("Falha ao criar o banho.");
      }
      if (baths) {
        setBaths([...baths, bathCreateData]);
      }
    } catch (error) {
      console.error("Erro ao criar o pet:", error);
    }
  };

  const onSlideChange = async () => {
    await fetch(`/api/pets?id=${params.petId}&bathsCycleDays=${bathWeeks[0] * 7}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="text-3xl relative text-foreground text-center border-b-2 border-border py-2 flex-shrink-0">
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
        {/* Seção de Status */}
        <section className="p-4 bg-muted/30">
          <div className="flex flex-col gap-4">
            <CircularProgress
              textValue="Banho"
              value={
                bathPercent.initialValue > bathPercent.value
                  ? bathPercent.initialValue
                  : bathPercent.value
              }
              icon={ShowerHead}
            />
            <HoldToConfirmButton
              onProgressChange={(b) =>
                setBathPercent({ initialValue: bathPercent.initialValue, value: b })
              }
              onHoldFinished={() => onSubmit({ date: new Date() })}
            />
          </div>
        </section>

        {/* Seção de Configuração */}
        <section className="p-4 border-t-2 border-border">
          <h2 className="text-xl text-foreground font-semibold mb-4">Configurações</h2>
          <SliderTooltip
            max={12}
            step={1}
            min={1}
            labelFor="Quanto tempo sem banho"
            value={bathWeeks}
            labelValue={bathWeeks[0]}
            onValueChange={setBathWeeks}
            onValueCommit={onSlideChange}
            labelTitle="Quanto tempo sem banho"
          />
        </section>

        {/* Seção de Registros */}
        <section className="flex flex-col gap-2 p-4 border-t-2 border-border">
          <h2 className="text-xl text-foreground font-semibold mb-2">Histórico de Banhos</h2>
          <div className="border-border border-2 rounded-2xl overflow-hidden">
            <div className="max-h-[200px] overflow-y-auto">
              <Table>
              <TableHeader className="*:border-border bg-muted/50">
                <TableRow>
                  <TableHead className="w-16 text-base text-center font-semibold">#</TableHead>
                  <TableHead className="border-l-2 border-border text-base font-semibold">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                { baths === null ? <TableRow className="*:border-border">
                  <TableCell><Skeleton className="w-full h-[29px]"></Skeleton></TableCell>
                  <TableCell className="border-l-2"><Skeleton className="w-full h-[29px]"></Skeleton></TableCell>
                </TableRow> :  baths?.length === 0 ? (
                <TableRow className="*:border-border">
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                    Nenhum banho registrado ainda
                  </TableCell>
                </TableRow>
              ) : (
                baths.map((bath, index) => (
                  <TableRow key={bath.id} className="hover:bg-muted/30">
                    <TableCell className="text-base text-foreground text-center border-border border-b-2">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-foreground border-l-2 border-border text-base border-b-2">
                      {intlFormat(bath.date, {
                        day: '2-digit',
                        month: "2-digit",
                        year: '2-digit',
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
              <TableFooter className="border-border bg-muted/50">
                <TableRow>
                  <TableCell className="text-base text-foreground text-center font-semibold">
                    {baths === null ? <Skeleton className="w-full h-[29px]"></Skeleton> : baths.length}
                  </TableCell>
                  <TableCell className="border-l-2 border-border text-foreground text-base font-medium"> 
                    {
                      baths === null || daysWithoutBath === null ? (
                        <Skeleton className="w-full h-[29px]"></Skeleton>
                      ) : baths.length === 0 ? (
                        'Nenhum banho registrado'
                      ) : (
                        `${daysWithoutBath} dias desde o último banho`
                      )
                    }
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            </div>
          </div>
        </section>

        {/* Seção de Adicionar Manualmente */}
        <section className="p-4 border-t-2 border-border bg-muted/30">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <h2 className="text-xl text-foreground font-semibold">Adicionar Manualmente</h2>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1990-01-01")
                      }
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <Button type="submit" className="w-full h-12 capitalize font-bold text-base">
              ADICIONAR
              <Plus className="size-5 ml-2" />
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}