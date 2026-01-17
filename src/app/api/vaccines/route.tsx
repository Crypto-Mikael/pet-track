import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { vaccinations } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const petId = Number(searchParams.get("petId"));
  if (petId) {
    const list = await db
      .select()
      .from(vaccinations)
      .where(eq(vaccinations.petId, petId))
      .orderBy(asc(vaccinations.expirationDate));
    return NextResponse.json(list, { status: 200 });
  }
  const list = await db.select().from(vaccinations).orderBy(asc(vaccinations.expirationDate));
  return NextResponse.json(list, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.petId || !body.expirationDate || !body.vaccineName || !body.applicationDate) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    const [created] = await db
      .insert(vaccinations)
      .values({
        petId: Number(body.petId),
        applicationDate: new Date(body.applicationDate),
        expirationDate: new Date(body.expirationDate),
        vaccineName: body.vaccineName,
        updatedAt: new Date(),
      })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Vaccination creation failed:", error);
    return new NextResponse("Failed to create vaccination", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vaccineId = Number(searchParams.get("id"));
  if (!vaccineId) {
    return new NextResponse("Bad Request: Missing field", { status: 400 });
  }

  const deleted = await db.delete(vaccinations).where(eq(vaccinations.id, vaccineId)).returning();
  return NextResponse.json(deleted, { status: 200 });
}


export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vaccineId = Number(searchParams.get("id"));
  const body = await request.json();
  if (!body.expirationDate || !body.applicationDate) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const updateData: any = {};
  if (body.vaccineName) updateData.vaccineName = body.vaccineName;
  if (body.applicationDate) updateData.applicationDate = new Date(body.applicationDate);
  if (body.expirationDate) updateData.expirationDate = new Date(body.expirationDate);
  updateData.updatedAt = new Date();

  const [updated] = await db
    .update(vaccinations)
    .set(updateData)
    .where(eq(vaccinations.id, vaccineId))
    .returning();

  return NextResponse.json(updated, { status: 200 });
}
