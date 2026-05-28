"use client";

import { cn } from "@/lib/utils";

interface StepProgressProps {
   currentStep: number;
   totalSteps: number;
}

export function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
   return (
      <div className="flex items-center gap-2">
         {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div
               key={step}
               className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  step <= currentStep ? "bg-neutral-800" : "bg-neutral-200",
               )}
            />
         ))}
      </div>
   );
}
