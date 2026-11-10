import React from 'react';
import { Check } from 'lucide-react';
import './Stepper.css';

export const Stepper = ({ currentStep, steps, onStepClick }) => {
  return (
    <div className="stepper-container" aria-label="Onboarding Progress">
      <div className="stepper-track">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isAccessible = stepNumber <= currentStep;

          return (
            <React.Fragment key={step.id || index}>
              <div
                className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => isCompleted && onStepClick && onStepClick(stepNumber)}
                role={isCompleted ? 'button' : 'region'}
                tabIndex={isCompleted ? 0 : -1}
                aria-current={isActive ? 'step' : undefined}
              >
                <div className="step-indicator">
                  {isCompleted ? (
                    <Check className="step-check-icon" size={16} strokeWidth={3} />
                  ) : (
                    <span className="step-number">{stepNumber}</span>
                  )}
                </div>
                <div className="step-content">
                  <span className="step-label-title">{step.title}</span>
                  {step.subtitle && <span className="step-label-subtitle">{step.subtitle}</span>}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`stepper-connector ${stepNumber < currentStep ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

