import CardNew from "@/components/ui/cardNew";
import ListItem from "@/components/ui/listItem";
import db from "@/lib/db";
import { animal, users } from "@/lib/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";


export default async function Page() {
  const clerkUser = await currentUser();
  const user = await db.select().from(users).where(eq(users.clerkId, clerkUser?.id || '')).limit(1);
  const animals = await db.select().from(animal).where(eq(animal.ownerId, user[0].id));
  return (
    <>
      <h1 className="text-3xl text-foreground text-center border-b-2 border-border py-2">Pets</h1>
      <main className="flex flex-col gap-4 p-4">
        <CardNew />
        {animals?.map(animal => (
          <ListItem key={animal.id} name={animal.name} details={animal.details ?? ''} imageUrl={animal.imageUrl}/>
        ))}
      </main>
    </>
  );
}
