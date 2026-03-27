interface ProgressStepsProps {
  currentStep: 1 | 2;
}

const CIRCLE_BASE = "w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 md:w-[26px] md:h-[26px] md:text-[11px]";
const CIRCLE_INACTIVE = `${CIRCLE_BASE} bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]`;
const CIRCLE_ACTIVE   = `${CIRCLE_BASE} bg-[var(--color-primary)] text-[var(--color-white)]`;

const LABEL_BASE     = "text-[12px] font-medium text-[var(--color-text-muted)] whitespace-nowrap md:text-sm";
const LABEL_ACTIVE   = "text-[12px] font-semibold text-[var(--color-primary)] whitespace-nowrap md:text-sm";

const DIVIDER_BASE   = "flex-1 h-px bg-[var(--color-border)] min-w-[24px]";
const DIVIDER_DONE   = "flex-1 h-px bg-[var(--color-primary-border)] min-w-[24px]";

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className="flex items-center gap-[var(--sp-2)] pt-[var(--sp-2)] px-[var(--sp-4)] pb-[var(--sp-3)] md:pt-[var(--sp-4)] md:px-[var(--sp-6)] md:pb-[var(--sp-5)]">
      {/* Step 1 */}
      <div className="flex items-center gap-[6px] flex-shrink-0">
        <div className={currentStep >= 1 ? CIRCLE_ACTIVE : CIRCLE_INACTIVE}>
          {currentStep > 1 ? "✓" : "1"}
        </div>
        <span className={currentStep === 1 ? LABEL_ACTIVE : LABEL_BASE}>
          Details
        </span>
      </div>

      {/* Connector */}
      <div className={currentStep > 1 ? DIVIDER_DONE : DIVIDER_BASE} />

      {/* Step 2 */}
      <div className="flex items-center gap-[6px] flex-shrink-0">
        <span className={currentStep === 2 ? LABEL_ACTIVE : LABEL_BASE}>
          Payment
        </span>
        <div className={currentStep >= 2 ? CIRCLE_ACTIVE : CIRCLE_INACTIVE}>
          2
        </div>
      </div>
    </div>
  );
}
