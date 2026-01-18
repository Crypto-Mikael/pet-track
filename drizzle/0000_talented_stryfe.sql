CREATE TABLE "animal" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"details" text,
	"breed" text NOT NULL,
	"imageUrl" text,
	"gender" text NOT NULL,
	"age" timestamp NOT NULL,
	"ownerId" integer NOT NULL,
	"weightKg" numeric NOT NULL,
	"bathsCycleDays" integer DEFAULT 28 NOT NULL,
	"dailyCalorieGoal" numeric DEFAULT '500' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "baths" (
	"id" serial PRIMARY KEY NOT NULL,
	"petId" integer NOT NULL,
	"date" timestamp NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" serial PRIMARY KEY NOT NULL,
	"petId" integer NOT NULL,
	"name" text NOT NULL,
	"amount" numeric,
	"kcal" numeric NOT NULL,
	"protein" numeric,
	"fat" numeric,
	"carbs" numeric,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerkId" varchar(255) NOT NULL,
	"name" text NOT NULL,
	"cpf" text,
	"phone" text,
	"email" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "users_clerkId_unique" UNIQUE("clerkId")
);
--> statement-breakpoint
CREATE TABLE "vaccinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"petId" integer NOT NULL,
	"vaccineName" text NOT NULL,
	"expirationDate" timestamp NOT NULL,
	"applicationDate" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
