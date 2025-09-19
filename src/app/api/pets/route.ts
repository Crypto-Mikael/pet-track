import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    if (!body.name || !body.breed || !body.age) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    await prisma.animal.create({
      data: {
        name: body.name,
        details: body.details,
        breed: body.breed,
        gender: body.gender,
        age: new Date(body.age),
        imageUrl: body.imageUrl,
        owner_id: user.id,
        updatedAt: new Date(), // Add this line if updatedAt is required
      },
    });

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

export async function GET() {
  return new NextResponse("BOMBA", { status: 200 });
}
