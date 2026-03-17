"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import AppDownloadModal from "@/components/booking/AppDownloadModal";
import { useBookingStore } from "@/store/bookingStore";
import { useBookingHydrated } from "@/hooks/useBookingHydrated";
import { getStripe } from "@/lib/stripe";
import styles from "./page.module.css";

type UpiStatus = "idle" | "pending" | "success" | "failed";

export default function ConfirmBookingPage() {
  const router                  = useRouter();
  const { selection, customer, clearBooking } = useBookingStore();
  const hydrated                = useBookingHydrated();

  const [showModal,       setShowModal]       = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [submitError,     setSubmitError]     = useState<string | null>(null);
  const [confirmedPin,    setConfirmedPin]    = useState<string | null>(null);
  const [upiStatus,       setUpiStatus]       = useState<UpiStatus>("idle");
  const [customerSnapshot,  setCustomerSnapshot]  = useState<{ firstName: string; phone: string; email: string; countryCode: string } | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | null>(null);
  const [confirmedServiceId, setConfirmedServiceId] = useState<number>(0);
  const [confirmedServicePrice, setConfirmedServicePrice] = useState<number>(0);

  // ── Redirect guard — fires only after hydration ────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (confirmedPin) return; // booking just completed — stay on page for modal
    if (!selection.serviceId) { router.replace("/"); return; }
    if (!customer.firstName) {
      router.replace(selection.barberId ? `/payment/${selection.barberId}` : "/");
    }
  }, [hydrated, confirmedPin, selection.serviceId, selection.barberId, customer.firstName, router]);

  // ── Display values ────────────────────────────────────────────────────────
  const businessName = selection.businessName    ?? "—";
  const serviceName  = selection.serviceName     ?? "—";
  const staffName    = selection.staffName       ?? "Anyone";
  const time         = selection.displayTime     ?? "—";
  const duration     = selection.duration        ?? "—";
  const price        = selection.price           ?? "0";
  const location     = selection.businessAddress ?? "—";
  const firstName    = customer.firstName        ?? "";

  // ── API fields ────────────────────────────────────────────────────────────
  const payment          = customer.payment          ?? "onsite";
  const serviceId        = selection.serviceId       ?? "";
  const staffId          = selection.staffId         ?? "0";
  const rawTimeSlot      = selection.rawTimeSlot     ?? "";
  const bookingDate      = selection.bookingDate     ?? "";
  const serviceType      = selection.serviceType     ?? "walkin";
  const countryCode      = customer.countryCode      ?? "+61";
  const phone            = customer.phone            ?? "";
  const email            = customer.email            ?? "";
  const guestName        = customer.guestName        ?? "";
  const isBookingSomeone = customer.isBookingSomeone ?? false;
  const barberId         = selection.barberId        ?? "";
  const paymentMethodId  = customer.paymentMethodId;
  const paymentIntentId  = customer.paymentIntentId;
  const upiId            = customer.upiId            ?? "";

  const fallbackPin = useMemo(() => String(Math.floor(1000 + Math.random() * 9000)), []);

  const SUMMARY_ROWS = [
    { label: "Business Name", value: businessName },
    { label: "Service",       value: serviceName },
    { label: "Staff",         value: staffName },
    { label: "Date & Time",   value: time },
    { label: "Duration",      value: duration !== "—" ? `${duration} min` : "—" },
    { label: "Location",      value: location },
  ];

  // ── Build base booking payload ────────────────────────────────────────────
  function buildBasePayload(pm: string) {
    const amount = parseFloat(price) || 0;
    return {
      business_id:           Number(barberId),
      staff_id:              staffId === "anyone" ? 0 : Number(staffId),
      time_slot:             rawTimeSlot,
      booking_date:          bookingDate,
      total_amount:          amount,
      is_secure:             false,
      service_type:          serviceType,
      services:              [{ service_id: Number(serviceId), price: amount }],
      customer_name:         firstName,
      is_booking_someone:    isBookingSomeone,
      guest_name:            guestName,
      customer_country_code: countryCode,
      customer_phone_number: phone,
      customer_email:        email,
      payment_mode:          pm,
    };
  }

  // ── Create booking on backend ─────────────────────────────────────────────
  async function createBooking(piId: string, pm: string): Promise<string> {
    const payload = { ...buildBasePayload(pm), payment_intent_id: piId };
    console.log("[booking] creating booking — payload:", JSON.stringify(payload));
    const res = await fetch("/api/booking/create", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    console.log("[booking] response:", JSON.stringify(json));
    if (!json.status) throw new Error(json.message ?? "Booking creation failed");
    const bId = json.data?.booking_id ?? json.data?.id ?? json.booking_id ?? json.id ?? null;
    console.log("[booking] booking_id resolved:", bId, "| full data keys:", Object.keys(json.data ?? json));
    if (bId) setConfirmedBookingId(Number(bId));
    return json.data?.booking_otp ? String(json.data.booking_otp).slice(-4) : fallbackPin;
  }

  // ── Main confirm handler ───────────────────────────────────────────────────
  async function handleConfirm() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      let pin = fallbackPin;

      // ── Apple/Google Pay: payment already confirmed on payment page ─────────
      if (payment === "apple" && paymentIntentId) {
        console.log("[stripe] Apple/Google Pay already confirmed — paymentIntentId:", paymentIntentId);
        pin = await createBooking(paymentIntentId, "apple_pay");

      // ── Card: create PaymentIntent → confirm with Stripe → create booking ───
      } else if (payment === "card" && paymentMethodId) {
        // Step 1: create payment intent (backend expects amount in cents)
        const cardPayload = buildBasePayload("card");
        const intentRes = await fetch("/api/booking/payment-intent", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            ...cardPayload,
            total_amount:      Math.round(cardPayload.total_amount * 100),
            services:          cardPayload.services.map(s => ({ ...s, price: Math.round(s.price * 100) })),
          }),
        });
        const intentJson = await intentRes.json();
        console.log("[payment-intent] card response:", JSON.stringify(intentJson));
        if (!intentJson.status) throw new Error(intentJson.message ?? "Payment intent failed");

        const clientSecret: string   = intentJson.client_secret    ?? "";
        const piId:         string   = intentJson.payment_intent_id ?? "";

        // Step 2: confirm card payment with Stripe
        const stripe = await getStripe();
        if (!stripe) throw new Error("Stripe failed to load");

        console.log("[stripe] confirming payment...", { piId, paymentMethodId });
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethodId,
        });
        if (stripeError) {
          console.warn("[stripe] FAILED:", stripeError.code, stripeError.message);
          throw new Error(stripeError.message ?? "Card payment failed");
        }
        console.log("[stripe] SUCCESS — status:", paymentIntent?.status, "id:", paymentIntent?.id);

        // Step 3: create booking
        pin = await createBooking(piId, "card");

      // ── UPI: create PaymentIntent → confirm UPI → poll → create booking ────
      } else if (payment === "upi" && upiId) {
        // Step 1: create payment intent (backend expects amount in cents)
        const upiPayload = buildBasePayload("upi");
        const intentRes = await fetch("/api/booking/payment-intent", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            ...upiPayload,
            total_amount:      Math.round(upiPayload.total_amount * 100),
            services:          upiPayload.services.map(s => ({ ...s, price: Math.round(s.price * 100) })),
          }),
        });
        const intentJson = await intentRes.json();
        console.log("[confirm] UPI payment-intent response:", JSON.stringify(intentJson));

        if (!intentJson.status) throw new Error(intentJson.message ?? "UPI payment intent failed");

        const clientSecret: string = intentJson.client_secret    ?? "";
        const piId:         string = intentJson.payment_intent_id ?? "";
        // Step 2: poll Stripe until the backend-confirmed UPI intent succeeds
        const stripe = await getStripe();
        if (!stripe) throw new Error("Stripe failed to load");
        console.log("[stripe] UPI polling started...", { piId, clientSecret: clientSecret.slice(0, 20) + "..." });
        setUpiStatus("pending");
        const succeeded = await pollUpiPayment(stripe, clientSecret);
        if (!succeeded) {
          console.warn("[stripe] UPI FAILED — user did not approve or payment cancelled");
          setUpiStatus("failed");
          throw new Error("UPI payment was not completed. Please approve it in your UPI app and try again.");
        }

        console.log("[stripe] UPI SUCCESS ✓ piId:", piId);
        setUpiStatus("success");
        pin = await createBooking(piId, "upi");

      // ── Onsite (cash): create booking directly ─────────────────────────────
      } else {
        console.log("[payment] cash/onsite — skipping Stripe, creating booking directly");
        pin = await createBooking("", "cash");
      }

      setCustomerSnapshot({ firstName, phone, email, countryCode });
      setConfirmedServiceId(Number(serviceId));
      setConfirmedServicePrice(parseFloat(price) || 0);
      clearBooking();
      setConfirmedPin(pin);
      setShowModal(true);
    } catch (err) {
      setSubmitError((err as Error).message ?? "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── UPI polling helper ─────────────────────────────────────────────────────
  async function pollUpiPayment(stripe: Awaited<ReturnType<typeof getStripe>>, clientSecret: string): Promise<boolean> {
    if (!stripe) return false;
    const maxAttempts = 40; // 40 × 3s = 2 min
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
      console.log(`[stripe] UPI poll ${i + 1}/${maxAttempts} — status:`, paymentIntent?.status);
      if (paymentIntent?.status === "succeeded") return true;
      if (paymentIntent?.status === "canceled" || paymentIntent?.status === "requires_payment_method") return false;
    }
    return false;
  }

  // ── UPI pending label ──────────────────────────────────────────────────────
  function getCtaLabel() {
    if (!submitting) return "Looks good \u2014 let\u2019s lock it in";
    if (payment === "upi" && upiStatus === "pending")
      return "Waiting for UPI approval\u2026";
    return "Processing\u2026";
  }

  // ── Render: loading ───────────────────────────────────────────────────────
  if (!hydrated) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()} aria-label="Go back"><ArrowLeft /></button>
          <div>
            <h1 className={styles.headerTitle}>Booking Confirmed</h1>
            <p className={styles.headerSub}>Loading your booking details…</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #F0EFED", borderTopColor: "#B8860B", animation: "spin 0.8s linear infinite" }} />
        </div>
      </div>
    );
  }

  // ── Render: normal ────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()} aria-label="Go back"><ArrowLeft /></button>
        <div>
          <h1 className={styles.headerTitle}>Booking Confirmed</h1>
          <p className={styles.headerSub}>Review &amp; finalise your appointment</p>
        </div>
      </div>

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

      {/* UPI pending banner */}
      {upiStatus === "pending" && (
        <div style={{ margin: "12px 20px 0", padding: "14px 16px", background: "#FFF8E7", border: "1px solid #E2C98A", borderRadius: 10, fontSize: 13, color: "#7A5800", lineHeight: 1.5 }}>
          <strong>Waiting for UPI approval</strong><br />
          Please open your UPI app and approve the payment of ${price} to complete your booking.
        </div>
      )}

      <div className={styles.spacer} />

      {submitError && <p className={styles.submitError}>{submitError}</p>}

      <div className={styles.ctaWrap}>
        <button
          className={`${styles.ctaBtn} ${submitting ? styles.ctaBtnDisabled : ""}`}
          disabled={submitting}
          onClick={handleConfirm}
        >
          {getCtaLabel()}
        </button>
        <p className={styles.poweredBy}>POWERED BY VALET VAULT</p>
      </div>

      {showModal && (
        <AppDownloadModal
          name={firstName}
          pin={confirmedPin ?? fallbackPin}
          bookingId={confirmedBookingId ?? undefined}
          serviceId={confirmedServiceId}
          servicePrice={confirmedServicePrice}
          onSkip={() => router.push("/")}
          onSaveDetails={() => {
            try {
              if (customerSnapshot) {
                localStorage.setItem("groomly-saved-user", JSON.stringify(customerSnapshot));
              }
            } catch { /* ignore */ }
          }}
        />
      )}
    </div>
  );
}
