import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { foods, animal, type Food } from "@/lib/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";
import { createFoodSchema, updateFoodSchema, getFoodsQuerySchema, type CreateFoodInput, type UpdateFoodInput } from "@/lib/validations/food";
import type { ZodError } from "zod";

function handleZodError(error: ZodError<unknown>) {
  const messages = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  return NextResponse.json({ errors: messages }, { status: 400 });
}

function convertNumericFields<T extends Record<string, unknown>>(data: T, numericFields: (keyof T)[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (numericFields.includes(key as keyof T) && value !== undefined && value !== null) {
      result[key] = String(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const foodId = Number(id);
      if (Number.isNaN(foodId)) {
        return NextResponse.json(
          { error: "ID inválido" },
          { status: 400 },
        );
      }

      const [food] = await db
        .select()
        .from(foods)
        .where(eq(foods.id, foodId))
        .limit(1);

      if (!food) {
        return NextResponse.json(
          { error: "Alimento não encontrado" },
          { status: 404 },
        );
      }

      return NextResponse.json(food, { status: 200 });
    }

    const queryParams = Object.fromEntries(searchParams);
    const validation = getFoodsQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const { petId, startDate, endDate } = validation.data;
    const conditions = [eq(foods.petId, petId)];

    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      conditions.push(gte(foods.createdAt, startDateObj));
      conditions.push(lte(foods.createdAt, endDateObj));
    }

    const list = await db
      .select()
      .from(foods)
      .where(and(...conditions))
      .orderBy(desc(foods.createdAt));

    return NextResponse.json(list, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar alimentos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createFoodSchema.safeParse(body);

    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const { petId, name, amount, kcal, protein, fat, carbs, notes } = validation.data;

    // Verificar se o pet existe
    const [pet] = await db
      .select()
      .from(animal)
      .where(eq(animal.id, petId))
      .limit(1);

    if (!pet) {
      return NextResponse.json(
        { error: "Pet não encontrado" },
        { status: 404 },
      );
    }

     const foodData = convertNumericFields(
       { petId, name, amount, kcal, protein, fat, carbs, notes },
       ['amount', 'kcal', 'protein', 'fat', 'carbs'],
     );

     const food = {
       ...foodData,
       createdAt: new Date(),
       updatedAt: new Date(),
     } as unknown as Food;

     const [created] = await db.insert(foods).values(food).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar alimento:", error);
    return NextResponse.json(
      { error: "Erro ao criar alimento" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const foodId = Number(id);
    if (Number.isNaN(foodId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validation = updateFoodSchema.safeParse(body);

    if (!validation.success) {
      return handleZodError(validation.error);
    }

     const validatedData = validation.data;

     const updateData = convertNumericFields(validatedData, ['amount', 'kcal', 'protein', 'fat', 'carbs']);
     updateData.updatedAt = new Date();

    const [food] = await db
      .update(foods)
      .set(updateData)
      .where(eq(foods.id, foodId))
      .returning();

    return NextResponse.json(food, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar alimento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar alimento" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await db
      .delete(foods)
      .where(eq(foods.id, Number(id)))
      .returning();

    return NextResponse.json(
      { message: "Alimento deletado com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao deletar alimento:", error);
    return NextResponse.json(
      { error: "Erro ao deletar alimento" },
      { status: 500 },
    );
  }
}
