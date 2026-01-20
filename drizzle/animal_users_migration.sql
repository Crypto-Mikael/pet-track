CREATE TYPE "public"."user_role" AS ENUM('owner', 'caretaker', 'vet');

CREATE TABLE "animal_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"animalId" integer NOT NULL,
	"userId" integer NOT NULL,
	"role" "user_role" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);

ALTER TABLE "animal_users" ADD CONSTRAINT "animal_users_animalId_animal_id_fk" FOREIGN KEY ("animalId") REFERENCES "public"."animal"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "animal_users" ADD CONSTRAINT "animal_users_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;