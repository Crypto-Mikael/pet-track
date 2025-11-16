'use client'
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { startOfDay, endOfDay, parse } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Plus, Trash2, ArrowLeft, Bone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { Food, Animal } from "@/app/generated/prisma";
import { CircularProgress } from "@/components/ui/circularProgress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function calculateDailyCalories(foods: Food[] | null): number {
  if (!foods || foods.length === 0) return 0;
  return foods.reduce((sum, f) => sum + f.kcal, 0);
}

function calculateCaloriePercentage(foods: Food[] | null, goal: number): number {
  const dailyCalories = calculateDailyCalories(foods);
  return Math.round((dailyCalories / goal) * 100);
}

export default function DietPage() {
  const params = useParams<{ petId: string }>();
  const router = useRouter();
  const [foods, setFoods] = useState<Food[] | null>(null);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [open, setOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());
  const { register, handleSubmit, reset } = useForm<Partial<Food>>();

  const fetchFoods = async (petId: string, selectedDate: Date) => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Converter a data para timezone local
    const localDate = toZonedTime(selectedDate, timeZone);
    
    // Pegar o início e fim do dia em timezone local
    const dayStart = startOfDay(localDate);
    const dayEnd = endOfDay(localDate);
    
    // Converter de volta para UTC para enviar na requisição
    const startDateUTC = dayStart.toISOString();
    const endDateUTC = new Date(dayEnd.getTime()).toISOString();
    
    const res = await fetch(`/api/foods?petId=${petId}&startDate=${startDateUTC}&endDate=${endDateUTC}`);
    return await res.json() as Food[];
  };

  const fetchAnimal = async (petId: string) => {
    const res = await fetch(`/api/pets?id=${petId}`);
    return await res.json() as Animal;
  };

  useEffect(() => {
    async function loadData() {
      try {
        setFoods(null);
        const dateObj = new Date(selectedDate);
        const [foodsData, animalData] = await Promise.all([
          fetchFoods(params.petId, dateObj),
          fetchAnimal(params.petId),
        ]);
        setFoods(foodsData);
        setAnimal(animalData);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }
    loadData();
  }, [params.petId, selectedDate]);

  const onSubmit = async (data: Partial<Food>) => {
    try {
      if (editingFood) {
        const res = await fetch(`/api/foods?id=${editingFood.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const updated = await res.json() as Food;
        setFoods(prev => prev ? prev.map(f => f.id === updated.id ? updated : f) : [updated]);
        setEditingFood(null);
      } else {
        const res = await fetch("/api/foods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, pet_id: Number(params.petId) }),
        });
        const newFood = await res.json() as Food;
        setFoods(prev => prev ? [newFood, ...prev] : [newFood]);
      }
      reset();
      setOpen(false);
    } catch (err) {
      console.error("Erro ao salvar refeição:", err);
    }
  };

  const removeFood = async (id: number) => {
    try {
      await fetch(`/api/foods?id=${id}`, { method: "DELETE" });
      setFoods(prev => prev ? prev.filter(f => f.id !== id) : []);
    } catch (err) {
      console.error("Erro ao deletar refeição:", err);
    }
  };

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
        Alimentação
      </header>

      <section className="p-4 border-b-2 border-border flex items-center justify-center">
        <div className="w-full max-w-md">
          <label className="block text-sm font-semibold mb-2">Data</label>
          <input
            type="date"
            value={selectedDate.split('T')[0]}
            onChange={(e) => {
              const localDate = parse(e.target.value, 'yyyy-MM-dd', new Date());
              setSelectedDate(localDate.toISOString());
            }}
            className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-sm"
          />
        </div>
      </section>

      <section className="p-4 bg-muted/30 flex flex-col gap-4 border-b-2 border-border">
        {animal === null || foods === null ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-[188px] h-[188px] rounded-full" />
            <Skeleton className="w-40 h-6" />
          </div>
        ) : (
          <>
            <CircularProgress
              textValue="Calorias"
              size={188}
              value={calculateCaloriePercentage(foods, animal.dailyCalorieGoal)}
              icon={Bone}
            />
            <div className="text-center text-sm text-muted-foreground">
              {calculateDailyCalories(foods)} / {animal.dailyCalorieGoal} kcal
            </div>
          </>
        )}
      </section>

      <section className="flex flex-col gap-4 p-4 h-[calc(100dvh-300px)] overflow-y-auto">
        {foods === null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg p-4 bg-card border-2 border-border flex flex-col gap-3 animate-pulse">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          ))
        ) : foods.length > 0 ? (
          foods.map((food) => (
            <article key={food.id} className="border-2 border-border rounded-lg p-4 bg-card flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Bone className="text-primary" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{food.name}</h3>
                  <p className="text-sm text-muted-foreground">{food.amount}g</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{food.kcal}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
              </div>

              {(food.protein || food.fat || food.carbs) && (
                <div className="flex gap-4 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                  {food.protein && <span>P: {food.protein}g</span>}
                  {food.fat && <span>G: {food.fat}g</span>}
                  {food.carbs && <span>C: {food.carbs}g</span>}
                </div>
              )}

              {food.notes && (
                <p className="text-xs text-muted-foreground italic">{food.notes}</p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1 py-1 text-xs"
                  onClick={() => {
                    setEditingFood(food);
                    reset(food);
                    setOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  className="p-1 w-9"
                  onClick={() => removeFood(food.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </article>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Nenhuma refeição registrada hoje
          </div>
        )}
      </section>

      <Button
        onClick={() => {
          setEditingFood(null);
          reset({ amount: 0, kcal: 0 });
          setOpen(true);
        }}
        className="rounded-full fixed bottom-20 right-6 h-14 w-14 p-0 z-50 shadow-lg"
      >
        <Plus className="size-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>{editingFood ? "Editar Refeição" : "Adicionar Refeição"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            <div>
              <label className="block text-sm font-semibold mb-1">Nome da Refeição</label>
              <input
                {...register("name", { required: true })}
                className="w-full border border-border rounded p-2 bg-background text-foreground"
                placeholder="Ex: Ração, Fruta, Snack"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Quantidade (g)</label>
                <input
                  {...register("amount", { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full border border-border rounded p-2 bg-background text-foreground"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Calorias (kcal)</label>
                <input
                  {...register("kcal", { valueAsNumber: true, required: true })}
                  type="number"
                  step="0.1"
                  className="w-full border border-border rounded p-2 bg-background text-foreground"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Proteína (g)</label>
                <input
                  {...register("protein", { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full border border-border rounded p-2 bg-background text-foreground text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Gordura (g)</label>
                <input
                  {...register("fat", { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full border border-border rounded p-2 bg-background text-foreground text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Carbos (g)</label>
                <input
                  {...register("carbs", { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full border border-border rounded p-2 bg-background text-foreground text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Observações</label>
              <textarea
                {...register("notes")}
                className="w-full border border-border rounded p-2 bg-background text-foreground text-sm"
                placeholder="Ex: Com tempero, sem sal"
                rows={2}
              />
            </div>

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
