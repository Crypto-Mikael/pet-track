import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number | null
  icon?: React.ElementType
  size?: number
  textValue?: string
}

export function CircularProgress({
  value,
  icon: Icon = Check,
  size = 80,
  className,
  textValue,
  ...props
}: CircularProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value ?? 0))
  
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  
  // Gap fixo embaixo (60 graus = 300 graus de arco)
  const arcAngle = 300
  
  // Comprimento do arco (300 graus)
  const arcLength = (arcAngle / 360) * circumference
  
  // Progresso baseado no arco
  const progressLength = (safeValue / 100) * arcLength
  
  // Offset para começar vazio e preencher até o valor
  const offset = arcLength - progressLength
  
  const colorClass = safeValue > 80 
    ? "text-primary" 
    : safeValue > 40 
    ? "text-yellow-500" 
    : "text-destructive"

  if (!value) {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <Skeleton className="size-20 rounded-full" />
        <Skeleton className="w-15 h-9 rounded-full" />
        <Skeleton className="w-18 h-7 rounded-full" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2">
      { value ? <div
          className={cn("relative flex items-center justify-center", className)}
          style={{ width: size, height: size }}
          {...props}
        >
          <svg width={size} height={size}>
            {/* Trilha de fundo */}
            <circle
              className="text-foreground/10"
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              r={radius}
              cx={size / 2}
              cy={size / 2}
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={0}
              style={{ 
                transform: "rotate(120deg)",
                transformOrigin: "50% 50%",
              }}
            />
            
            {/* Círculo de progresso */}
            <circle
              className={colorClass}
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              r={radius}
              cx={size / 2}
              cy={size / 2}
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={offset}
              style={{ 
                transform: "rotate(120deg)",
                transformOrigin: "50% 50%",
                transition: "stroke-dashoffset ease-out",
              }}
            />
          </svg>

          <div className="absolute flex items-center justify-center">
            <Icon className={cn("w-12 h-12", colorClass)} />
          </div>
        </div> : <Skeleton className="size-20 rounded-full" />}
        
        
        {value ? <p className="text-foreground text-center text-3xl font-bold">{safeValue}%</p> : <Skeleton className="w-20 h-9" /> }
        {value && textValue ? <p className="text-foreground text-center text-xl font-semibold">{textValue}</p> : <Skeleton className="w-16 h-7" /> }
      </div>
      
    </>
  )
}