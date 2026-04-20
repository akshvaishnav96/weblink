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
  const params2 = useParams<{ id: string }>();
  const urlOrderId = params2?.id ?? "";

  const session = (() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.QUEUE_STATUS);
      return raw ? JSON.parse(raw) as {
        bookingId: string; orderId?: string; position: number;
        serviceName: string; staffName: string; duration: string;
        people: number; waitMins: number;
        firstName?: string; email?: string;
        skipCount?: number; skipLimit?: number;
      } : null;
    } catch { return null; }
  })();

  const bookingId   = session?.bookingId   ?? "";
  const orderId     = session?.orderId     ?? urlOrderId;
  const serviceName = session?.serviceName ?? "";
  const staffName   = session?.staffName   ?? "";
  const duration    = session?.duration    ?? "—";
  const people      = session?.people      ?? 1;
  const waitMins    = session?.waitMins    ?? 0;
  const firstName   = session?.firstName   ?? "";
  const email       = session?.email       ?? "";

  // ── Live state ─────────────────────────────────────────────────────────────
  const [position, setPosition] = useState(session?.position ?? 1);
  const [estWaitMins, setEstWait]    = useState(waitMins);
  const [view,        setView]       = useState<QueueView>("waiting");
  const [modal,       setModal]      = useState<ModalView>(null);
  const [skipCount,   setSkipCount]  = useState(session?.skipCount  ?? 0);
  const [skipLimit,   setSkipLimit]  = useState<number | null>(session?.skipLimit ?? null); // locked on first skip
  const [countdown,   setCountdown]  = useState(YOUR_TURN_SECONDS);
  const [isLeaving,   setIsLeaving]  = useState(false);
  const [isSkipping,  setIsSkipping] = useState(false);

  // ── Poll booking details for live position ─────────────────────────────────
  const fetchPosition = useCallback(async () => {
    if (!orderId) return;
    try {
      const res  = await fetch(API_ENDPOINTS.QUEUE_DETAILS(orderId));
      const json = await res.json();
      if (!json.status) return;

      const data = json.data ?? json;
      const pos  = data.queue_order ?? data.queue_position;
      if (pos !== undefined) setPosition(Number(pos));

      if (data.is_turn || pos === 0) {
        setView("your-turn");
        setCountdown(YOUR_TURN_SECONDS);
      }
    } catch { /* ignore polling errors */ }
  }, [orderId]);

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
      if (orderId) {
        await fetch(API_ENDPOINTS.QUEUE_ACTION(orderId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel" }),
        });
      }
    } catch { /* best-effort */ } finally {
      setIsLeaving(false);
      router.replace(`/barbers/${slug}`);
    }
  }

  // Lock the limit on the FIRST skip based on position at that moment:
  // position === 1 → 1 skip max | position > 1 → 5 skips max
  const effectiveLimit = skipLimit ?? (position <= 1 ? 1 : 5);
  const canSkip  = skipCount < effectiveLimit;
  const skipUsed = skipCount >= effectiveLimit; // kept for component compat

  async function confirmSkip() {
    if (!canSkip) return;
    const lockedLimit = skipLimit ?? (position <= 1 ? 1 : 5);
    if (skipLimit === null) setSkipLimit(lockedLimit);
    setIsSkipping(true);
    try {
      let newSkipCount = skipCount + 1; // always increment locally
      if (orderId) {
        const res  = await fetch(API_ENDPOINTS.QUEUE_ACTION(orderId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "skip" }),
        });
        const json = await res.json();
        if (json.status && json.data) {
          if (json.data.queue_order != null) setPosition(Number(json.data.queue_order));
          // Use server count if returned, otherwise keep local increment
          if (json.data.skip_count != null) newSkipCount = Number(json.data.skip_count);
        }
      } else {
        setPosition(p => p + 1);
      }
      setSkipCount(newSkipCount); // always apply
      // Persist skip state so it survives a page refresh
      try {
        const raw = sessionStorage.getItem(STORAGE_KEYS.QUEUE_STATUS);
        if (raw) {
          const stored = JSON.parse(raw);
          sessionStorage.setItem(STORAGE_KEYS.QUEUE_STATUS, JSON.stringify({
            ...stored,
            skipCount: newSkipCount,
            skipLimit: lockedLimit,
          }));
        }
      } catch { /* ignore storage errors */ }
      setModal(null);
      if (view === "your-turn") {
        setView("waiting");
        setCountdown(YOUR_TURN_SECONDS);
      }
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
    bookingId, orderId, serviceName, staffName, duration, people, firstName, email,
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
    goHome: () => router.replace(`/barbser/${slug}`),
  } as const;
}

export type QueueStatusState = ReturnType<typeof useQueueStatus>;
