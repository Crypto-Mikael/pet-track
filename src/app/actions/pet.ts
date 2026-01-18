"use server";

import { currentUser } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { animal, users, baths } from "@/lib/schema";
import { eq } from "drizzle-orm";

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

    await db
      .insert(baths)
      .values({
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
