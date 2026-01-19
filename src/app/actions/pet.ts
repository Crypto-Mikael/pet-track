"use server";

import { currentUser } from "@clerk/nextjs/server";
import db from "@/lib/db";
import {
  animal,
  users,
  baths,
  foods,
  vaccinations,
  Vaccination,
  Food,
} from "@/lib/schema";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { differenceInDays, endOfToday, isBefore, startOfToday } from "date-fns";

export async function getAnimals() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { error: "Não autorizado" };
    }

    const usersRes = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUser.id))
      .limit(1);

    const user = usersRes[0];
    if (!user) {
      return { error: "Usuário não encontrado" };
    }

    const animals = await db
      .select()
      .from(animal)
      .where(eq(animal.ownerId, user.id));
    return { data: animals };
  } catch (error) {
    console.error("Erro ao buscar animais:", error);
    return { error: "Erro ao buscar animais" };
  }
}

export async function getAnimal(id: string) {
  try {
    const animalId = Number(id);
    if (Number.isNaN(animalId)) {
      return { error: "ID inválido" };
    }

    const [animalData] = await db
      .select()
      .from(animal)
      .where(eq(animal.id, animalId))
      .limit(1);

    if (!animalData) {
      return { error: "Animal não encontrado" };
    }

    return { data: animalData };
  } catch (error) {
    console.error("Erro ao buscar animal:", error);
    return { error: "Erro ao buscar animal" };
  }
}

export async function updateDailyCalorieGoal(petId: number, dailyCalorieGoal: string) {
  try {
    const [petUpdated] = await db
      .update(animal)
      .set({ dailyCalorieGoal: dailyCalorieGoal as any })
      .where(eq(animal.id, petId))
      .returning();

    return { data: petUpdated };
  } catch (error) {
    console.error("Erro ao atualizar dailyCalorieGoal:", error);
    return { error: "Erro ao atualizar dailyCalorieGoal" };
  }
}

export async function createAnimal(data: {
  name: string;
  breed: string;
  details?: string;
  gender: string;
  age: Date;
  lastBath: Date;
  imageUrl?: string;
  weightKg?: string;
}) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { error: "Não autorizado" };
    }

    const usersRes = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUser.id))
      .limit(1);

    const user = usersRes[0];
    if (!user) {
      return { error: "Usuário não encontrado" };
    }

    const [pet] = await db
      .insert(animal)
      .values({
        name: data.name,
        details: data.details || null,
        breed: data.breed,
        gender: data.gender,
        age: data.age,
        imageUrl: data.imageUrl || null,
        weightKg: data.weightKg || "0",
        ownerId: user.id,
        updatedAt: new Date(),
      })
      .returning();

    await db.insert(baths).values({
      petId: pet.id,
      date: data.lastBath,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { data: pet };
  } catch (error) {
    console.error("Erro ao criar animal:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Pet com este nome já existe" };
    }
    return { error: "Erro ao criar animal" };
  }
}

export async function deleteAnimal(id: string) {
  try {
    const animalId = Number(id);
    if (Number.isNaN(animalId)) {
      return { error: "ID inválido" };
    }

    await db.delete(animal).where(eq(animal.id, animalId));

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar animal:", error);
    return { error: "Erro ao deletar animal" };
  }
}

export async function updateBathsCycleDays(id: string, bathsCycleDays: number) {
  try {
    const animalId = Number(id);
    if (Number.isNaN(animalId)) {
      return { error: "ID inválido" };
    }

    const [petUpdated] = await db
      .update(animal)
      .set({ bathsCycleDays })
      .where(eq(animal.id, animalId))
      .returning();

    return { data: petUpdated };
  } catch (error) {
    console.error("Erro ao atualizar ciclo de banho:", error);
    return { error: "Erro ao atualizar ciclo de banho" };
  }
}

export async function getMetrics(petId: number) {
  try {
    if (Number.isNaN(petId)) {
      return { error: "petId inválido" };
    }

    const [petData] = await db
      .select()
      .from(animal)
      .where(eq(animal.id, Number(petId)))
      .limit(1);
    if (!petData) {
      return { error: "Pet não encontrado" };
    }

    const foodList = await db
      .select()
      .from(foods)
      .where(
        and(
          eq(foods.petId, petId),
          gte(foods.createdAt, startOfToday()),
          lte(foods.createdAt, endOfToday()),
        ),
      )
      .orderBy(desc(foods.createdAt));

    const dailyCaloriePercentage = calculateCaloriePercentage(
      foodList,
      Number(petData.dailyCalorieGoal),
    );

    const dailyCalories = calculateDailyCalories(foodList);

    const bathList = await db
      .select()
      .from(baths)
      .where(eq(baths.petId, petId))
      .orderBy(asc(baths.date));

    let bathPercentage = 0;
    if (bathList.length > 0) {
      const lastBath = bathList[bathList.length - 1];
      const lastBathDate = new Date(lastBath.date);
      const daysWithoutBath = differenceInDays(new Date(), lastBathDate);

      bathPercentage =
        Math.round(
          Math.max(
            0,
            100 - (daysWithoutBath / (petData.bathsCycleDays || 28)) * 100,
          ),
        ) ?? 0;
    }

    const vaccineList = await db
      .select()
      .from(vaccinations)
      .where(eq(vaccinations.petId, petId))
      .orderBy(asc(vaccinations.expirationDate));
    const vaccinePercentage = calculateValidVaccinePercentage(vaccineList) ?? 0;

    const metrics = {
      bathPercentage,
      bathQtd: bathList.length,
      dailyCaloriePercentage,
      dailyCalories,
      vaccinePercentage,
      vaccineTotal: vaccineList.length,
      vaccineValid: vaccineList.filter(
        (v) => !isBefore(v.expirationDate, new Date()),
      ).length,
    };

    return { data: metrics };
  } catch (error) {
    console.error("Erro ao buscar métricas:", error);
    return { error: "Erro ao buscar métricas" };
  }
}

function calculateValidVaccinePercentage(
  vaccines: Vaccination[] | null,
): number | null {
  if (!vaccines || vaccines.length === 0) return null;

  const validVaccines = vaccines.filter(
    (v) => !isBefore(v.expirationDate, new Date()),
  );
  return Math.round((validVaccines.length / vaccines.length) * 100);
}

function calculateDailyCalories(foodList: Food[] | null): number {
  if (!foodList || foodList.length === 0) return 0;
  return foodList.reduce((sum, f) => sum + Number(f.kcal), 0);
}

function calculateCaloriePercentage(
  foodList: Food[] | null,
  goal: number,
): number {
  const dailyCalories = calculateDailyCalories(foodList);
  return Math.round((dailyCalories / goal) * 100);
}
