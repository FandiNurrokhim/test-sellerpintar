import React, { useState } from "react";
import StepperSidebar from "./StepperSidebar";
import StepNavigation from "@/components/molecules/StepNavigation";

type StepItem = {
  title: string;
  description: string;
  component?: React.ReactNode;
  isLast?: boolean;
  multipleComponent?: boolean;
  components?: React.ReactNode[];
  skip?: boolean;
};

interface StepperFormRef {
  submit: () => Promise<boolean>;
  fetchPrevItem?: () => Promise<void>;
  isShowingQR?: boolean;
}
interface StepperLayoutProps {
  steps: StepItem[];
  formRefs: React.MutableRefObject<(null | StepperFormRef)[]>;
}

export default function StepperLayout({ steps, formRefs }: StepperLayoutProps) {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = steps[activeStep];

  const handleSubmit = async (): Promise<boolean> => {
    const formRef = formRefs.current[activeStep];
    if (formRef && formRef.submit) {
      const valid = await formRef.submit();
      if (!valid) {
        return false;
      }

      if (currentStep.title === "Whatsapp Configuration") {
        if (formRef.isShowingQR === false) {
          const submitResult = await formRef.submit();
          return submitResult;
        } else if (formRef.isShowingQR === true) {
          console.debug("QR is showing, can proceed to next step");
        }
      }
    } else {
      console.debug("No formRef or submit method found for this step.");
    }
    setActiveStep((prev) => Math.min(steps.length - 1, prev + 1));
    return true;
  };

  const handlePrevious = async () => {
    const prevStep = Math.max(0, activeStep - 1);
    const formRef = formRefs.current[prevStep];
    if (formRef && typeof formRef.fetchPrevItem === "function") {
      await formRef.fetchPrevItem();
    }
    setActiveStep(prevStep);
  };

  const handleSkip = () => {
    setActiveStep((prev) => Math.min(steps.length - 1, prev + 1));
  };

  return (
    <div className="flex gap-8">
      <div className="flex flex-col gap-8 flex-1 rounded-2xl">
        <div className="p-10 rounded-2xl bg-white dark:bg-[#161618]">
          <h2 className="text-2xl !font-sentient font-semibold mb-1 dark:text-white/80">
            {currentStep.title}
          </h2>
          <p className="text-[#A3AED0] dark:text-white/60 text-sm mb-6">
            {currentStep.description}
          </p>

          <div className="min-h-[400px] rounded-xl text-gray-600 mb-32">
            {currentStep.multipleComponent && currentStep.components ? (
              <div>{currentStep.components[0]}</div>
            ) : (
              currentStep.component
            )}
          </div>

          {!currentStep.multipleComponent && (
            <StepNavigation
              activeStep={activeStep}
              maxSteps={steps.length}
              onPrevious={handlePrevious}
              onNextStep={handleSubmit}
              skip={currentStep.skip}
              onSkipStep={handleSkip}
              isLast={currentStep.isLast}
            />
          )}
        </div>

        {currentStep.multipleComponent ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161618]">
            {currentStep.components && currentStep.components[1] && (
              <div className="flex-1 rounded-2xl">
                <div className="min-h-[400px] rounded-xl text-gray-600">
                  {currentStep.components[1]}
                </div>
              </div>
            )}
            <StepNavigation
              activeStep={activeStep}
              maxSteps={steps.length}
              onPrevious={handlePrevious}
              onNextStep={handleSubmit}
              skip={currentStep.skip}
              onSkipStep={handleSkip}
              isLast={currentStep.isLast}
            />
          </div>
        ) : null}
      </div>

      <StepperSidebar
        steps={steps.map((step, idx) => ({
          title: step.title,
          description: step.description,
          index: idx,
          isLast: step.isLast ?? idx === steps.length - 1,
        }))}
        activeStep={activeStep}
      />
    </div>
  );
}
