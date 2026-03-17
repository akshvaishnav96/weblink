"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import styles from "./Toast.module.css";

export type ToastType = "error" | "success" | "warning" | "info";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}

const ICONS = {
  error:   XCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info:    Info,
};

function ToastCard({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 4s
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast.id, onRemove]);

  const Icon = ICONS[toast.type];

  return (
    <div className={`${styles.toast} ${styles[toast.type]} ${visible ? styles.visible : ""}`}>
      <Icon size={17} className={styles.toastIcon} />
      <span className={styles.toastMsg}>{toast.message}</span>
      <button
        className={styles.toastClose}
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div className={styles.container}>
      {toasts.map(t => (
        <ToastCard key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
