"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import styles from "./page.module.css";

const TOTAL_STEPS = 7;
const CURRENT_STEP = 6;

export default function RatingPage() {
  const router       = useRouter();
  const params       = useSearchParams();
  const routeParams  = useParams<{ slug: string; id: string }>();
  const slug         = routeParams?.slug ?? "";

  // Booking info from query params (passed from queue-status)
  const serviceName = params.get("serviceName") ?? "Service";
  const duration    = params.get("duration")    ?? "";
  const staffName   = params.get("staffName")   ?? "";

  const [rating,       setRating]       = useState(0);
  const [hovered,      setHovered]      = useState(0);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  const activeStars = hovered || rating;

  async function handleSubmit() {
    if (!rating || submitting) return;
    setSubmitting(true);
    try {
      // TODO: call rating API with rating value
      // await fetch(`/bookme/api/rating`, { method: "POST", body: JSON.stringify({ bookingId: routeParams.id, rating }) });
      setSubmitted(true);
    } catch {
      /* best-effort */
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    router.replace(`/bookme/${slug}`);
  }

  function handleSkip() {
    router.replace(`/bookme/${slug}`);
  }

  const serviceMeta = [serviceName, duration ? `${duration} min` : ""]
    .filter(Boolean)
    .join(" • ");

  return (
    <>
      <div className={styles.page}>



        {/* Top nav */}
        <div className={styles.topNav}>
          <button className={styles.backBtn} onClick={() => router.replace(`/bookme/${slug}`)} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
        </div>

        <div className={styles.body}>

          {/* Icon */}
          <div className={styles.iconWrap}>
            <span className={styles.iconEmoji}>✂️</span>
          </div>

          {/* Heading */}
          <h1 className={styles.heading}>Service Complete!</h1>
          <p className={styles.serviceMeta}>{serviceMeta}</p>
          {staffName && staffName !== "Anyone Available" && (
            <p className={styles.staffLink}>with {staffName}</p>
          )}

          {/* Stars */}
          <p className={styles.ratingLabel}>How was your experience?</p>
          <div className={styles.stars} role="group" aria-label="Rating">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className={`${styles.star}${star <= activeStars ? ` ${styles.starFilled}` : ""}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                <svg viewBox="0 0 24 24" fill={star <= activeStars ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
              </button>
            ))}
          </div>

          {/* Submit */}
          {submitted ? (
            <p style={{ fontSize: 14, color: "#16a34a", fontWeight: 600, marginBottom: 16 }}>
              ✓ Thanks for your review!
            </p>
          ) : (
            <button
              className={`${styles.submitBtn}${rating > 0 ? ` ${styles.submitBtnActive}` : ""}`}
              onClick={handleSubmit}
              disabled={!rating || submitting}
            >
              {submitting ? (
                <span className={styles.spinner} />
              ) : (
                <>
                  <Send size={15} />
                  Submit Review
                </>
              )}
            </button>
          )}

          {!submitted && (
            <button className={styles.skipLink} onClick={handleSkip}>
              Skip for now
            </button>
          )}

       

        </div>
      </div>

     
    </>
  );
}
