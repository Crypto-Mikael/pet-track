import Image from "next/image";

export default function NewUserHome() {
  return (
    <main className="flex flex-col items-center bg-background gap-4 p-4">      
      <Image
        src="/Caramelo3.png"
        alt="User Avatar"
        width={216}
        height={216}
        className="w-54 h-54 rounded-full"
      />      <h2 className="text-3xl text-foreground">Seja Bem-vindo!</h2>
      <p className="text-2xl text-foreground">Vamos finalizar seu cadastro?</p>
    </main>
  )
}