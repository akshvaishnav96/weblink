"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import AppDownloadModal from "@/components/booking/AppDownloadModal";
import {
  createBookingPayment,
  createPaymentIntent,
  type BookingPayload,
} from "@/lib/api";
import styles from "./page.module.css";

export default function ConfirmBookingPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();

  const [showModal,    setShowModal]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState<string | null>(null);
  const [confirmedPin, setConfirmedPin] = useState<string | null>(null);

  // ── Display params ────────────────────────────────────────────────────────
  const businessName = searchParams.get("businessName") ?? "—";
  const serviceName  = searchParams.get("service")      ?? "—";
  const staffName    = searchParams.get("staff")        ?? "Anyone";
  const time         = searchParams.get("time")         ?? "—";
  const duration     = searchParams.get("duration")     ?? "—";
  const price        = searchParams.get("price")        ?? "0";
  const location     = searchParams.get("location")     ?? "—";
  const firstName    = searchParams.get("firstName")    ?? "";

  // ── Booking API params ────────────────────────────────────────────────────
  const payment          = searchParams.get("payment")          ?? "onsite";
  const serviceId        = searchParams.get("serviceId")        ?? "";
  const staffId          = searchParams.get("staffId")          ?? "0";
  const rawTimeSlot      = searchParams.get("rawTimeSlot")      ?? "";
  const bookingDate      = searchParams.get("bookingDate")      ?? "";
  const serviceType      = searchParams.get("serviceType")      ?? "walkin";
  const countryCode      = searchParams.get("countryCode")      ?? "+61";
  const phone            = searchParams.get("phone")            ?? "";
  const email            = searchParams.get("email")            ?? "";
  const guestName        = searchParams.get("guestName")        ?? "";
  const isBookingSomeone = searchParams.get("isBookingSomeone") === "1";
  const barberId         = searchParams.get("barberId")         ?? "";

  // Fallback PIN in case API doesn't return one
  const fallbackPin = useMemo(() => String(Math.floor(1000 + Math.random() * 9000)), []);

  const SUMMARY_ROWS = [
    { label: "Business Name", value: businessName },
    { label: "Service",       value: serviceName },
    { label: "Staff",         value: staffName },
    { label: "Date & Time",   value: time },
    { label: "Duration",      value: duration !== "—" ? `${duration} min` : "—" },
    { label: "Location",      value: location },
  ];

  async function handleConfirm() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const paymentMode =
        payment === "onsite" ? "cash" :
        payment === "apple"  ? "apple_pay" : "card";

      const payload: BookingPayload = {
        business_id:           barberId,
        staff_id:              staffId === "anyone" ? 0 : Number(staffId),
        time_slot:             rawTimeSlot,
        booking_date:          bookingDate,
        total_amount:          Math.round((parseFloat(price) || 0)*100),
        is_secure:             false,
        service_type:          serviceType,
        services:              [{ service_id: Number(serviceId), price: Math.round((parseFloat(price) || 0) * 100) }],
        customer_name:         firstName,
        is_booking_someone:    isBookingSomeone,
        guest_name:            guestName,
        customer_country_code: countryCode,
        customer_phone_number: phone,
        customer_email:        email,
        payment_mode:          paymentMode,
      };
        
      let pin = fallbackPin;
      if (payment === "card") {
        const result = await createPaymentIntent({ ...payload, payment_intent_id: "" });
        if (result.payment_intent_id) pin = result.payment_intent_id.slice(-4);
      } else {
        const result = await createBookingPayment(payload);
        if (result?.booking_otp) pin = String(result?.booking_otp).slice(-4);
      }

      setConfirmedPin(pin);
      setShowModal(true);
    } catch (err) {
      setSubmitError((err as Error).message ?? "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft />
        </button>
        <div>
          <h1 className={styles.headerTitle}>Booking Confirmed</h1>
          <p className={styles.headerSub}>Review &amp; finalise your appointment</p>
        </div>
      </div>

      {/* ── Summary card ── */}
      <div className={styles.summaryCard}>
        {SUMMARY_ROWS.map(({ label, value }) => (
          <div key={label} className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{label}</span>
            <span className={styles.summaryValue}>{value}</span>
          </div>
        ))}
        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
          <span className={styles.summaryTotalLabel}>Total</span>
          <span className={styles.summaryTotalValue}>${price}</span>
        </div>
      </div>

      {/* ── Cancellation policy ── */}
      <div className={styles.cancelBox}>
        <CheckCircle2 className={styles.cancelIcon} />
        <div>
          <p className={styles.cancelTitle}>Free cancellation up to 12 hours before</p>
          <ul className={styles.cancelList}>
            <li>Full refund if you cancel 12+ hours ahead.</li>
            <li>Late cancel or no-show: 50% fee applies.</li>
            <li>Emergency? Contact the owner within 24 hours for a possible full refund.</li>
          </ul>
          <p className={styles.cancelNote}>Applies to online payments only</p>
        </div>
      </div>

      <div className={styles.spacer} />

      {/* ── Error ── */}
      {submitError && (
        <p className={styles.submitError}>{submitError}</p>
      )}

      {/* ── CTA ── */}
      <div className={styles.ctaWrap}>
        <button
          className={`${styles.ctaBtn} ${submitting ? styles.ctaBtnDisabled : ""}`}
          disabled={submitting}
          onClick={handleConfirm}
        >
          {submitting ? "Processing…" : "Looks good — let\u2019s lock it in"}
        </button>
        <p className={styles.poweredBy}>POWERED BY VALET VAULT</p>
      </div>

      {showModal && (
        <AppDownloadModal
          name={firstName}
          pin={confirmedPin ?? fallbackPin}
          onSkip={() => router.push("/")}
        />
      )}
    </div>
  );
}
