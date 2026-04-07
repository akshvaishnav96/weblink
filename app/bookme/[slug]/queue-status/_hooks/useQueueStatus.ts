"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { STORAGE_KEYS } from "@/lib/constants";

// How often to poll for position updates (ms)
const POLL_INTERVAL_MS = 15_000;
// Countdown duration when it's your turn (seconds)
const YOUR_TURN_SECONDS = 5 * 60;

export type QueueView = "waiting" | "your-turn";
export type ModalView = "leave" | "skip" | null;

export function useQueueStatus() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug   = params?.slug ?? "";

  // ── Read session data written by queue-booking on success ─────────────────
  const session = (() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.QUEUE_STATUS);
      return raw ? JSON.parse(raw) as {
        bookingId: string; pin: string; position: number;
        serviceName: string; staffName: string; duration: string;
        people: number; waitMins: number;
      } : null;
    } catch { return null; }
  })();

  const bookingId   = session?.bookingId   ?? "";
  const pin         = session?.pin         ?? "";
  const serviceName = session?.serviceName ?? "";
  const staffName   = session?.staffName   ?? "";
  const duration    = session?.duration    ?? "—";
  const people      = session?.people      ?? 1;
  const waitMins    = session?.waitMins    ?? 0;

  // ── Live state ─────────────────────────────────────────────────────────────
  const [position, setPosition] = useState(session?.position ?? 1);
  const [estWaitMins, setEstWait]    = useState(waitMins);
  const [view,        setView]       = useState<QueueView>("waiting");
  const [modal,       setModal]      = useState<ModalView>(null);
  const [skipCount,   setSkipCount]  = useState(0);
  const [skipLimit,   setSkipLimit]  = useState<number | null>(null); // locked on first skip
  const [countdown,   setCountdown]  = useState(YOUR_TURN_SECONDS);
  const [isLeaving,   setIsLeaving]  = useState(false);
  const [isSkipping,  setIsSkipping] = useState(false);

  // ── Poll booking details for live position ─────────────────────────────────
  const fetchPosition = useCallback(async () => {
    if (!bookingId) return;
    try {
      const res  = await fetch(API_ENDPOINTS.BOOKING_DETAILS(bookingId));
      const json = await res.json();
      if (!json.status) return;

      const data = json.data ?? json;
      const pos  = data.queue_position ?? data.position;
      if (pos !== undefined) setPosition(Number(pos));

      const wait = data.estimated_wait ?? data.wait_minutes;
      if (wait !== undefined) setEstWait(Number(wait));

      // Show timer when position reaches 0
      if (data.is_your_turn || data.queue_position === 0) {
        setView("your-turn");
        setCountdown(YOUR_TURN_SECONDS);
      }
    } catch { /* ignore polling errors */ }
  }, [bookingId]);

  useEffect(() => {
    fetchPosition();
    const id = setInterval(fetchPosition, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchPosition]);

  // ── If position=0 in session data, show timer immediately on mount ──────────
  useEffect(() => {
    if ((session?.position ?? 1) === 0) {
      setView("your-turn");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Countdown when it's your turn ─────────────────────────────────────────
  useEffect(() => {
    if (view !== "your-turn") return;
    const id = setInterval(() => {
      setCountdown(s => {
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [view]);

  // ── Actions ────────────────────────────────────────────────────────────────

  async function confirmLeave() {
    setIsLeaving(true);
    try {
      if (bookingId) {
        await fetch(API_ENDPOINTS.BOOKING_CANCEL(bookingId), { method: "POST" });
      }
    } catch { /* best-effort */ } finally {
      setIsLeaving(false);
      router.replace(`/bookme/${slug}`);
    }
  }

  // Lock the limit on the FIRST skip based on position at that moment:
  // position === 1 → 1 skip max | position > 1 → 5 skips max
  const effectiveLimit = skipLimit ?? (position <= 1 ? 1 : 5);
  const canSkip  = skipCount < effectiveLimit;
  const skipUsed = skipCount >= effectiveLimit; // kept for component compat

  async function confirmSkip() {
    if (!canSkip) return;
    // Lock the limit the first time: position 0 or 1 = 1 skip only, else 5
    if (skipLimit === null) setSkipLimit(position <= 1 ? 1 : 5);
    setIsSkipping(true);
    try {
      setPosition(p => p + 1);
      setSkipCount(n => n + 1);
      setModal(null);
      // Skipping from the timer screen → go back to waiting, reset countdown
      if (view === "your-turn") {
        setView("waiting");
        setCountdown(YOUR_TURN_SECONDS);
      }
      // In production: call your skip-queue API here
    } catch { /* ignore */ } finally {
      setIsSkipping(false);
    }
  }

  // ── Countdown formatting ───────────────────────────────────────────────────
  const countdownMins = String(Math.floor(countdown / 60)).padStart(1, "0");
  const countdownSecs = String(countdown % 60).padStart(2, "0");
  const countdownLabel = `${countdownMins}:${countdownSecs}`;
  const countdownProgress = countdown / YOUR_TURN_SECONDS;  // 1→0

  return {
    // Booking info
    bookingId, pin, serviceName, staffName, duration, people,
    // Live queue state
    position, estWaitMins, view,
    // Modals
    modal, openModal: (m: ModalView) => setModal(m), closeModal: () => setModal(null),
    // Skip
    skipUsed, canSkip, skipCount, skipLimit: effectiveLimit, isSkipping, confirmSkip,
    // Leave
    isLeaving, confirmLeave,
    // Your-turn countdown
    countdown, countdownLabel, countdownProgress,
    // Navigation
    goHome: () => router.replace(`/bookme/${slug}`),
  } as const;
}

export type QueueStatusState = ReturnType<typeof useQueueStatus>;
