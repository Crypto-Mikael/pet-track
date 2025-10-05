import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const petId = Number(searchParams.get("id"));
  if (!petId) {
    return new NextResponse("Bad Request: Missing petId", { status: 400 });
  }

  const baths = await prisma.bath.findMany({
    orderBy: {
      date: "asc",
    },
    where: { pet_id: petId },
  });
  return NextResponse.json(baths, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.petId || !body.date) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    const bath = await prisma.bath.create({
      data: {
        pet_id: body.petId as number,
        date: new Date(body.date),
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(bath, { status: 201 });
  } catch (error) {
    console.error("Bath creation failed:", error);
    return new NextResponse("Failed to create bath", { status: 500 });
  }
}
