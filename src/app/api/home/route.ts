import { differenceInDays, endOfToday, isBefore, startOfToday } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import {
  animal,
  foods,
  baths,
  vaccinations,
  Vaccination,
  Food,
} from "@/lib/schema";
import { eq, gte, lte, and, asc, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = Number(searchParams.get("petId"));

    const [petData] = await db
      .select()
      .from(animal)
      .where(eq(animal.id, Number(petId)))
      .limit(1);
    if (!petData) {
      return new NextResponse("Pet not found", { status: 404 });
    }

    const foodList = await db
      .select()
      .from(foods)
      .where(
        and(
          eq(foods.petId, petId),
          gte(foods.createdAt, startOfToday()),
          lte(foods.createdAt, endOfToday()),
        ),
      )
      .orderBy(desc(foods.createdAt));

    const dailyCaloriePercentage = calculateCaloriePercentage(
      foodList,
      Number(petData.dailyCalorieGoal),
    );

    const dailyCalories = calculateDailyCalories(foodList);

    const bathList = await db
      .select()
      .from(baths)
      .where(eq(baths.petId, petId))
      .orderBy(asc(baths.date));

    let bathPercentage = 0;
    if (bathList.length > 0) {
      const lastBath = bathList[bathList.length - 1];
      const lastBathDate = new Date(lastBath.date);
      const daysWithoutBath = differenceInDays(new Date(), lastBathDate);

      bathPercentage =
        Math.round(
          Math.max(
            0,
            100 - (daysWithoutBath / (petData.bathsCycleDays || 28)) * 100,
          ),
        ) ?? 0;
    }

    const vaccineList = await db
      .select()
      .from(vaccinations)
      .where(eq(vaccinations.petId, petId))
      .orderBy(asc(vaccinations.expirationDate));
    const vaccinePercentage = calculateValidVaccinePercentage(vaccineList) ?? 0;

    return NextResponse.json(
      {
        bathPercentage,
        bathQtd: bathList.length,
        dailyCaloriePercentage,
        dailyCalories,
        vaccinePercentage,
        vaccineTotal: vaccineList.length,
        vaccineValid: vaccineList.filter(
          (v) => !isBefore(v.expirationDate, new Date()),
        ).length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to fetch pets:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function calculateValidVaccinePercentage(
  vaccines: Vaccination[] | null,
): number | null {
  if (!vaccines || vaccines.length === 0) return null;

  const validVaccines = vaccines.filter(
    (v) => !isBefore(v.expirationDate, new Date()),
  );
  return Math.round((validVaccines.length / vaccines.length) * 100);
}

function calculateDailyCalories(foodList: Food[] | null): number {
  if (!foodList || foodList.length === 0) return 0;
  return foodList.reduce((sum, f) => sum + Number(f.kcal), 0);
}

function calculateCaloriePercentage(
  foodList: Food[] | null,
  goal: number,
): number {
  const dailyCalories = calculateDailyCalories(foodList);
  return Math.round((dailyCalories / goal) * 100);
}
