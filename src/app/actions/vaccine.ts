"use server";

import db from "@/lib/db";
import { vaccinations, animalUsers, users } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function getVaccines(petId: string) {
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

    const petIdNum = Number(petId);
    if (Number.isNaN(petIdNum)) {
      return { error: "petId inválido" };
    }

    const hasPermission = await db
      .select()
      .from(animalUsers)
      .where(
        and(
          eq(animalUsers.animalId, petIdNum),
          eq(animalUsers.userId, user.id),
        ),
      )
      .limit(1);

    if (hasPermission.length === 0) {
      return { error: "Sem permissão para acessar este animal" };
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

    const hasPermission = await db
      .select()
      .from(animalUsers)
      .where(
        and(
          eq(animalUsers.animalId, data.petId),
          eq(animalUsers.userId, user.id),
        ),
      )
      .limit(1);

    if (hasPermission.length === 0) {
      return { error: "Sem permissão para acessar este animal" };
    }

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
