"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, ArrowLeft, Bone, RotateCcw } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const toNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

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

  const [calorieGoal, setCalorieGoal] = useState<number>(0);

  const { register, handleSubmit, reset } = useForm<Partial<Food>>();

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
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [params.petId, selectedDate]);

  const dailyCalories = useMemo(() => {
    return foods.reduce((sum, f) => sum + toNumber(f.kcal), 0);
  }, [foods]);

  const caloriePercentage = useMemo(() => {
    if (!calorieGoal) return 0;
    return Math.round((dailyCalories / calorieGoal) * 100);
  }, [dailyCalories, calorieGoal]);

  const onSubmit = async (data: Partial<Food>) => {
    const payload = {
      ...data,
      petId: Number(params.petId),
      createdAt: new Date(selectedDate),
    } as Partial<Food>;
    
    console.log(payload)
    try {
      if (editingFood) {
        const result = await updateFood(String(editingFood.id), payload);
        if (result.data) {
          setFoods((prev) =>
            prev.map((f) => (f.id === result.data!.id ? result.data! : f))
          );
        }
      } else {
        const result = await createFood(payload);
        if (result.data) {
          setFoods((prev) => [result.data!, ...prev]);
        }
      }

      reset();
      setEditingFood(null);
      setOpen(false);
    } catch (err) {
      console.error("Erro ao salvar refeição:", err);
    }
  };

  const removeFood = async (id: number) => {
    try {
      const result = await deleteFood(String(id));
      if (result.success) {
        setFoods((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error("Erro ao deletar refeição:", err);
    }
  };

  const repeatFood = async (food: Food) => {
    try {
      const payload = {
        name: food.name,
        amount: food.amount,
        kcal: food.kcal,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        notes: food.notes,
        petId: Number(params.petId),
        createdAt: new Date(selectedDate),
      } as Partial<Food>;

      const result = await createFood(payload);
      if (result.data) {
        setFoods((prev) => [result.data!, ...prev]);
      }
    } catch (err) {
      console.error("Erro ao repetir refeição:", err);
    }
  };

  /* -------------------------------- render ------------------------------- */

  return (
    <>
      {/* HEADER */}
      <header className="relative py-2 border-b-2 border-border text-center text-3xl">
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
      <section className="p-4 border-b-2 border-border flex justify-center">
        <div className="w-full max-w-md">
          <label className="block text-sm font-semibold mb-2">Data</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-background"
          />
        </div>
      </section>

      {/* RESUMO */}
      <section className="p-4 bg-muted/30 border-b-2 border-border">
        {loading || !animal ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="size-48 rounded-full" />
            <Skeleton className="w-40 h-6" />
          </div>
        ) : (
          <>
            <CircularProgress
              textValue="Calorias"
              size={188}
              value={caloriePercentage}
              icon={Bone}
            />

            <div className="text-center text-sm text-muted-foreground mt-2">
              {dailyCalories} / {calorieGoal} kcal
            </div>

            <div className="mt-4">
              <SliderSection
                petId={Number(params.petId)}
                initialValue={calorieGoal}
                onChange={setCalorieGoal}
              />
            </div>
          </>
        )}
      </section>

      {/* LISTA */}
      <section className="flex flex-col gap-4 p-4 h-[calc(100dvh-300px)] overflow-y-auto">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))
        ) : foods.length ? (
          foods.map((food) => (
            <article
              key={food.id}
              className="border-2 border-border rounded-lg p-4 bg-card flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Bone className="text-primary" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{food.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {food.amount}g
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{food.kcal}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
              </div>

              {[food.protein, food.fat, food.carbs].some(
                (v) => v != null
              ) && (
                <div className="flex gap-4 text-xs bg-muted/30 p-2 rounded">
                  {food.protein != null && <span>P: {food.protein}g</span>}
                  {food.fat != null && <span>G: {food.fat}g</span>}
                  {food.carbs != null && <span>C: {food.carbs}g</span>}
                </div>
              )}

              {food.notes && (
                <p className="text-xs italic text-muted-foreground">
                  {food.notes}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1 text-xs"
                  onClick={() => {
                    setEditingFood(food);
                    reset(food);
                    setOpen(true);
                  }}
                >
                  EDITAR
                </Button>
                <Button
                  variant="outline"
                  className="text-xs px-3"
                  onClick={() => repeatFood(food)}
                >
                  <RotateCcw size={12} />
                </Button>
                <Button
                  variant="destructive"
                  className="w-9"
                  onClick={() => removeFood(food.id!)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center text-muted-foreground h-full flex items-center justify-center">
            Nenhuma refeição registrada
          </div>
        )}
      </section>

      {/* FAB */}
      <Button
        onClick={() => {
          reset({ amount: "0", kcal: "0", protein: "0", fat: "0", carbs: "0" });
          setEditingFood(null);
          setOpen(true);
        }}
        className="rounded-full fixed bottom-20 right-6 h-14 w-14 shadow-lg"
      >
        <Plus />
      </Button>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFood ? "Editar Refeição" : "Adicionar Refeição"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              label="Nome da Refeição"
              {...register("name", { required: true })}
              placeholder="Nome"
              className="border rounded p-2"
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Quantidade (g)"
                {...register("amount", { valueAsNumber: true,  })}
                type="number"
                placeholder="Quantidade (g)"
                className="border rounded p-2"
              />
              <Input
                label="Calorias (kcal)"
                {...register("kcal", {
                  valueAsNumber: true,
                  required: true,
                })}
                type="number"
                placeholder="Calorias"
                className="border rounded p-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Proteína (g)"
                {...register("protein", { valueAsNumber: true })}
                type="number"
                placeholder="Proteína"
                className="border rounded p-2 text-sm"
              />
              <Input
                label="Gordura (g)"
                {...register("fat", { valueAsNumber: true })}
                type="number"
                placeholder="Gordura"
                className="border rounded p-2 text-sm"
              />
              <Input
                label="Carbos (g)"
                {...register("carbs", { valueAsNumber: true })}
                type="number"
                placeholder="Carbos"
                className="border rounded p-2 text-sm"
              />
            </div>

            <Textarea
              {...register("notes")}
              placeholder="Observações"
              className="border rounded p-2 text-sm"
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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

/* ----------------------------- slider local ----------------------------- */

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

