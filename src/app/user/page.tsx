import { ModeToggle } from '@/components/feat/ModeToggle';
import { Button } from '@/components/ui/button';
import { currentUser } from '@clerk/nextjs/server'
import { intlFormat } from "date-fns";
import { Pencil } from 'lucide-react';
export default async function Page() {
  const user = await currentUser();


  if (!user) {
    return (
      <main className="px-4 py-2">
        <h1 className="text-2xl font-bold">Usuário não encontrado</h1>
      </main>
    );
  }

  return (
    <>
      <main className="flex flex-col px-4 py-2">
        <img src={user.imageUrl} alt="User Avatar" className="self-center w-32 h-32 rounded-full mb-4" />
        <h1 className="text-2xl font-bold">{user.fullName}</h1>
        <p className="text-lg text-muted-foreground">
          Aqui desde {
            user.createdAt ? intlFormat(user.createdAt, {
              year: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            }) : "Data de criação desconhecida"
          }
        </p>
      </main>
      <section className="flex flex-col gap-4 px-4 py-2">
        <h1 className="text-2xl font-semibold">Visão Geral</h1>
        <div className='bg-card border-2 border-border p-4 rounded-2xl '>
          <h2 className="text-lg font-semibold">Email</h2>
          <p className="text-sm text-muted-foreground">{ user.emailAddresses[0]?.emailAddress || "Não disponível" }</p>
        </div>
        <div className='relative bg-card border-2 border-border p-4 rounded-2xl'>
          <h2 className="text-lg font-semibold">CPF</h2>
          <p className="text-sm text-muted-foreground">{ user?.backupCodeEnabled || "Não disponível" }</p>
          <Button className="absolute right-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" variant="secondary">
            <Pencil />
          </Button>
        </div>
        <div className='relative bg-card border-2 border-border p-4 rounded-2xl '>
          <h2 className="text-lg font-semibold">Telefone</h2>
          <p className="text-sm text-muted-foreground">{ user.phoneNumbers[0]?.phoneNumber || "Não disponível" }</p>
          <Button className="absolute right-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" variant="secondary">
            <Pencil />
          </Button>
        </div>
      </section>
      <section className="flex flex-col gap-4 px-4 py-2">
        <h1 className="text-2xl font-semibold">Preferências</h1>
        <div className='bg-card border-2 border-border p-4 rounded-2xl '>
          <h2 className="text-lg font-semibold">Tema</h2>
          <ModeToggle />
        </div>
      </section>
    </>
  );
}
