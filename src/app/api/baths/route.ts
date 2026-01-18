import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { baths } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const petId = Number(searchParams.get("id"));
  if (!petId) {
    return new NextResponse("Bad Request: Missing petId", { status: 400 });
  }

  const list = await db
    .select()
    .from(baths)
    .where(eq(baths.petId, petId))
    .orderBy(baths.date);

  return NextResponse.json(list, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.petId || !body.date) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    const [created] = await db
      .insert(baths)
      .values({
        petId: body.petId as number,
        date: new Date(body.date),
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Bath creation failed:", error);
    return new NextResponse("Failed to create bath", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bathId = Number(searchParams.get("id"));
  if (!bathId) {
    return new NextResponse("Bad Request: Missing bathId", { status: 400 });
  }

  const deleted = await db
    .delete(baths)
    .where(eq(baths.id, bathId))
    .returning();
  return NextResponse.json(deleted, { status: 200 });
}
