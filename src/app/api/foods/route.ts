import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const id = searchParams.get("id");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (id) {
      // Buscar alimento específico por ID
      const food = await prisma.food.findUnique({
        where: { id: Number(id) },
      });

      if (!food) {
        return NextResponse.json(
          { error: "Alimento não encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(food, { status: 200 });
    }

    if (petId) {
      // Construir where com filtro de data opcional
      interface WhereInput {
        pet_id: number;
        createdAt?: {
          gte: Date;
          lte: Date;
        };
      }

      const where: WhereInput = { pet_id: Number(petId) };

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      // Buscar alimentos do pet com filtro opcional de data
      const foods = await prisma.food.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(foods, { status: 200 });
    }

    return NextResponse.json({ error: "petId é obrigatório" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao buscar alimentos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pet_id, name, amount, kcal, protein, fat, carbs, notes } = body;

    if (!pet_id || !name || kcal === undefined) {
      return NextResponse.json(
        { error: "Campos obrigatórios: pet_id, name, kcal" },
        { status: 400 }
      );
    }

    // Verificar se o pet existe
    const pet = await prisma.animal.findUnique({
      where: { id: Number(pet_id) },
    });

    if (!pet) {
      return NextResponse.json(
        { error: "Pet não encontrado" },
        { status: 404 }
      );
    }

    const food = await prisma.food.create({
      data: {
        pet_id: Number(pet_id),
        name,
        amount: Number(amount) || 0,
        kcal: Number(kcal),
        protein: protein ? Number(protein) : null,
        fat: fat ? Number(fat) : null,
        carbs: carbs ? Number(carbs) : null,
        notes: notes || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(food, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar alimento:", error);
    return NextResponse.json(
      { error: "Erro ao criar alimento" },
      { status: 500 }
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

    const food = await prisma.food.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(kcal !== undefined && { kcal: Number(kcal) }),
        ...(protein !== undefined && {
          protein: protein ? Number(protein) : null,
        }),
        ...(fat !== undefined && { fat: fat ? Number(fat) : null }),
        ...(carbs !== undefined && { carbs: carbs ? Number(carbs) : null }),
        ...(notes !== undefined && { notes: notes || null }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(food, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar alimento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar alimento" },
      { status: 500 }
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

    await prisma.food.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: "Alimento deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar alimento:", error);
    return NextResponse.json(
      { error: "Erro ao deletar alimento" },
      { status: 500 }
    );
  }
}
