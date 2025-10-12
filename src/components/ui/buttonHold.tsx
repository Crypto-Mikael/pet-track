import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HoldToConfirmButtonProps = {
  onHoldFinished: () => void;
  holdDuration?: number;
  onProgressChange?: (percent: number) => void;
  initialText?: string;
  midHoldText?: string;
  nearCompletionText?: string;
  completedText?: string;
  className?: string;
  progressColor?: string; // ex: "bg-primary" ou "linear-gradient(...)"
};

const HoldToConfirmButton: React.FC<HoldToConfirmButtonProps> = ({
  onHoldFinished,
  holdDuration = 1500,
  onProgressChange,
  initialText = "Dar banho",
  midHoldText = "Dando banho...",
  nearCompletionText = "Secando...",
  completedText = "Banho Concluído!",
  className,
  progressColor = "bg-primary",
}) => {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(0);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isHoldingRef = useRef(false);

  // Observa o tamanho real do botão
  useEffect(() => {
    if (!buttonRef.current) return;
    const el = buttonRef.current;
    const ro = new ResizeObserver(() => {
      setButtonWidth(el.offsetWidth);
    });
    ro.observe(el);
    setButtonWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const pct = Math.min((elapsed / holdDuration) * 100, 100);
    setProgress(pct);
    onProgressChange?.(Math.round(pct));

    if (pct < 100 && isHoldingRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (pct >= 100) {
      animationRef.current = null;
      isHoldingRef.current = false;
      onHoldFinished();
      setCompleted(true);
    }
  };

  const startHold = () => {
    if (completed) return;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    startTimeRef.current = null;
    isHoldingRef.current = true;
    animationRef.current = requestAnimationFrame(animate);
  };

  const cancelHold = () => {
    if (completed) return;
    isHoldingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    startTimeRef.current = null;
    setProgress(0);
    onProgressChange?.(0);
  };

  return (
    <Button
      ref={buttonRef}
      onMouseDown={startHold}
      onTouchStart={(e) => { e.preventDefault(); startHold(); }}
      onTouchEnd={cancelHold}
      onTouchCancel={cancelHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      className={cn("relative font-bold h-9 overflow-hidden w-auto px-4", className)}
      variant="outline"
      disabled={completed}
    >
      {/* Sem transition — atualizamos a largura diretamente por requestAnimationFrame */}
      <div
        className={cn("absolute left-0 top-0 h-full", progressColor)}
        style={{
          width: buttonWidth ? `${(progress / 100) * buttonWidth}px` : "0px",
          transition: "none",
        }}
        aria-hidden
      />
      <span className="relative z-10 whitespace-nowrap">
        {progress === 0 && !completed && initialText}
        {progress > 0 && progress < 60 && !completed && midHoldText}
        {progress >= 60 && progress < 100 && !completed && nearCompletionText}
        {completed && completedText}
      </span>
    </Button>
  );
};

export default HoldToConfirmButton;
