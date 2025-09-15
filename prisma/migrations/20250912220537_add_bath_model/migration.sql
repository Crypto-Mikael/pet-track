-- CreateTable
CREATE TABLE "baths" (
    "id" SERIAL NOT NULL,
    "pet_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "baths_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "baths" ADD CONSTRAINT "baths_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
