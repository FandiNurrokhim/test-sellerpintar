import Button from "../atoms/Button";
import { useRouter } from "next/navigation";
import { useToast } from "../atoms/ToastProvider";

type Props = {
  activeStep: number;
  maxSteps: number;
  onPrevious: () => void;
  onNextStep?: () => boolean | Promise<boolean>;
  onSkipStep?: () => void;
  skip?: boolean;
  isLast?: boolean;
};

export default function StepNavigation({
  activeStep,
  maxSteps,
  onPrevious,
  onNextStep,
  onSkipStep,
  skip = false,
  isLast = false,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  const handleFinish = async () => {
    sessionStorage.setItem("alreadySetupBranch", "true");
    sessionStorage.setItem("alreadySetupProduct", "true");
    sessionStorage.setItem("alreadySetupAI", "true");
    sessionStorage.setItem("alreadySetupWhatsApp", "true");
    sessionStorage.setItem("alreadySetupWhatsAppQR", "true");
    sessionStorage.setItem("keyFeature", "false");
    showToast("Setup completed successfully!", "success");
    router.push("/dashboard");
  };

  return (
    <div className="flex justify-between mt-6">
      <div className="flex gap-4">
        <Button onClick={onPrevious} disabled={activeStep === 0}>
          Previous
        </Button>
        <Button
          onClick={async () => {
            if (isLast) {
              await handleFinish();
            } else if (onNextStep) {
              await onNextStep();
            }
          }}
          disabled={activeStep === maxSteps - 1 && !isLast}
        >
          {isLast ? "Finish" : "Next"}
        </Button>
      </div>
      {skip && (
        <Button
          className="bg-transparent dark:bg-transparent hover:bg-transparent text-[#A3AED0] hover:text-blue-600 hover:text-blue-800 transition font-semibold"
          onClick={onSkipStep}
          disabled={activeStep === maxSteps - 1 && !isLast}
        >
          Skip
        </Button>
      )}
    </div>
  );
}
