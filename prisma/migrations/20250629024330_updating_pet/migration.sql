/*
  Warnings:

  - Made the column `breed` on table `pets` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `age` to the `pets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pets" ALTER COLUMN "breed" SET NOT NULL,
DROP COLUMN "age",
ADD COLUMN     "age" TIMESTAMP(3) NOT NULL;
