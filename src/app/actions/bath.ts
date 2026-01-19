"use server";

import db from "@/lib/db";
import { baths } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function getBaths(petId: number) {
  try {
    const bathList = await db
      .select()
      .from(baths)
      .where(eq(baths.petId, petId))
      .orderBy(desc(baths.date));

    return { data: bathList };
  } catch (error) {
    console.error("Erro ao buscar banhos:", error);
    return { error: "Erro ao buscar banhos" };
  }
}

export async function createBath(data: {
  petId: number;
  date: Date;
  notes?: string | null;
}) {
  try {
    const [created] = await db
      .insert(baths)
      .values({
        petId: data.petId,
        date: data.date,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return { data: created };
  } catch (error) {
    console.error("Erro ao criar banho:", error);
    return { error: "Erro ao criar banho" };
  }
}

export async function deleteBath(id: number) {
  try {
    await db.delete(baths).where(eq(baths.id, id));

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar banho:", error);
    return { error: "Erro ao deletar banho" };
  }
}
