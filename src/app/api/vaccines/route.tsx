import { Vaccination } from "@/app/generated/prisma";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const petId = Number(searchParams.get("id"));
  if (petId) {
    const vaccinations = await prisma.vaccination.findMany({
      orderBy: {
        expirationDate: "asc",
      },
      where: { petId },
    });
    return NextResponse.json(vaccinations, { status: 200 });
  }
  const vaccinations = await prisma.vaccination.findMany({
      orderBy: {
        expirationDate: "asc",
      },
    });
  return NextResponse.json(vaccinations, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<Vaccination>;
    if (!body.petId || !body.expirationDate || !body.vaccineName || !body.applicationDate) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    const vaccine = await prisma.vaccination.create({
      data: {
        petId: body.petId,
        applicationDate: body.applicationDate,
        expirationDate: body.expirationDate,
        vaccineName: body.vaccineName,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(vaccine, { status: 201 });
  } catch (error) {
    console.error("Bath creation failed:", error);
    return new NextResponse("Failed to create bath", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vaccineId = Number(searchParams.get("id"));
  if (!vaccineId) {
    return new NextResponse("Bad Request: Missing field", { status: 400 });
  }

  const baths = await prisma.vaccination.delete({
    where: { id: vaccineId },
  });
  return NextResponse.json(baths, { status: 200 });
}


export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vaccineId = Number(searchParams.get("id"));
  const body = await request.json() as Partial<Vaccination>;
  if (!body.expirationDate || !body.applicationDate) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const vaccine = await prisma.vaccination.update({
    data: { ...body },
    where: { id: vaccineId }
  })

  return NextResponse.json(vaccine, { status: 200 });
}
