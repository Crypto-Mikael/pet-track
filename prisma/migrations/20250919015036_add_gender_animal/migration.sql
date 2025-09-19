/*
  Warnings:

  - Added the required column `gender` to the `animal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- AlterTable
ALTER TABLE "animal" ADD COLUMN     "gender" "Gender" NOT NULL;
