/*
  Warnings:

  - Added the required column `amount` to the `foods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kcal` to the `foods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "foods" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "carbs" DOUBLE PRECISION,
ADD COLUMN     "fat" DOUBLE PRECISION,
ADD COLUMN     "kcal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "protein" DOUBLE PRECISION;
