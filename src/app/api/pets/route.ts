import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.formData();

    const name = body.get("name") as string;
    const details = body.get("details") as string;
    const breed = body.get("breed") as string;
    const age = body.get("age") as string;

    console.log(body.values());
    if (!name || !breed || !age) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const newPet = await prisma.pet.create({
      data: {
        name,
        details,
        breed,
        age: new Date(age),
        imageUrl: "", // Assuming the uploadthing returns a URL
        owner_id: user.id,
        updatedAt: new Date(), // Add this line if updatedAt is required
      },
    });

    return NextResponse.json(newPet, { status: 201 });
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

export async function GET() {
  return new NextResponse("BOMBA", { status: 200 });
}
