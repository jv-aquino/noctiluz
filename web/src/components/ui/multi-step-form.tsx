/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactNode, useState } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  validation?: () => boolean;
}

interface MultiStepFormProps<T = Record<string, unknown>> {
  steps: Step[];
  onComplete: (data: T) => Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  continueText?: string;
  backText?: string;
  className?: string;
  initialData?: T;
}

export function MultiStepForm<T = Record<string, unknown>>({
  steps,
  onComplete,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
  continueText = "Continue",
  backText = "Back",
  className,
  initialData = {} as T
}: MultiStepFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<T>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const canProceed = currentStepData.validation ? currentStepData.validation() : true;

  const handleNext = () => {
    if (canProceed && !isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLastStep) return;

    setIsSubmitting(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Step Indicators */}
      <div className="flex items-center justify-center space-x-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentStep ? "bg-pink-500" : "bg-gray-300"
              )}
            />
            {index < steps.length - 1 && (
              <div className="w-4 h-px bg-gray-300 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Step Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {currentStepData.title}
        </h3>
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {currentStepData.content}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6"
          >
            {cancelText}
          </Button>
          
          <div className="flex space-x-3">
            {!isFirstStep && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
                className="px-6"
              >
                ← {backText}
              </Button>
            )}
            
            {!isLastStep ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
                className="px-6 bg-pink-500 hover:bg-pink-600 text-white"
              >
                {continueText} →
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!canProceed || isSubmitting}
                className="px-6 bg-pink-500 hover:bg-pink-600 text-white"
              >
                {isSubmitting ? 'Submitting...' : submitText}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// Hook for managing form data in child components
export function useMultiStepForm<T = Record<string, unknown>>() {
  const [formData, setFormData] = useState<T>({} as T);

  const updateFormData = (updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return { formData, updateFormData };
} 