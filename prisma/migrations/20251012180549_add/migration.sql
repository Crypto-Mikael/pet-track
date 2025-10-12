/*
  Warnings:

  - You are about to drop the column `vaccine_name` on the `vaccinations` table. All the data in the column will be lost.
  - Added the required column `vaccineName` to the `vaccinations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vaccinations" DROP COLUMN "vaccine_name",
ADD COLUMN     "vaccineName" TEXT NOT NULL;
