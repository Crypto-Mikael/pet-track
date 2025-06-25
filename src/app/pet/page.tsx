import CardNew from "@/components/ui/cardNew";

export default function Page() {
  return (
    <>
      <h1 className="text-3xl text-foreground text-center border-b-2 border-border py-2">Pets</h1>
      <main className="flex flex-col gap-4 p-4">
        <CardNew />
      </main>
    </>
  );
}
