"use server";

import db from "@/lib/db";
import { vaccinations } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function getVaccines(petId: string) {
  try {
    const petIdNum = Number(petId);
    if (Number.isNaN(petIdNum)) {
      return { error: "petId inválido" };
    }

    const vaccines = await db
      .select()
      .from(vaccinations)
      .where(eq(vaccinations.petId, petIdNum))
      .orderBy(desc(vaccinations.applicationDate));

    return { data: vaccines };
  } catch (error) {
    console.error("Erro ao buscar vacinas:", error);
    return { error: "Erro ao buscar vacinas" };
  }
}

export async function createVaccine(data: {
  petId: number;
  vaccineName: string;
  applicationDate: Date;
  expirationDate: Date;
}) {
  try {
    const [created] = await db
      .insert(vaccinations)
      .values({
        petId: data.petId,
        vaccineName: data.vaccineName,
        applicationDate: data.applicationDate,
        expirationDate: data.expirationDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return { data: created };
  } catch (error) {
    console.error("Erro ao criar vacina:", error);
    return { error: "Erro ao criar vacina" };
  }
}

export async function updateVaccine(
  id: number,
  data: {
    vaccineName?: string;
    applicationDate?: Date;
    expirationDate?: Date;
  },
) {
  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.vaccineName) updateData.vaccineName = data.vaccineName;
    if (data.applicationDate) updateData.applicationDate = data.applicationDate;
    if (data.expirationDate) updateData.expirationDate = data.expirationDate;

    const [updated] = await db
      .update(vaccinations)
      .set(updateData)
      .where(eq(vaccinations.id, id))
      .returning();

    return { data: updated };
  } catch (error) {
    console.error("Erro ao atualizar vacina:", error);
    return { error: "Erro ao atualizar vacina" };
  }
}

export async function deleteVaccine(id: number) {
  try {
    await db.delete(vaccinations).where(eq(vaccinations.id, id));

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar vacina:", error);
    return { error: "Erro ao deletar vacina" };
  }
}
