import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  label?: string;
  error?: string;
};

export function Input({
  className,
  type,
  label,
  error,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? React.useId();

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        data-slot="input"
        className={cn(
          // Base
          "w-full rounded-md border bg-transparent px-3",

          // Mobile-first sizing
          "h-11 text-base md:h-9 md:text-sm",

          // Colors
          "border-input placeholder:text-muted-foreground dark:bg-input/30",

          // Focus
          "outline-none transition-[box-shadow,border-color]",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",

          // Error state
          error &&
            "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40",

          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",

          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />

      {error && (
        <span
          id={`${inputId}-error`}
          className="text-xs text-destructive"
        >
          {error}
        </span>
      )}
    </div>
  );
}
