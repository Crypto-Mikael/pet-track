"use server";

import db from "@/lib/db";
import { animal } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getAnimals() {
  try {
    const animals = await db.select().from(animal).orderBy(animal.id);
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

export async function getMetrics(petId: string) {
  try {
    const petIdNum = Number(petId);
    if (Number.isNaN(petIdNum)) {
      return { error: "petId inválido" };
    }

    // This is a placeholder - you'll need to implement the actual metrics logic
    // Based on your API route at /api/home
    const metrics = {
      bathProgress: 0,
      vaccinesOk: 0,
      vaccinesExpiring: 0,
      lastFood: null,
      totalCalories: 0,
    };

    return { data: metrics };
  } catch (error) {
    console.error("Erro ao buscar métricas:", error);
    return { error: "Erro ao buscar métricas" };
  }
}
