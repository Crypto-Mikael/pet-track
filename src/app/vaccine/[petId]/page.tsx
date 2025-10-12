'use client'
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Dialog from "@radix-ui/react-dialog";
import { format, differenceInDays, isBefore } from "date-fns";
import { Plus, Trash2, Syringe, Calendar as CalIcon, AlertTriangle, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // <--- seu componente Skeleton
import { useParams, useRouter } from "next/navigation";
import { DatePickerField } from "@/components/ui/datePickerField";
import { Vaccination } from "@/app/generated/prisma";

function statusOf(v: Vaccination) {
  const dias = differenceInDays(v.expirationDate, new Date());
  if (isBefore(v.expirationDate, new Date())) return "expired";
  if (dias <= 30) return "soon";
  return "ok";
}

export default function VacinasPage() {
  const params = useParams<{ petId: string }>();
  const router = useRouter();
  const [vacinas, setVacinas] = useState<Vaccination[] | null>(null); // null indica loading
  const [open, setOpen] = useState(false);
  const [renewModal, setRenewModal] = useState<Vaccination | null>(null);
  const { register, handleSubmit, control, reset } = useForm<Partial<Vaccination>>();

  const fetchVaccines = async (petId: string) => {
    const fetchData = await fetch(`/api/vaccines?petId=${petId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await fetchData.json() as Vaccination[];
  }

  useEffect(() => {
    async function getData() {
      setVacinas(null); // começa o loading
      const vaccines = await fetchVaccines(params.petId);
      setVacinas(vaccines);
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
      <header className="px-4 sticky top-0 py-2 flex w-full justify-center items-center bg-background/30 backdrop-blur-xs text-center">
        <Button
          className="absolute left-2"
          variant="ghost"
          onClick={() => router.back()}
          size="icon"
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl justify-center">Vacinas</h1>
      </header>

      <section className="flex flex-col gap-4 p-4 h-[80dvh] overflow-y-auto">
        {vacinas === null ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg p-6 shadow-sm flex flex-col h-94 bg-card justify-between items-start gap-4 animate-pulse">
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
              <article key={v.id} className={clsx("rounded-lg p-6 shadow-sm flex flex-col bg-card justify-between items-start gap-4")}>
                <div>
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
                </div>

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

      {/* Modal de criar */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg p-4 w-96 shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm mb-1 font-semibold">Nome da Vacina</label>
                <input {...register("vaccineName")} className="w-full border rounded p-2" placeholder="Nome da vacina" />
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

      {/* Modal de renovar */}
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

      <div className="px-4 sticky bottom-4 flex w-full justify-between items-center text-center">
        <Button onClick={() => setOpen(true)} className="w-full h-12 capitalize font-bold text-base">
          <Plus className="size-6" /> ADICIONAR
        </Button>
      </div>
    </>
  );
}
