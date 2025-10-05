/*
  Warnings:

  - You are about to drop the column `cleanCycleDays` on the `animal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "animal" DROP COLUMN "cleanCycleDays",
ADD COLUMN     "bathsCycleDays" INTEGER NOT NULL DEFAULT 28;
