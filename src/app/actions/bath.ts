"use server";

import db from "@/lib/db";
import { baths, animalUsers, users } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function getBaths(petId: number) {
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
          eq(animalUsers.animalId, petId),
          eq(animalUsers.userId, user.id),
        ),
      )
      .limit(1);

    if (hasPermission.length === 0) {
      return { error: "Sem permissão para acessar este animal" };
    }

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
