import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { foods, animal } from "@/lib/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const id = searchParams.get("id");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (id) {
      const [food] = await db
        .select()
        .from(foods)
        .where(eq(foods.id, Number(id)))
        .limit(1);

      if (!food) {
        return NextResponse.json(
          { error: "Alimento não encontrado" },
          { status: 404 },
        );
      }

      return NextResponse.json(food, { status: 200 });
    }

    if (petId) {
      // Construir where com filtro de data opcional
      // Construir filtro
      const filters: any[] = [eq(foods.petId, Number(petId))];
      if (startDate && endDate) {
        filters.push(gte(foods.createdAt, new Date(startDate)));
        filters.push(lte(foods.createdAt, new Date(endDate)));
      }

      const list = await db
        .select()
        .from(foods)
        .where(and(...filters))
        .orderBy(desc(foods.createdAt));

      return NextResponse.json(list, { status: 200 });
    }

    return NextResponse.json({ error: "petId é obrigatório" }, { status: 400 });
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
    const { petId, name, amount, kcal, protein, fat, carbs, notes } = body;

    if (!petId || !name || kcal === undefined) {
      return NextResponse.json(
        { error: "Campos obrigatórios: pet_id, name, kcal" },
        { status: 400 },
      );
    }

    // Verificar se o pet existe
    const [pet] = await db
      .select()
      .from(animal)
      .where(eq(animal.id, Number(petId)))
      .limit(1);
    if (!pet) {
      return NextResponse.json(
        { error: "Pet não encontrado" },
        { status: 404 },
      );
    }

    const [created] = await db
      .insert(foods)
      .values({
        petId: Number(petId),
        name,
        amount: amount !== undefined ? Number(amount) : null,
        kcal: Number(kcal),
        protein: protein !== undefined ? Number(protein) : null,
        fat: fat !== undefined ? Number(fat) : null,
        carbs: carbs !== undefined ? Number(carbs) : null,
        notes: notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

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

    const body = await request.json();
    const { name, amount, kcal, protein, fat, carbs, notes } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (amount !== undefined) updateData.amount = Number(amount);
    if (kcal !== undefined) updateData.kcal = Number(kcal);
    if (protein !== undefined)
      updateData.protein = protein ? Number(protein) : null;
    if (fat !== undefined) updateData.fat = fat ? Number(fat) : null;
    if (carbs !== undefined) updateData.carbs = carbs ? Number(carbs) : null;
    if (notes !== undefined) updateData.notes = notes || null;
    updateData.updated_at = new Date();

    const [food] = await db
      .update(foods)
      .set(updateData)
      .where(eq(foods.id, Number(id)))
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
