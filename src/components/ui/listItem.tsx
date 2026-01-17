import { Bubbles, Syringe } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "./skeleton";

type ListItemProps = {
  name: string;
  details: string;
  imageUrl: string | null;
};

export default function ListItem({ props }: { props: ListItemProps | null }) {

  if (!props) {
    return (
      <Skeleton className="flex gap-8 justify-center items-center w-full h-28 p-6 rounded-2xl" />
    );
  }

  return (
    <article className='flex relative bg-card border-2 border-border rounded-2xl h-28'>
      <Image className="rounded-l-2xl aspect-square" alt="Sol" width={112} height={112} src={props.imageUrl ?? "https://b9f3p436i6.ufs.sh/f/roy68gs0qxmufWKhjkSFBJDshp5Y0zXaTOENR6IQ3xAbvLgV"} />
      <div className="p-4 flex flex-col justify-between w-full">
        <h2 className="text-lg font-semibold text-card-foreground">{props.name}</h2>
        <p className="text-sm text-muted-foreground">{props.details}</p>
      </div>
    </article>
  )
}