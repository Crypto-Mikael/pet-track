"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ArrowLeft, Bone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SliderTooltip from "@/components/ui/slider";
import { updateDailyCalorieGoal, getAnimal } from "@/app/actions/pet";
import { TZDate } from "@date-fns/tz";
import { useParams, useRouter } from "next/navigation";
import { CircularProgress } from "@/components/ui/circularProgress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Animal, Food } from "@/lib/schema";
import {
  getFoods,
  createFood,
  updateFood,
  deleteFood,
} from "@/app/actions/food";
import { Input } from "../input";

/* -------------------------------------------------------------------------- */
/*                                   ZOD                                      */
/* -------------------------------------------------------------------------- */

const foodFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  amount: z.number().nonnegative("Quantidade inválida.").optional(),
  kcal: z.number().positive("As calorias devem ser maiores que zero."),
  protein: z.number().nonnegative("Proteína inválida.").optional(),
  fat: z.number().nonnegative("Gordura inválida.").optional(),
  carbs: z.number().nonnegative("Carboidrato inválido.").optional(),
  notes: z.string().max(300, "Máximo de 300 caracteres.").optional(),
});

type FoodFormValues = z.infer<typeof foodFormSchema>;

/* -------------------------------------------------------------------------- */

export default function DietPage() {
  const params = useParams<{ petId: string }>();
  const router = useRouter();

  const [foods, setFoods] = useState<Food[]>([]);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  const [selectedDate, setSelectedDate] = useState(
    new TZDate().toISOString().slice(0, 10)
  );

  const [calorieGoal, setCalorieGoal] = useState(0);

  /* ------------------------------ react-hook-form ----------------------------- */

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      amount: 0,
      kcal: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    },
  });

  /* --------------------------------- effects -------------------------------- */

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        const date = new Date(`${selectedDate}T00:00:00`);

        const [foodsResult, animalResult] = await Promise.all([
          getFoods(params.petId, date),
          getAnimal(params.petId),
        ]);

        if (!active) return;

        setFoods(foodsResult.data ?? []);
        setAnimal(animalResult.data ?? null);

        if (animalResult.data) {
          setCalorieGoal(Number(animalResult.data.dailyCalorieGoal) || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [params.petId, selectedDate]);

  /* --------------------------------- cálculos -------------------------------- */

  const dailyCalories = useMemo(
    () => foods.reduce((sum, f) => sum + Number(f.kcal || 0), 0),
    [foods]
  );

  const caloriePercentage = useMemo(() => {
    if (!calorieGoal) return 0;
    return Math.round((dailyCalories / calorieGoal) * 100);
  }, [dailyCalories, calorieGoal]);

  /* --------------------------------- submit ---------------------------------- */

  const onSubmit = async (data: FoodFormValues) => {
    const payload = {
      ...data,
      createdAt: new Date(`${selectedDate}T00:00:00`),
      petId: Number(params.petId),
    };

    try {
      if (editingFood) {
        const res = await updateFood(String(editingFood.id), payload);
        if (res.data) {
          setFoods((prev) =>
            prev.map((f) => (f.id === res.data!.id ? res.data! : f))
          );
        }
      } else {
        const res = await createFood(payload);
        if (res.data) {
          setFoods((prev) => [res.data!, ...prev]);
        }
      }

      reset();
      setEditingFood(null);
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const removeFood = async (id: number) => {
    await deleteFood(String(id));
    setFoods((prev) => prev.filter((f) => f.id !== id));
  };

  /* --------------------------------- render ---------------------------------- */

  return (
    <>
      {/* HEADER */}
      <header className="relative py-2 border-b-2 text-center text-3xl">
        <Button
          className="absolute left-2"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        Alimentação
      </header>

      {/* DATA */}
      <section className="p-4 border-b-2 flex justify-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </section>

      {/* RESUMO */}
      <section className="p-4 bg-muted/30 border-b-2">
        {loading || !animal ? (
          <Skeleton className="h-48 rounded-full" />
        ) : (
          <>
            <CircularProgress
              value={caloriePercentage}
              size={188}
              icon={Bone}
              textValue="Calorias"
            />
            <div className="text-center mt-2">
              {dailyCalories} / {calorieGoal} kcal
            </div>
            <SliderSection
              petId={Number(params.petId)}
              initialValue={calorieGoal}
              onChange={setCalorieGoal}
            />
          </>
        )}
      </section>

      {/* LISTA */}
      <section className="p-4 flex flex-col gap-4">
        {foods.map((food) => (
          <article key={food.id} className="border rounded p-4">
            <strong>{food.name}</strong>
            <p>{food.kcal} kcal</p>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => {
                  setEditingFood(food);
                  reset(food);
                  setOpen(true);
                }}
              >
                Editar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeFood(food.id!)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </article>
        ))}
      </section>

      {/* FAB */}
      <Button
        className="fixed bottom-20 right-6 h-14 w-14 rounded-full"
        onClick={() => {
          reset();
          setEditingFood(null);
          setOpen(true);
        }}
      >
        <Plus />
      </Button>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFood ? "Editar refeição" : "Adicionar refeição"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            {/* NOME */}
            <input {...register("name")} placeholder="Nome" />
            {errors.name && (
              <span className="text-xs text-destructive">
                {errors.name.message}
              </span>
            )}

            {/* KCAL */}
            <input
              type="number"
              {...register("kcal", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              placeholder="Calorias"
            />
            {errors.kcal && (
              <span className="text-xs text-destructive">
                {errors.kcal.message}
              </span>
            )}

            {/* MACROS */}
            {(["protein", "fat", "carbs"] as const).map((field) => (
              <div key={field}>
                <input
                  type="number"
                  {...register(field, {
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                  placeholder={field}
                />
                {errors[field] && (
                  <span className="text-xs text-destructive">
                    {errors[field]?.message}
                  </span>
                )}
              </div>
            ))}

            <textarea {...register("notes")} placeholder="Observações" />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingFood ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* -------------------------------- Slider -------------------------------- */

function SliderSection({
  petId,
  initialValue,
  onChange,
}: {
  petId: number;
  initialValue: number;
  onChange: (n: number) => void;
}) {
  const [value, setValue] = useState<number[]>([initialValue]);

  useEffect(() => {
    setValue([initialValue]);
  }, [initialValue]);

  return (
    <SliderTooltip
      min={100}
      max={5000}
      step={50}
      labelTitle="Meta diária de calorias"
      labelValue={value[0]}
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange(v[0]);
      }}
      onValueCommit={(v) =>
        updateDailyCalorieGoal(petId, v[0].toString())
      }
    />
  );
}