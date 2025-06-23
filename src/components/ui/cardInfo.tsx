import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

type CardCountProps = {
  subject: string;
  count: number;
  text: string;
  Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
};

export default function CardCount({ subject, count, text, Icon }: CardCountProps) {
  return (
    <div className='relative bg-card border-2 border-border p-4 pl-11 rounded-2xl'>
      <Icon className="absolute flex left-3 top-[28px] transform -translate-y-1/2 text-card-foreground" />
      <h2 className="text-lg font-semibold text-card-foreground">{count}</h2>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}