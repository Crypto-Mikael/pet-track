import CardNew from "@/components/ui/cardNew";
import CardPet from "@/components/ui/cardPet";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export default async function Page() {
  const clerkUser = await currentUser();
  const userPrisma = await prisma.user.findFirst({ where: { clerkId: clerkUser?.id } });
  const pets = userPrisma ? await prisma.pet.findMany({ where: { owner_id: userPrisma.id } }) : [];
  return (
    <>
      <h1 className="text-3xl text-foreground text-center border-b-2 border-border py-2">Pets</h1>
      <main className="flex flex-col gap-4 p-4">
        <CardNew />
        {pets?.map((pet) => (
          <CardPet key={pet.id} name={pet.name} details={pet.details ?? ''} />
        ))}
      </main>
    </>
  );
}
