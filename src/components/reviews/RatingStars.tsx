import React from "react";
import { Star } from "lucide-react";
import { cn } from "../prototype/PrototypeUI";

function clampRating(value: number): number {
  return Number.isFinite(value) ? Math.min(5, Math.max(0, value)) : 0;
}

export function RatingStars({ rating, size = 14, className, showValue = false }: {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  const normalized = clampRating(rating);
  return <span className={cn("inline-flex items-center gap-1", className)} aria-label={`${normalized.toFixed(1)} de 5 estrelas`}>
    <span className="inline-flex gap-0.5 text-amber-400" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((index) => {
        const fillPercent = Math.round(Math.min(1, Math.max(0, normalized - index)) * 100);
        return <span key={index} className="relative inline-flex" style={{ width: size, height: size }}>
          <Star size={size} className="absolute inset-0 text-amber-400/50" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
            <Star size={size} fill="currentColor" className="text-amber-400" />
          </span>
        </span>;
      })}
    </span>
    {showValue && <span className="text-xs text-muted-foreground">{normalized.toFixed(1).replace(".0", "")}</span>}
  </span>;
}
