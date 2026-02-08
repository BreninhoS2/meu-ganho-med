"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  hints: string[];
}

export function getPasswordStrength(password: string): StrengthResult {
  const hints: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    hints.push("Mínimo 8 caracteres");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    hints.push("Uma letra minúscula");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    hints.push("Uma letra maiúscula");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    hints.push("Um número");
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  }

  let label = "Muito fraca";
  let color = "bg-destructive";

  if (score >= 5) {
    label = "Muito forte";
    color = "bg-primary";
  } else if (score >= 4) {
    label = "Forte";
    color = "bg-success";
  } else if (score >= 3) {
    label = "Média";
    color = "bg-warning";
  } else if (score >= 2) {
    label = "Fraca";
    color = "bg-warning";
  }

  return { score, label, color, hints };
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthProps) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              level <= strength.score ? strength.color : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Label and hints */}
      <div className="flex items-center justify-between text-xs">
        <span className={cn(
          "font-medium",
          strength.score >= 4 ? "text-success" : 
          strength.score >= 3 ? "text-warning" : "text-destructive"
        )}>
          {strength.label}
        </span>
        {strength.hints.length > 0 && (
          <span className="text-muted-foreground">
            Falta: {strength.hints.slice(0, 2).join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
