/*
  Warnings:

  - A unique constraint covering the columns `[clerkId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerkId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable

-- Aqui você pode adicionar um script para popular clerkId para linhas existentes, por exemplo:
-- UPDATE "users" SET "clerkId" = gen_random_uuid() WHERE "clerkId" IS NULL;
-- (Ajuste conforme sua lógica de negócio)

-- Após garantir que clerkId está preenchido e único:
-- ALTER TABLE "users" ALTER COLUMN "clerkId" SET NOT NULL;
-- CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");
