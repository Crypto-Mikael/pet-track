import * as React from "react"
import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  icon?: React.ElementType
  size?: number
  textValue?: string
}

export function CircularProgress({
  value = 0,
  icon: Icon = Check,
  size = 80,
  className,
  textValue,
  ...props
}: CircularProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value))
  
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

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg width={size} height={size}>
          {/* Trilha de fundo */}
          <circle
            className="text-gray-300"
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
      </div>
      
      <p className="text-gray-900 text-3xl font-bold">{safeValue}%</p>
      {textValue && <p className="text-gray-900 text-xl font-semibold">{textValue}</p>}
    </div>
  )
}