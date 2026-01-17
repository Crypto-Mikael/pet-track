import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerkId", { length: 255 }).notNull().unique(),
  name: text("name").notNull(),
  cpf: text("cpf"),
  phone: text("phone"),
  email: text("email").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const animal = pgTable("animal", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  details: text("details"),
  breed: text("breed").notNull(),
  imageUrl: text("imageUrl"),
  gender: text("gender").notNull(),
  age: timestamp("age").notNull(),
  ownerId: integer("ownerId").notNull(),
  weightKg: numeric("weightKg").notNull(),
  bathsCycleDays: integer("bathsCycleDays").default(28).notNull(),
  dailyCalorieGoal: numeric("dailyCalorieGoal").default("500").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const vaccinations = pgTable("vaccinations", {
  id: serial("id").primaryKey(),
  petId: integer("petId").notNull(),
  vaccineName: text("vaccineName").notNull(),
  expirationDate: timestamp("expirationDate").notNull(),
  applicationDate: timestamp("applicationDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const baths = pgTable("baths", {
  id: serial("id").primaryKey(),
  petId: integer("petId").notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  petId: integer("petId").notNull(),
  name: text("name").notNull(),
  amount: numeric("amount").notNull(),
  kcal: numeric("kcal").notNull(),
  protein: numeric("protein"),
  fat: numeric("fat"),
  carbs: numeric("carbs"),
  notes: text("notes"),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
});

type Animal = typeof animal.$inferSelect;
type Bath = typeof baths.$inferSelect;
type Food = typeof foods.$inferSelect;
type User = typeof users.$inferSelect;
type Vaccination = typeof vaccinations.$inferSelect;
export type { Animal, Bath, Food, User, Vaccination };
