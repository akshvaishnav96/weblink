"use client";

interface TimeSlotButtonProps {
  time: string;
  selected?: boolean;
  onClick?: () => void;
  variant?: "full" | "pill";
}

export default function TimeSlotButton({
  time,
  selected,
  onClick,
  variant = "full",
}: TimeSlotButtonProps) {
  if (variant === "pill") {
    return (
      <button
        onClick={onClick}
        className={selected
          ? "inline-flex items-center justify-center py-[11px] px-5 rounded-[12px] border-[1.5px] border-[var(--color-primary)] bg-[var(--color-primary)] text-[13.5px] font-semibold text-[var(--color-white)] cursor-pointer whitespace-nowrap transition-[background,border-color,color,box-shadow] duration-150 shadow-[0_2px_10px_rgba(184,134,11,0.28)] md:py-3 md:px-[22px] md:text-[14px] md:font-bold"
          : "inline-flex items-center justify-center py-[11px] px-5 rounded-[12px] border-[1.5px] border-[#E8E4DD] bg-[#F5F3EF] text-[13.5px] font-medium text-[var(--color-text-primary)] cursor-pointer whitespace-nowrap transition-[background,border-color,color,box-shadow] duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-primary)] hover:shadow-[0_2px_8px_rgba(184,134,11,0.12)] md:py-3 md:px-[22px] md:text-[14px] md:font-bold"
        }
        style={{padding:"0.5rem 0.8rem" , fontWeight:"bolder"}}
      >
        {time}
      </button>
    );
  }

  return (


<button
  onClick={onClick}
  className={
    selected
      ? "flex items-center justify-center w-full h-[3rem] px-3 rounded-full border-[1.5px] border-[#1a1a1a] bg-[#1a1a1a] text-[0.859rem] font-semibold !text-white cursor-pointer transition-[background,border-color,color] duration-[120ms] select-none whitespace-nowrap shadow-[0_2px_10px_rgba(0,0,0,0.25)] md:text-base"
      : "flex items-center justify-center w-full h-[3rem] px-3 rounded-full border-[1.5px] border-[#E0DDD7] bg-white text-[0.859rem] font-medium text-[#2a2a2a] cursor-pointer transition-[background,border-color,color] duration-[120ms] select-none whitespace-nowrap hover:border-[var(--color-primary-border)] md:text-base"
  }
    style={{color:selected? "white" : "", fontWeight:"bold"}}
>
  {time}
</button>


  );
}
