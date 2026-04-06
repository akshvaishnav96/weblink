"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styles from "./BackHeader.module.css";

interface BackHeaderProps {
  title: string;
}

export default function BackHeader({ title }: BackHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-[var(--sp-3)] py-[var(--sp-3)] px-[var(--sp-4)] bg-white sticky top-0 z-[50] border-b border-transparent transition-[border-color,box-shadow] duration-200 md:py-[var(--sp-6)] md:px-[var(--sp-4)] md:border-b-0 md:max-w-[var(--content-max)] md:w-full">
      {/* btn: :hover + svg child selector — kept in CSS module */}
      <button
        onClick={() => router.back()}
        className={styles.btn}
        aria-label="Go back"
      >
        <ArrowLeft />
      </button>
      <h1 className="text-base font-semibold text-[1rem] text-[var(--color-text-primary)] md:text-lg md:font-bold">{title}</h1>
    </header>
  );
}
