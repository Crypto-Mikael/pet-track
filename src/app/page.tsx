import CardCount from "@/components/ui/cardCount";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const clerkUser = await currentUser();
  const userPrisma = await prisma.user.findFirst({ where: { clerkId: clerkUser?.id } });
  const animal = await prisma.animal.findFirst({ where: { owner_id: userPrisma?.id } });
  return (
    <>
      <h1 className="text-3xl text-foreground text-center border-b-2 border-border py-2">Home</h1>
      <main className="flex flex-col">
        {animal && (
          <CardCount animal={animal} />
        )}
      </main>
    </>
  );
}
