import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { users, animal, animalUsers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const petId = searchParams.get("petId");
    const role = searchParams.get("role");

    if (!petId || !role) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 },
      );
    }

    const usersRes = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUser.id))
      .limit(1);

    const user = usersRes[0];
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    // Check if pet exists
    const petExists = await db
      .select()
      .from(animal)
      .where(eq(animal.id, Number(petId)))
      .limit(1);

    if (petExists.length === 0) {
      return NextResponse.json(
        { error: "Pet não encontrado" },
        { status: 404 },
      );
    }

    // Check if user already has access to this pet
    const existingRelation = await db
      .select()
      .from(animalUsers)
      .where(
        and(
          eq(animalUsers.animalId, Number(petId)),
          eq(animalUsers.userId, user.id),
        ),
      )
      .limit(1);

    if (existingRelation.length > 0) {
      return NextResponse.json(
        { error: "Você já tem acesso a este pet" },
        { status: 400 },
      );
    }

    // Add user to pet with specified role
    await db.insert(animalUsers).values({
      animalId: Number(petId),
      userId: user.id,
      role: role as "owner" | "caretaker" | "vet",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no compartilhamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
