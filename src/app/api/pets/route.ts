import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, details, breed, age, owner_id } = body;

    if (!name || !breed || !age || !owner_id) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const newPet = await prisma.pet.create({
      data: {
        name,
        details,
        breed,
        age: new Date(age),
        owner_id,
        updatedAt: new Date(), // Add this line if updatedAt is required
      },
    });
    return NextResponse.json(newPet, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
