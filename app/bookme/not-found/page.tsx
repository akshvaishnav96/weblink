"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BookmeNotFound() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--color-surface-alt, #f5f5f5)", textAlign: "center" }}>
      <h1 style={{ fontSize: "4rem", fontWeight: 700, margin: 0 }}>404</h1>
      <p style={{ fontSize: "1.25rem", margin: "0.75rem 0 2rem" }}>We couldn't find what you were looking for.</p>
      <button
        onClick={() => router.back()}
        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "999px", border: "none", background: "#B8860B", color: "#fff", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}
      >
        <ArrowLeft size={18} />
        Go Back
      </button>
    </div>
  );
}
