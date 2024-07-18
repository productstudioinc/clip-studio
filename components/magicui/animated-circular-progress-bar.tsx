import React from "react";
import { cn } from "@/lib/utils";
import { State } from "@/utils/helpers/use-rendering";

interface Props {
  max?: number;
  min?: number;
  className?: string;
  children: React.ReactNode;
  state: State;
  undo: () => void;
}

export default function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  className,
  children,
  state,
  undo,
}: Props) {
  const circumference = 2 * Math.PI * 45;
  const percentPx = circumference / 100;
  const currentPercent =
    state.status === "rendering" ? state.progress * 100 : 0;

  return (
    <div
      className={cn("relative size-40", className)}
      style={
        {
          "--circle-size": "100px",
          "--circumference": circumference,
          "--percent-to-px": `${percentPx}px`,
          "--gap-percent": "5",
          "--offset-factor": "0",
          "--transition-length": "1s",
          "--transition-step": "200ms",
          "--delay": "0s",
          "--percent-to-deg": "3.6deg",
          transform: "translateZ(0)",
        } as React.CSSProperties
      }
    >
      <svg
        fill="none"
        className="size-full"
        strokeWidth="2"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="10"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-100"
          style={
            {
              stroke: "hsl(var(--muted))",
              strokeDasharray: `${circumference} ${circumference}`,
              transition: "all var(--transition-length) ease var(--delay)",
              transformOrigin: "center",
            } as React.CSSProperties
          }
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="10"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-100"
          style={
            {
              stroke: "hsl(var(--primary))",
              strokeDasharray: `${circumference} ${circumference}`,
              strokeDashoffset:
                circumference - (currentPercent / 100) * circumference,
              transition:
                "stroke-dashoffset var(--transition-length) ease var(--delay)",
              transform: "rotate(-90deg)",
              transformOrigin: "center",
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 m-auto flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
