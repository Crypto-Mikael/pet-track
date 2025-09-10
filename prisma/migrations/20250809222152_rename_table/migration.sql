/*
  Warnings:

  - You are about to drop the `pets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pets" DROP CONSTRAINT "pets_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "vaccinations" DROP CONSTRAINT "vaccinations_pet_id_fkey";

-- DropTable
DROP TABLE "pets";

-- CreateTable
CREATE TABLE "animal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "breed" TEXT NOT NULL,
    "imageUrl" TEXT,
    "age" TIMESTAMP(3) NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
