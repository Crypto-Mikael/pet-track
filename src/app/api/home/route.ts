import { Food, Vaccination } from "@/app/generated/prisma";
import prisma from "@/lib/prisma";
import { differenceInDays, endOfToday, isBefore, startOfToday } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = Number(searchParams.get("petId"));

    const animal = await prisma.animal.findFirst({
      where: { id: Number(petId) },
    });
    if (!animal) {
      return new NextResponse("Pet not found", { status: 404 });
    }

    const foods = await prisma.food.findMany({
      where: {
        pet_id: petId,
        createdAt: {
          gte: startOfToday(),
          lte: endOfToday(),
        },
      },
    });

    const dailyCaloriePercentage = calculateCaloriePercentage(
      foods,
      animal.dailyCalorieGoal
    );

    const dailyCalories = calculateDailyCalories(foods);

    const baths = await prisma.bath.findMany({
      where: {
        pet_id: petId,
      },
    });

    const lastBath = baths[baths.length - 1];
    const lastBathDate = new Date(lastBath.date);
    const daysWithoutBath = differenceInDays(new Date(), lastBathDate);

    const bathPercentage =
      Math.round(
        Math.max(0, 100 - (daysWithoutBath / animal.bathsCycleDays) * 100)
      ) ?? 0;
    console.log(petId);
    const vaccinations = await prisma.vaccination.findMany({
      orderBy: {
        expirationDate: "asc",
      },
      where: { petId },
    });
    const vaccinePercentage =
      calculateValidVaccinePercentage(vaccinations) ?? 0;
    return NextResponse.json(
      {
        bathPercentage,
        bathQtd: baths.length,
        dailyCaloriePercentage,
        dailyCalories,
        vaccinePercentage,
        vaccineTotal: vaccinations.length,
        vaccineValid: vaccinations.filter(
          (v) => !isBefore(v.expirationDate, new Date())
        ).length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch pets:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function calculateValidVaccinePercentage(vaccines: Vaccination[] | null) {
  if (!vaccines || vaccines.length === 0) return null;

  const validVaccines = vaccines.filter(
    (v) => !isBefore(v.expirationDate, new Date())
  );
  return Math.round((validVaccines.length / vaccines.length) * 100);
}

function calculateDailyCalories(foods: Food[] | null): number {
  if (!foods || foods.length === 0) return 0;
  return foods.reduce((sum, f) => sum + f.kcal, 0);
}

function calculateCaloriePercentage(
  foods: Food[] | null,
  goal: number
): number {
  const dailyCalories = calculateDailyCalories(foods);
  return Math.round((dailyCalories / goal) * 100);
}
