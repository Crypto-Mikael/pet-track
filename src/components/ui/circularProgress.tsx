import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, Check } from "lucide-react"

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // de 0 a 100
  icon?: LucideIcon
  size?: number
  gapAngle?: number // ângulo do espaço em branco (em graus)
}

export function CircularProgress({
  value,
  icon: Icon = Check,
  size = 80,
  gapAngle = 60,
  className,
  ...props
}: CircularProgressProps) {
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  // comprimento total menos o espaço do gap
  const effectiveCircumference =
    circumference * ((360 - gapAngle) / 360)

  // deslocamento baseado no progresso
  const strokeDashoffset =
    effectiveCircumference - (value / 100) * effectiveCircumference

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      {/* Aqui rotacionamos para que o gap fique embaixo */}
      <svg width={size} height={size} className="rotate-120">
        {/* Trilha */}
        <circle
          className="text-muted"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={effectiveCircumference}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
        {/* Progresso */}
        <circle
          className={
            "transition-all duration-300 " +
            (value > 80
              ? "text-primary"
              : value > 40
              ? "text-accent"
              : "text-destructive")
          }
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={effectiveCircumference}
          strokeDashoffset={strokeDashoffset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>

      {/* Ícone central */}
      <div className="absolute flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
  )
}
