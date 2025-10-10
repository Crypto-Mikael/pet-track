'use client'
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as Dialog from "@radix-ui/react-dialog";
import { format, parseISO, differenceInDays, isBefore } from "date-fns";
import { Plus, Trash2, Syringe, Calendar as CalIcon, AlertTriangle, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Vacina = {
  id: string;
  nome: string;
  aplicada: string; // ISO date
  validade: string; // ISO date
};

function daysUntil(dateISO: string) {
  const d = parseISO(dateISO);
  return differenceInDays(d, new Date());
}

function statusOf(v: Vacina) {
  const dias = daysUntil(v.validade);
  if (isBefore(parseISO(v.validade), new Date())) return "expired";
  if (dias <= 30) return "soon";
  return "ok";
}

function colorOf(status: string) {
  switch (status) {
    case "ok":
      return {
        ring: "ring-emerald-200",
        bg: "bg-emerald-50",
        border: "border-emerald-300",
        text: "text-emerald-800",
      };
    case "soon":
      return {
        ring: "ring-amber-200",
        bg: "bg-amber-50",
        border: "border-amber-300",
        text: "text-amber-800",
      };
    case "expired":
      return {
        ring: "ring-rose-200",
        bg: "bg-rose-50",
        border: "border-rose-300",
        text: "text-rose-800",
      };
    default:
      return {
        ring: "",
        bg: "bg-white",
        border: "border-gray-200",
        text: "text-black",
      };
  }
}

export default function VacinasPage() {
  const router = useRouter();
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<Partial<Vacina>>();

  useEffect(() => {
    const exemplo: Vacina[] = [
      { id: cryptoId(), nome: "Teste", aplicada: new Date().toISOString(), validade: new Date(Date.now() + 120 * 24 * 3600 * 1000).toISOString() },
      { id: cryptoId(), nome: "Teste", aplicada: new Date().toISOString(), validade: new Date(Date.now() + 22 * 24 * 3600 * 1000).toISOString() },
      { id: cryptoId(), nome: "Teste", aplicada: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), validade: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
    ];
    setVacinas(exemplo);
  }, []);

  function cryptoId() {
    return Math.random().toString(36).slice(2, 9);
  }

  function onSubmit(data: Partial<Vacina>) {
    if (!data.nome || !data.aplicada || !data.validade) return;
    const novo: Vacina = { id: cryptoId(), nome: data.nome, aplicada: data.aplicada, validade: data.validade } as Vacina;
    setVacinas((s) => [novo, ...s]);
    reset();
    setOpen(false);
  }

  function remove(id: string) {
    setVacinas((s) => s.filter((v) => v.id !== id));
  }

  return (
    <div className="flex flex-col">
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
      <div className="flex justify-center mb-6">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button className="w-full h-12 capitalize font-bold text-base"> <Plus /> Adicionar Nova Vacina</Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[520px] shadow-lg">
              <Dialog.Title className="text-xl font-bold mb-3">Adicionar Vacina</Dialog.Title>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input {...register("nome")} className="w-full border rounded px-3 py-2" placeholder="Nome da vacina" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data de Aplicação</label>
                    <Controller
                      control={control}
                      name="aplicada"
                      defaultValue={new Date().toISOString()}
                      render={({ field: { value, onChange } }) => (
                        <div>
                          <Calendar
                            mode="single"
                            selected={value ? parseISO(value) : undefined}
                            onSelect={(d) => d && onChange(d.toISOString())}
                          />
                        </div>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Validade</label>
                    <Controller
                      control={control}
                      name="validade"
                      defaultValue={new Date().toISOString()}
                      render={({ field: { value, onChange } }) => (
                        <div>
                          <Calendar
                            mode="single"
                            selected={value ? parseISO(value) : undefined}
                            onSelect={(d) => d && onChange(d.toISOString())}
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Dialog.Close asChild>
                    <button type="button" className="px-4 py-2 rounded border">Cancelar</button>
                  </Dialog.Close>
                  <button type="submit" className="px-4 py-2 rounded bg-slate-900 text-white">Salvar</button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <section className="space-y-6">
        {vacinas.map((v) => {
          const st = statusOf(v);
          const col = colorOf(st);
          return (
            <article key={v.id} className={clsx("rounded-lg border p-6 shadow-sm flex justify-between items-start gap-4", col.border, col.bg)}>
              <div>
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2 rounded-full border", col.ring)}>
                    <Syringe className={clsx(col.text)} />
                  </div>
                  <h3 className="text-lg font-bold">{v.nome}</h3>
                </div>

                <ul className="mt-4 space-y-2 text-slate-700">
                  <li className="flex items-center gap-2"><CalIcon size={16} /> Aplicação: <strong className="ml-2">{format(parseISO(v.aplicada), "dd/MM/yyyy")}</strong></li>
                  <li className="flex items-center gap-2"><CalIcon size={16} /> Validade: <strong className={clsx(st === "expired" ? "text-rose-600" : st === "soon" ? "text-amber-600" : "text-emerald-800", "ml-2")}>{format(parseISO(v.validade), "dd/MM/yyyy")}</strong></li>
                  {st === "soon" && (
                    <li className="flex items-center gap-2 text-amber-700 mt-2"><AlertTriangle size={16} /> Vence em breve</li>
                  )}
                  {st === "expired" && (
                    <li className="flex items-center gap-2 text-rose-700 mt-2"><AlertTriangle size={16} /> Vacina vencida</li>
                  )}
                </ul>
              </div>

              <div className="text-slate-400">
                <button onClick={() => remove(v.id)} className="p-2 rounded hover:bg-slate-100">
                  <Trash2 />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
