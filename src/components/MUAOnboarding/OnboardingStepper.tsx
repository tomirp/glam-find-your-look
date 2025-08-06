import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; description: string }[];
}

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({ 
  currentStep, 
  totalSteps, 
  steps 
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={stepNumber} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    {
                      "bg-primary border-primary text-white": isCompleted,
                      "bg-primary/10 border-primary text-primary": isCurrent,
                      "bg-muted border-muted-foreground/30 text-muted-foreground": !isCompleted && !isCurrent,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{stepNumber}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-sm font-medium",
                    {
                      "text-primary": isCompleted || isCurrent,
                      "text-muted-foreground": !isCompleted && !isCurrent,
                    }
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {stepNumber < totalSteps && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    {
                      "bg-primary": stepNumber < currentStep,
                      "bg-muted-foreground/30": stepNumber >= currentStep,
                    }
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};