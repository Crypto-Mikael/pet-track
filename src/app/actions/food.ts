"use server";

import db from "@/lib/db";
import { foods, animal, Food } from "@/lib/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";
import {
  createFoodSchema,
  updateFoodSchema,
  getFoodsQuerySchema,
  type CreateFoodInput,
  type UpdateFoodInput,
} from "@/lib/validations/food";
import { startOfDay, endOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export async function getFoods(petId: string, selectedDate: Date) {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDate = toZonedTime(selectedDate, timeZone);
    const dayStart = startOfDay(localDate);
    const dayEnd = endOfDay(localDate);
    const startDateUTC = dayStart.toISOString();
    const endDateUTC = new Date(dayEnd.getTime()).toISOString();

    const petIdNum = Number(petId);
    if (Number.isNaN(petIdNum)) {
      return { error: "petId deve ser um número válido" };
    }

    const conditions = [eq(foods.petId, petIdNum)];
    conditions.push(gte(foods.createdAt, new Date(startDateUTC)));
    conditions.push(lte(foods.createdAt, new Date(endDateUTC)));

    const list = await db
      .select()
      .from(foods)
      .where(and(...conditions))
      .orderBy(desc(foods.createdAt));

    return { data: list };
  } catch (error) {
    console.error("Erro ao buscar alimentos:", error);
    return { error: "Erro ao buscar alimentos" };
  }
}

export async function getFoodById(id: string) {
  try {
    const foodId = Number(id);
    if (Number.isNaN(foodId)) {
      return { error: "ID inválido" };
    }

    const [food] = await db
      .select()
      .from(foods)
      .where(eq(foods.id, foodId))
      .limit(1);

    if (!food) {
      return { error: "Alimento não encontrado" };
    }

    return { data: food };
  } catch (error) {
    console.error("Erro ao buscar alimento:", error);
    return { error: "Erro ao buscar alimento" };
  }
}

export async function createFood(data: Partial<Food>) {
  try {
    const { petId, name, amount, kcal, protein, fat, carbs, notes, createdAt } =
      data;
    if (!petId || !name || !kcal || !createdAt) {
      return { error: "Dados obrigatórios ausentes" };
    }
    const [pet] = await db
      .select()
      .from(animal)
      .where(eq(animal.id, petId))
      .limit(1);

    if (!pet) {
      return { error: "Pet não encontrado" };
    }
    const food = {
      petId,
      name,
      amount: amount || null,
      kcal,
      protein: protein || null,
      fat: fat || null,
      carbs: carbs || null,
      notes: notes || null,
      createdAt,
      updatedAt: createdAt,
    } as Food;

    const [created] = await db.insert(foods).values(food).returning();

    return { data: created };
  } catch (error) {
    console.error("Erro ao criar alimento:", error);
    return { error: "Erro ao criar alimento" };
  }
}

export async function updateFood(id: string, data: unknown) {
  try {
    const foodId = Number(id);
    if (Number.isNaN(foodId)) {
      return { error: "ID inválido" };
    }

    const validation = updateFoodSchema.safeParse(data);

    if (!validation.success) {
      return { error: "Dados inválidos", details: validation.error.issues };
    }

    const validatedData = validation.data;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        if (
          ["amount", "kcal", "protein", "fat", "carbs"].includes(key) &&
          value !== null
        ) {
          updateData[key] = String(value);
        } else {
          updateData[key] = value;
        }
      }
    }

    const [food] = await db
      .update(foods)
      .set(updateData)
      .where(eq(foods.id, foodId))
      .returning();

    return { data: food };
  } catch (error) {
    console.error("Erro ao atualizar alimento:", error);
    return { error: "Erro ao atualizar alimento" };
  }
}

export async function deleteFood(id: string) {
  try {
    const foodId = Number(id);
    if (Number.isNaN(foodId)) {
      return { error: "ID inválido" };
    }

    await db.delete(foods).where(eq(foods.id, foodId)).returning();

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar alimento:", error);
    return { error: "Erro ao deletar alimento" };
  }
}
