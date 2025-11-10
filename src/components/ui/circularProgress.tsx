import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number | null
  icon?: React.ElementType
  size?: "sm" | "md" | "lg" | number
  textValue?: string
}

export function CircularProgress({
  value,
  icon: Icon = Check,
  size = "md",
  className,
  textValue,
  ...props
}: CircularProgressProps) {
  // Conversão de tamanho amigável
  const numericSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 60
      : size === "lg"
      ? 120
      : 80 // padrão "md"

  const safeValue = Math.max(0, Math.min(100, value ?? 0))
  const stroke = 8
  const radius = (numericSize - stroke) / 2
  const circumference = 2 * Math.PI * radius

  // Gap fixo embaixo (60 graus = 300 graus de arco)
  const arcAngle = 300
  const arcLength = (arcAngle / 360) * circumference
  const progressLength = (safeValue / 100) * arcLength
  const offset = arcLength - progressLength

  const colorClass =
    safeValue > 80
      ? "text-primary"
      : safeValue > 40
      ? "text-yellow-500"
      : "text-destructive"

  // tamanhos para skeletons (proporcionais)
  const skeletonCircleSize = numericSize
  const skeletonPercentWidth = Math.round(numericSize * 0.45)
  const skeletonPercentHeight = Math.max(12, Math.round(numericSize * 0.16))
  const skeletonTextWidth = Math.round(numericSize * 0.6)
  const skeletonTextHeight = Math.max(10, Math.round(numericSize * 0.12))

  if (value === null || value === undefined) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Skeleton
        className="rounded-full"
        style={{
          width: skeletonCircleSize,
          height: skeletonCircleSize,
          borderRadius: 9999,
        }}
      />

      {/* Percent skeleton */}
      <Skeleton
        className="rounded-md"
        style={{
          width: skeletonPercentWidth,
          height: skeletonPercentHeight,
          borderRadius: 8,
        }}
      />

      {/* Text value skeleton */}
      <Skeleton
        className="rounded-md"
        style={{
          width: skeletonTextWidth,
          height: skeletonTextHeight,
          borderRadius: 8,
        }}
      />
    </div>
  )
}


  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: numericSize, height: numericSize }}
        {...props}
      >
        <svg width={numericSize} height={numericSize} className="overflow-visible">
          <circle
            className="text-foreground/10 z-10"
            stroke="currentColor"
            fill="transparent"
            strokeWidth={numericSize / stroke}
            r={radius}
            cx={numericSize / 2}
            cy={numericSize / 2}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            style={{
              transform: "rotate(120deg)",
              transformOrigin: "50% 50%",
            }}
          />

          <circle
            className={colorClass}
            stroke="currentColor"
            fill="transparent"
            strokeWidth={numericSize / stroke}
            r={radius}
            cx={numericSize / 2}
            cy={numericSize / 2}
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
          <Icon width={numericSize / 2} height={numericSize / 2} className={cn(colorClass)} />
        </div>
      </div>

      <p className="text-foreground text-center text-3xl font-bold">{safeValue}%</p>
      <p className="text-foreground text-center text-xl font-semibold">{textValue}</p>
    </div>
  )
}
