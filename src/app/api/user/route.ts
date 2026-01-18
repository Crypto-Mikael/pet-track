import { currentUser } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { animal, users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("id");

    if (petId) {
      // Buscar pet por ID
      const petRes = await db
        .select()
        .from(animal)
        .where(eq(animal.id, Number(petId)))
        .limit(1);
      const pet = petRes[0];

      if (!pet) {
        return new NextResponse("Pet not found", { status: 404 });
      }

      return NextResponse.json(pet, { status: 200 });
    }

    // Buscar o usuário primeiro
    const usersRes = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUser.id))
      .limit(1);

    const user = usersRes[0];

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Buscar todos os pets do usuário
    const animals = await db
      .select()
      .from(animal)
      .where(eq(animal.ownerId, user.id));

    return NextResponse.json(animals, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch pets:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
