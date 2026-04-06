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
    <header className={styles.header}>
      <button
        onClick={() => router.back()}
        className={styles.btn}
        aria-label="Go back"
      >
        <ArrowLeft />
      </button>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
