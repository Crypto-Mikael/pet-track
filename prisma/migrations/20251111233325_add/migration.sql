-- CreateTable
CREATE TABLE "foods" (
    "id" SERIAL NOT NULL,
    "pet_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
