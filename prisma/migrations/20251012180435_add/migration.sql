/*
  Warnings:

  - You are about to drop the column `pet_id` on the `vaccinations` table. All the data in the column will be lost.
  - Added the required column `applicationDate` to the `vaccinations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expirationDate` to the `vaccinations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `petId` to the `vaccinations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "vaccinations" DROP CONSTRAINT "vaccinations_pet_id_fkey";

-- AlterTable
ALTER TABLE "vaccinations" DROP COLUMN "pet_id",
ADD COLUMN     "applicationDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "expirationDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "petId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_petId_fkey" FOREIGN KEY ("petId") REFERENCES "animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
