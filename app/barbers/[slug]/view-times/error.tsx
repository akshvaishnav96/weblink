"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ViewTimesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ViewTimesError]", error.message);
  }, [error]);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-[16px] px-[24px] text-center">
      <h2 className="text-[20px] font-bold text-[#1a1a1a]">Couldn&apos;t load times</h2>
      <p className="text-[14px] text-[#999] max-w-[320px]">
        We had trouble loading availability. Please try again.
      </p>
      <div className="flex gap-[12px]">
        <button
          onClick={reset}
          className="py-[10px] px-[24px] rounded-[999px] bg-[#B8860B] text-white text-[13px] font-semibold border-none cursor-pointer"
        >
          Try again
        </button>
        <button
          onClick={() => router.back()}
          className="py-[10px] px-[24px] rounded-[999px] bg-[#f0ece4] text-[#333] text-[13px] font-semibold border-none cursor-pointer"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
