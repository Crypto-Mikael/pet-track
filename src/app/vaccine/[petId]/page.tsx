'use client'
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Dialog from "@radix-ui/react-dialog";
import { format, differenceInDays, isBefore } from "date-fns";
import { Plus, Trash2, Syringe, Calendar as CalIcon, AlertTriangle, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // <--- seu componente Skeleton
import { useParams, useRouter } from "next/navigation";
import { DatePickerField } from "@/components/ui/datePickerField";
import { CircularProgress } from "@/components/ui/circularProgress";
import type { Vaccination } from "@/lib/schema";

function statusOf(v: Vaccination) {
  const dias = differenceInDays(v.expirationDate, new Date());
  if (isBefore(v.expirationDate, new Date())) return "expired";
  if (dias <= 30) return "soon";
  return "ok";
}

function calculateValidVaccinePercentage(vaccines: Vaccination[] | 0 | null) {
  if (!vaccines || vaccines.length === 0) return 0;
  
  const validVaccines = vaccines.filter(v => !isBefore(v.expirationDate, new Date()));
  return Math.round((validVaccines.length / vaccines.length) * 100);
}

async function fetchVaccines(petId: string): Promise<Vaccination[]> {
  const fetchData = await fetch(`/api/vaccines?petId=${petId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return await fetchData.json() as Vaccination[];
}

export default function VacinasPage() {
  const params = useParams<{ petId: string }>();
  const router = useRouter();
  const [vacinas, setVacinas] = useState<Vaccination[] | null>(null);
  const [open, setOpen] = useState(false);
  const [renewModal, setRenewModal] = useState<Vaccination | null>(null);
  const { register, handleSubmit, control, reset } = useForm<Partial<Vaccination>>();

  useEffect(() => {
    async function getData() {
      setVacinas(null); // começa o loading
      const vaccines = await fetchVaccines(params.petId);
      setVacinas(vaccines ?? []);
    }
    getData();
  }, [params.petId]);

  const onSubmit = async (data: Partial<Vaccination>) => {
    try {
      const response = await fetch("/api/vaccines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, petId: Number(params.petId) }),
      });
      const vaccine = await response.json() as Vaccination;
      setVacinas((s) => s ? [vaccine, ...s] : [vaccine]);
      reset();
      setOpen(false);
    } catch (err) {
      console.error("Erro ao criar a vacina:", err);
    }
  }

  const onRenew = async (data: Partial<Vaccination>) => {
    if (!renewModal) return;
    try {
      const response = await fetch(`/api/vaccines?id=${renewModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await response.json() as Vaccination;
      setVacinas((s) => s ? s.map(v => v.id === updated.id ? updated : v) : [updated]);
      reset();
      setRenewModal(null);
    } catch (err) {
      console.error("Erro ao renovar a vacina:", err);
    }
  }

  async function remove(id: string) {
    try {
      await fetch(`/api/vaccines?id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      setVacinas((s) => s ? s.filter((v) => v.id !== Number(id)) : []);
    } catch (err) {
      console.error("Erro ao deletar a vacina:", err);
    }
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
        Vacinas
      </header>

      <section className="p-4 bg-muted/30 flex flex-col gap-4 border-b-2 border-border">
        <CircularProgress
          textValue="Vacina"
          size={188}
          value={calculateValidVaccinePercentage(vacinas)}
          icon={Syringe}
        />
      </section>

      <section className="flex flex-col gap-4 p-4 max-h-fit overflow-y-auto">
         {vacinas === null ? (
           Array.from({ length: 3 }).map((_, i) => (
             // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton loader
             <div key={`vaccine-skeleton-${i}`} className="rounded-lg p-6 shadow-sm flex flex-col h-94 bg-card justify-between items-start gap-4 animate-pulse">
              <div className="flex flex-col w-full">
                <Skeleton className="h-12 w-26 mb-3" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-46 my-1" />
              </div>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))
        ) : (
          vacinas.map((v) => {
            const st = statusOf(v);
            return (
              <article key={v.id} className={clsx("border-border border-2 rounded-2xl p-6 flex flex-col bg-card justify-between items-start gap-4")}>
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2 rounded-full border-2 text-card-foreground")}>
                    <Syringe />
                  </div>
                  <h3 className="text-lg font-bold text-card-foreground">{v.vaccineName}</h3>
                </div>

                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-foreground"><CalIcon size={16} /> Aplicação: <strong className="ml-2">{format(v.applicationDate, "dd/MM/yyyy")}</strong></li>
                  <li className="flex items-center gap-2 text-foreground"><CalIcon size={16} /> Validade: <strong className={clsx(st === "expired" ? "text-destructive" : st === "soon" ? "text-amber-400" : "text-primary", "ml-2")}>{format(v.expirationDate, "dd/MM/yyyy")}</strong></li>
                  {st === "soon" && (
                    <li className="flex items-center gap-2 mt-2 text-amber-400"><AlertTriangle size={16} className="text-amber-400" /> Vence em breve</li>
                  )}
                  {st === "expired" && (
                    <li className="flex items-center gap-2 mt-2 text-destructive"><AlertTriangle size={16} className="text-destructive" /> Vacina vencida</li>
                  )}
                </ul>

                <Button
                  variant="secondary"
                  className="w-full p-2 rounded"
                  onClick={() => {
                    setRenewModal(v);
                    reset({
                      applicationDate: v.applicationDate,
                      expirationDate: v.expirationDate
                    });
                  }}
                >
                  RENOVAR
                </Button>

                <Button variant="destructive" onClick={() => remove(v.id.toString())} className="w-full p-2 rounded">
                  <Trash2 className="size-6" />
                </Button>
              </article>
            )
          })
        )}
      </section>

      <Button onClick={() => setOpen(true)} className="rounded-full fixed bottom-19 right-3 h-14 w-14 p-0 z-50 shadow-lg">
        <Plus className="size-6" />
      </Button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg p-4 w-96 shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
               <div>
                 <label htmlFor="vaccine-name" className="block text-sm mb-1 font-semibold">Nome da Vacina</label>
                 <input id="vaccine-name" {...register("vaccineName")} className="w-full border rounded p-2" placeholder="Nome da vacina" />
              </div>
              <div className="flex flex-col items-center gap-4 w-full ">
                <DatePickerField control={control} name="applicationDate" label="Data de Aplicação" />
                <DatePickerField control={control} name="expirationDate" label="Data de Validade" />
              </div>
              <div className="flex flex-col justify-end gap-2">
                <Dialog.Close asChild>
                  <Button variant="outline" type="button" className="px-4 py-2 rounded border">Cancelar</Button>
                </Dialog.Close>
                <Button type="submit" className="px-4 py-2 rounded">Salvar</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={!!renewModal} onOpenChange={(open) => !open && setRenewModal(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg p-4 w-96 shadow-lg">
            <form onSubmit={handleSubmit(onRenew)} className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-4 w-full ">
                <DatePickerField control={control} name="applicationDate" label="Nova Data de Aplicação" />
                <DatePickerField control={control} name="expirationDate" label="Nova Data de Validade" />
              </div>
              <div className="flex flex-col justify-end gap-2">
                <Dialog.Close asChild>
                  <Button variant="outline" type="button" className="px-4 py-2 rounded border">CANCELAR</Button>
                </Dialog.Close>
                <Button type="submit" className="px-4 py-2 rounde">RENOVAR</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
