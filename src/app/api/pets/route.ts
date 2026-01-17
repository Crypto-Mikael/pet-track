import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { users, animal, baths } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    if (!body.name || !body.breed || !body.age || !body.lastBath) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    const usersRes = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUser.id))
      .limit(1);
    const user = usersRes[0];

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    await db
      .insert(animal)
      .values({
        name: body.name,
        details: body.details,
        breed: body.breed,
        gender: body.gender,
        age: new Date(body.age),
        imageUrl: body.imageUrl,
        weightKg: body.weightKg,
        ownerId: user.id,
        updatedAt: new Date(),
      })
      .returning();

    await db
      .insert(baths)
      .values({
        petId: body.petId as number,
        date: new Date(body.lastBath),
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json("", { status: 201 });
  } catch (error) {
    console.error("Pet creation failed:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return new NextResponse("Pet with this name already exists", {
        status: 409,
      });
    }
    return new NextResponse("Failed to create pet", { status: 500 });
  }
}

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

export async function PUT(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const petId = Number(searchParams.get("id"));
    const bathsCycleDays = Number(searchParams.get("bathsCycleDays"));

    if (!petId) {
      return new NextResponse("Pet ID required", { status: 404 });
    }

    const petRes = await db
      .select()
      .from(animal)
      .where(eq(animal.id, petId))
      .limit(1);
    const pet = petRes[0];

    if (!pet) {
      return new NextResponse("Pet not found", { status: 404 });
    }

    const [petUpdated] = await db
      .update(animal)
      .set({ bathsCycleDays })
      .where(eq(animal.id, petId))
      .returning();

    return NextResponse.json(petUpdated, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch pets:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
