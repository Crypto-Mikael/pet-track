import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";

type HoldToConfirmButtonProps = {
  onHoldFinished: () => void;
  holdDuration?: number;
  onProgressChange?: (percent: number) => void; // agora envia percent
};

const HoldToConfirmButton: React.FC<HoldToConfirmButtonProps> = ({
  onHoldFinished,
  holdDuration = 1500,
  onProgressChange,
}) => {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    if (completed) return;
    const startTime = Date.now();

    holdTimer.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const newProgress = Math.min((elapsedTime / holdDuration) * 100, 100);
      const percent = Math.round(newProgress);
      setProgress(newProgress);
      if (onProgressChange) onProgressChange(percent);
      if (newProgress === 100) {
        clearInterval(holdTimer.current!);
        onHoldFinished();
        setCompleted(true);
      }
    }, 16);
  };

  const handleMouseUp = () => {
    if (completed) return;
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
    }
    setProgress(0);
    if (onProgressChange) onProgressChange(0);
  };

  return (
    <Button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="relative h-12 font-bold overflow-hidden"
      variant="outline"
      disabled={completed}
    >
      <div
        className="absolute left-0 top-0 h-12 bg-primary transition-all"
        style={{ width: `${progress}%`, transition: 'width 0.016s linear' }}
      />
      <span className="text-2xl relative z-10">
        {progress === 0 && !completed && 'Dar banho'}
        {progress > 0 && progress < 60 && !completed && 'Dando banho...'}
        {progress >= 60 && progress < 100 && !completed && 'Secando...'}
        {completed && 'Banho Concluído!'}
      </span>
    </Button>
  );
};

export default HoldToConfirmButton;
