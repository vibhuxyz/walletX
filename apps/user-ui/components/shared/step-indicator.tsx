"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: i === currentStep ? 1.1 : 1,
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i === currentStep
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </motion.div>
            <span
              className={`hidden text-xs font-medium sm:block ${
                i <= currentStep ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-px w-6 md:w-10 transition-colors ${
                i < currentStep ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
