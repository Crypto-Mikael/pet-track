import { z } from "zod";

export const createFoodSchema = z.object({
  petId: z.coerce.number().int().positive("petId deve ser um número positivo"),
  name: z.string().min(1, "Nome é obrigatório"),
  amount: z.coerce.number().optional().nullable(),
  kcal: z.coerce.number().positive("Calorias deve ser um número positivo"),
  protein: z.coerce.number().optional().nullable(),
  fat: z.coerce.number().optional().nullable(),
  carbs: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
});

export const updateFoodSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.coerce.number().optional().nullable(),
  kcal: z.coerce.number().positive().optional(),
  protein: z.coerce.number().optional().nullable(),
  fat: z.coerce.number().optional().nullable(),
  carbs: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const getFoodsQuerySchema = z.object({
  petId: z.string().transform((val) => Number(val)).refine((val) => !Number.isNaN(val), "petId deve ser um número válido"),
  id: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateFoodInput = z.infer<typeof createFoodSchema>;
export type UpdateFoodInput = z.infer<typeof updateFoodSchema>;
export type GetFoodsQuery = z.infer<typeof getFoodsQuerySchema>;
