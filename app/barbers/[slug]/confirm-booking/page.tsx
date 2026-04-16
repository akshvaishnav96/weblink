"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, User, Phone, Building2,
  Smartphone, CreditCard, Lock, ChevronDown, Search,
  Check,
} from "lucide-react";
import {
  Elements,
  CardElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { PaymentRequest, StripeCardElementOptions, PaymentRequestPaymentMethodEvent } from "@stripe/stripe-js";
import COUNTRIES_RAW from "@/utils/countries.json";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import AppDownloadModal from "@/components/booking/AppDownloadModal";
import { useBookingStore } from "@/store/bookingStore";
import { useBookingHydrated } from "@/hooks/useBookingHydrated";
import { getStripe } from "@/lib/stripe";
import styles from "./page.module.css";
import {
  STORAGE_KEYS,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_CURRENCY,
  APPLE_PAY_COUNTRY,
  UPI_POLL_INTERVAL_MS,
  UPI_POLL_MAX_ATTEMPTS,
  COUNTRY_SEARCH_FOCUS_DELAY_MS,
  PIN_MIN,
  PIN_MAX,
} from "@/lib/constants";
import { detectWalletLabel, nowInTZ } from "@/lib/utils";

type Country = { name: string; flag: string; code: string; dial_code: string };
const COUNTRIES = COUNTRIES_RAW as Country[];

const CARD_ELEMENT_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: "14px",
      color: "#1A1A1A",
      fontFamily: "system-ui, -apple-system, sans-serif",
      "::placeholder": { color: "#C0BFBD" },
    },
    invalid: { color: "#c0392b", iconColor: "#c0392b" },
  },
  hidePostalCode: true,
};

// ─── Outer wrapper: provides Stripe context ────────────────────────────────
export default function ConfirmBookingPage() {
  return (
    <Elements stripe={getStripe()}>
      <ConfirmBookingInner />
    </Elements>
  );
}

// ─── Inner component ───────────────────────────────────────────────────────
function ConfirmBookingInner() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const pageSlug = params?.slug ?? "";
  const { selection, clearBooking } = useBookingStore();
  const hydrated = useBookingHydrated();
  const stripe   = useStripe();
  const elements = useElements();

  // ── Page stage ────────────────────────────────────────────────────────────
  const [stage, setStage] = useState<"summary" | "form">("summary");

  // ── Post-confirm state ────────────────────────────────────────────────────
  const [showModal,             setShowModal]             = useState(false);
  const [confirmedPin,          setConfirmedPin]          = useState<string | null>(null);
  const [confirmedBookingId,    setConfirmedBookingId]    = useState<number | null>(null);
  const [confirmedServiceId,    setConfirmedServiceId]    = useState<number>(0);
  const [confirmedBarberSlug,     setConfirmedBarberSlug]     = useState<string>("");
  const [confirmedServicePrice, setConfirmedServicePrice] = useState<number>(0);
  const [customerSnapshot,      setCustomerSnapshot]      = useState<{ firstName: string; phone: string; email: string; countryCode: string; guestName: string; forSomeoneElse: boolean; address: string } | null>(null);

  // ── Form state ────────────────────────────────────────────────────────────
  const [firstName,      setFirstName]      = useState("");
  const [forSomeoneElse, setForSomeoneElse] = useState(false);
  const [guestName,      setGuestName]      = useState("");
  const [address,        setAddress]        = useState("");
  const [phone,          setPhone]          = useState("");
  const [payment,        setPayment]        = useState<"onsite" | "apple" | "card">("onsite");
  const [email,          setEmail]          = useState("");
  const [cardName,       setCardName]       = useState("");
  const [country,        setCountry]        = useState<Country>(
    COUNTRIES.find(c => c.code === DEFAULT_COUNTRY_CODE) ?? COUNTRIES[0]
  );
  const [countryOpen,   setCountryOpen]   = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [paymentError,  setPaymentError]  = useState<string | null>(null);
  const [cardComplete,  setCardComplete]  = useState(false);
  const [savedBanner,   setSavedBanner]   = useState(false);
  const [fieldErrors,   setFieldErrors]   = useState<{ firstName?: boolean; guestName?: boolean; phone?: boolean }>({});
  const countryRef = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);

  // ── Apple/Google Pay state ─────────────────────────────────────────────
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [prBtnAvailable, setPrBtnAvailable] = useState(false);
  const [prBtnLoading, setPrBtnLoading] = useState(false);
  const [walletLabel, setWalletLabel] = useState(detectWalletLabel);
  const [processingLabel, setProcessingLabel] = useState("Processing…");

  const isMobileBooking = selection.serviceType === "mobile" || selection.serviceType === "both";

  const formRef = useRef({ firstName, phone, email, guestName, forSomeoneElse, country, cardName, address });
  useEffect(() => {
    formRef.current = { firstName, phone, email, guestName, forSomeoneElse, country, cardName, address };
  });

  const SAVED_KEY = STORAGE_KEYS.SAVED_USER;

  // ── Redirect guard ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (confirmedPin) return;
    if (!selection.serviceId) router.replace(pageSlug ? `/barbers/${pageSlug}` : "/barbers/not-found");
  }, [hydrated, confirmedPin, selection.serviceId, router, pageSlug]);

  // ── Load saved details ────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { firstName?: string; phone?: string; email?: string; countryCode?: string; guestName?: string; forSomeoneElse?: boolean; address?: string };
      if (saved.firstName) setFirstName(saved.firstName);
      if (saved.phone) setPhone(saved.phone);
      if (saved.email) setEmail(saved.email);
      if (saved.countryCode) {
        const found = COUNTRIES.find(c => c.dial_code === saved.countryCode);
        if (found) setCountry(found);
      }
      if (saved.guestName) setGuestName(saved.guestName);
      if (saved.forSomeoneElse) setForSomeoneElse(saved.forSomeoneElse);
      if (saved.address) setAddress(saved.address);
      setSavedBanner(true);
    } catch (err) {
      console.warn("[ConfirmBooking] Failed to load saved details:", err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearSavedDetails() {
    localStorage.removeItem(SAVED_KEY);
    setFirstName(""); setPhone(""); setEmail("");
    setGuestName(""); setForSomeoneElse(false); setAddress("");
    setCountry(COUNTRIES.find(c => c.code === DEFAULT_COUNTRY_CODE) ?? COUNTRIES[0]);
    setSavedBanner(false);
  }

  // ── Country picker ────────────────────────────────────────────────────────
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
        setCountrySearch("");
      }
    }
    if (countryOpen) {
      document.addEventListener("mousedown", handleOutside);
      setTimeout(() => searchRef.current?.focus(), COUNTRY_SEARCH_FOCUS_DELAY_MS);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [countryOpen]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.dial_code.includes(q));
  }, [countrySearch]);

  // ── Apple/Google Pay init ─────────────────────────────────────────────────
  useEffect(() => {
    if (!stripe || !selection.price || payment !== "apple") return;
    const amount = Math.round((parseFloat(selection.price) || 0) * 100);
    if (amount <= 0) return;
    setPrBtnLoading(true);
    setPrBtnAvailable(false);
    const pr = stripe.paymentRequest({
      country: APPLE_PAY_COUNTRY,
      currency: DEFAULT_CURRENCY,
      total: { label: selection.businessName ?? "Booking", amount },
      requestPayerName: false,
      requestPayerEmail: false,
    });
    pr.canMakePayment().then(result => {
      setPrBtnLoading(false);
      if (result) {
        setPaymentRequest(pr);
        setPrBtnAvailable(true);
        // Refine label from Stripe's authoritative result
        const r = result as Record<string, boolean>;
        if (r.applePay && r.googlePay) setWalletLabel("Apple Pay / Google Pay");
        else if (r.applePay) setWalletLabel("Apple Pay");
        else if (r.googlePay) setWalletLabel("Google Pay");
      } else {
        setPaymentRequest(null);
        setPrBtnAvailable(false);
      }
    });
  }, [stripe, payment, selection.price, selection.businessName]);

  // ── Apple Pay handler ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!paymentRequest || !stripe) return;
    const handler = async (event: PaymentRequestPaymentMethodEvent) => {
      const { firstName: fn, phone: ph, email: em, guestName: gn, forSomeoneElse: fse, country: ct } = formRef.current;
      let paymentConfirmed = false;
      let capturedPaymentIntentId = "";
      try {
        const basePayload = buildBasePayload({ firstName: fn, phone: ph, email: em, guestName: gn, isBookingSomeone: fse, countryCode: ct.dial_code, paymentMode: "upi", addr: formRef.current.address });
        const res = await fetch(API_ENDPOINTS.BOOKING_PAYMENT_INTENT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...basePayload, total_amount: Math.round(basePayload.total_amount * 100), services: basePayload.services.map((s: { service_id: number; price: number }) => ({ ...s, price: Math.round(s.price * 100) })), payment_intent_id: "" }),
        });
        const json = await res.json();
        if (!json.status) { event.complete("fail"); return; }
        const clientSecret: string = json.client_secret ?? "";
        capturedPaymentIntentId = json.payment_intent_id ?? "";
        const intentUserId: number | null = json.user_id ?? null;
        const { error } = await stripe.confirmCardPayment(clientSecret, { payment_method: event.paymentMethod.id });
        if (error) { event.complete("fail"); setPaymentError(error.message ?? "Payment failed"); return; }
        // ── Payment is confirmed — money has been captured from this point ──
        paymentConfirmed = true;
        event.complete("success");
        setIsProcessing(true);
        setProcessingLabel("Confirming your booking…");
        const { pin, bookingId } = await createBooking(capturedPaymentIntentId, "upi", fn, ph, em, gn, fse, ct.dial_code, formRef.current.address, intentUserId);
        saveBookingId(bookingId);
        setCustomerSnapshot({ firstName: fn, phone: ph, email: em, countryCode: ct.dial_code, guestName: gn, forSomeoneElse: fse, address: formRef.current.address });
        setConfirmedServiceId(Number(selection.serviceId ?? 0));
        setConfirmedServicePrice(parseFloat(selection.price ?? "0") || 0);
        setConfirmedBarberSlug(selection.barberSlug ?? "");
        clearBooking();
        setConfirmedPin(pin);
        setShowModal(true);
      } catch (err) {
        if (paymentConfirmed) {
          // Payment went through but booking creation failed — log server-side
          fetch(API_ENDPOINTS.LOG_PAYMENT_FAILURE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentIntentId: capturedPaymentIntentId,
              businessId:      selection.barberId,
              serviceId:       selection.serviceId,
              amount:          selection.price,
              customer:        fn,
              phone:           ph,
              failedAt:        nowInTZ(),
              error:           (err as Error).message,
            }),
          }).catch(() => { /* best-effort — don't block UI */ });
          setPaymentError(
            `Your payment was processed but the booking could not be confirmed. ` +
            `Please contact support with reference: ${capturedPaymentIntentId}`
          );
        } else {
          event.complete("fail");
          setPaymentError("Payment failed. Please try again.");
        }
      } finally {
        setIsProcessing(false);
      }
    };
    paymentRequest.on("paymentmethod", handler);
    return () => {
      paymentRequest.off("paymentmethod", handler);
    };
  }, [paymentRequest, stripe]);

  // ── Display values ────────────────────────────────────────────────────────
  const businessName = selection.businessName    ?? "—";
  const serviceName  = selection.serviceName     ?? "—";
  const staffName    = selection.staffName       ?? "Anyone";
  const time         = selection.displayTime     ?? "—";
  const duration     = selection.duration        ?? "—";
  const price        = selection.price           ?? "0";
  const barberId          = selection.barberId          ?? "";
  const barberSlug        = selection.barberSlug        ?? "";
  const serviceId    = selection.serviceId       ?? "";

  const fallbackPin = useMemo(() => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return String(PIN_MIN + (buf[0] % (PIN_MAX - PIN_MIN + 1)));
  }, []);

  const SUMMARY_ROWS = [
    { label: "Business Name", value: businessName },
    { label: "Service",       value: serviceName },
    { label: "Staff",         value: staffName },
    { label: "Date & Time",   value: time },
    { label: "Duration",      value: duration !== "—" ? `${duration} min` : "—" },
  ];

  const PAYMENT_OPTIONS = [
    { key: "onsite" as const, Icon: Building2,  label: "Pay on site" },
    { key: "apple"  as const, Icon: Smartphone, label: walletLabel },
    { key: "card"   as const, Icon: CreditCard, label: "Card details" },
  ];

  // ── Build base booking payload ────────────────────────────────────────────
  function buildBasePayload({ firstName: fn, phone: ph, email: em, guestName: gn, isBookingSomeone: fse, countryCode: cc, paymentMode: pm, addr }: {
    firstName: string; phone: string; email: string; guestName: string;
    isBookingSomeone: boolean; countryCode: string; paymentMode: string; addr?: string;
  }) {
    const amount = parseFloat(price) || 0;
    const payload = {
      business_id:           Number(barberId),
      staff_id:              selection.staffId === "anyone" ? 0 : Number(selection.staffId ?? 0),
      time_slot:             selection.rawTimeSlot ?? "",
      booking_date:          selection.bookingDate ?? "",
      total_amount:          amount,
      is_secure:             false,
      service_type:          selection.serviceType ?? "walkin",
      services:              [{ service_id: Number(serviceId), price: amount }],
      customer_name:         fn,
      is_booking_someone:    fse,
      ...(fse ? { guest_name: gn } : {}),
      customer_country_code: cc,
      customer_phone_number: ph,
      customer_email:        em,
      payment_mode:          pm,
      user_id:               pm === "cash" ? null : (selection.userId ?? null),
      ...(addr ? { drop_address: addr } : {}),
      ...(selection.notes ? { comment: selection.notes } : {}),
    };
    return payload;
  }

  // ── Create booking on backend ─────────────────────────────────────────────
  async function createBooking(piId: string, pm: string, fn: string, ph: string, em: string, gn: string, fse: boolean, cc: string, addr?: string, userId?: number | null): Promise<{ pin: string; bookingId: number | null }> {
    const payload = { ...buildBasePayload({ firstName: fn, phone: ph, email: em, guestName: gn, isBookingSomeone: fse, countryCode: cc, paymentMode: pm, addr }), payment_intent_id: piId, user_id: pm === "cash" ? null : (userId ?? null) };
    const res = await fetch(API_ENDPOINTS.BOOKING_CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.status) throw new Error(json.message ?? "Booking creation failed");
    const bId = json.data?.booking_id ?? json.data?.id ?? json.booking_id ?? json.id ?? null;
    const bookingId = bId ? Number(bId) : null;
    if (bookingId) setConfirmedBookingId(bookingId);
    const pin = json.data?.booking_otp ? String(json.data.booking_otp).slice(-4) : fallbackPin;
    return { pin, bookingId };
  }

  // ── Form validation ────────────────────────────────────────────────────────
  function validateForm(): string | null {
    if (!firstName.trim()) return "Customer name is required.";
    if (firstName.trim().length < 3) return "Customer name must be at least 3 characters.";
    if (firstName.trim().length > 100) return "Customer name must not exceed 100 characters.";
    if (forSomeoneElse && !guestName.trim()) return "Guest name is required when booking for someone else.";
    if (forSomeoneElse && guestName.trim().length < 3) return "Guest name must be at least 3 characters.";
    if (forSomeoneElse && guestName.trim().length > 100) return "Guest name must not exceed 100 characters.";
    if (!country.dial_code) return "Country code is required.";
    const digits = phone.replace(/\D/g, "");
    if (!phone.trim()) return "Phone number is required.";
    if (digits.length < 9 || digits.length > 11) return "Phone number must be between 9 to 11 digits.";
    if (email.trim() && email.trim().length > 255) return "Email must not exceed 255 characters.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
    return null;
  }

  // Issue 4: reset errors when switching payment method
  function handlePaymentChange(p: typeof payment) {
    setPayment(p);
    setPaymentError(null);
    setCardComplete(false);
    if (p === "apple") setPrBtnLoading(true);
    else setPrBtnLoading(false);
  }

  const canConfirm =
    firstName.trim().length >= 3 &&
    firstName.trim().length <= 100 &&
    phone.replace(/\D/g, "").length >= 9 &&
    phone.replace(/\D/g, "").length <= 11 &&
    !!country.dial_code &&
    (!forSomeoneElse || (guestName.trim().length >= 3 && guestName.trim().length <= 100)) &&
    (payment !== "card" || cardComplete) &&
    true;

  // ── CTA label ─────────────────────────────────────────────────────────────
  function getCtaLabel() {
    if (!isProcessing) return "Confirm Booking";
    return "Processing…";
  }

  // ── Save booking ID to localStorage ──────────────────────────────────────
  function saveBookingId(bookingId: number | null) {
    if (!bookingId) return;
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKING_IDS) ?? "[]") as number[];
      if (!stored.includes(bookingId)) {
        localStorage.setItem(STORAGE_KEYS.BOOKING_IDS, JSON.stringify([bookingId, ...stored]));
      }
    } catch (err) {
      console.warn("[ConfirmBooking] Failed to save booking ID:", err);
    }
  }

  // ── Main confirm handler ───────────────────────────────────────────────────
  async function handleConfirm() {
    if (isProcessing) return;
    const errors = {
      firstName: !firstName.trim() || firstName.trim().length < 3,
      guestName: forSomeoneElse && (!guestName.trim() || guestName.trim().length < 3),
      phone: !phone.trim() || phone.replace(/\D/g, "").length < 9 || phone.replace(/\D/g, "").length > 11,
    };
    setFieldErrors(errors);
    const validationError = validateForm();
    if (validationError) { setPaymentError(validationError); return; }
    setIsProcessing(true);
    setProcessingLabel("Processing payment…");
    setPaymentError(null);

    const cc = country.dial_code;

    let cardPaymentConfirmed = false;
    let cardPaymentIntentId = "";
    try {
      let pin = fallbackPin;
      let bookingId: number | null = null;

      if (payment === "card") {
        if (!stripe || !elements) throw new Error("Stripe is not loaded yet. Please wait.");
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error("Card element not found.");
        const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: { name: cardName || firstName, phone: `${cc}${phone}`, email: email || undefined },
        });
        if (pmError) throw new Error(pmError.message);

        const cardPayload = buildBasePayload({ firstName, phone, email, guestName, isBookingSomeone: forSomeoneElse, countryCode: cc, paymentMode: "card", addr: address });
        const intentRes = await fetch(API_ENDPOINTS.BOOKING_PAYMENT_INTENT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...cardPayload, total_amount: Math.round(cardPayload.total_amount * 100), services: cardPayload.services.map(s => ({ ...s, price: Math.round(s.price * 100) })) }),
        });
        const intentJson = await intentRes.json();
        if (!intentJson.status) throw new Error(intentJson.message ?? "Payment intent failed");
        const clientSecret: string = intentJson.client_secret ?? "";
        cardPaymentIntentId = intentJson.payment_intent_id ?? "";
        const intentUserId: number | null = intentJson.user_id ?? null;
        const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, { payment_method: paymentMethod!.id });
        if (stripeError) throw new Error(stripeError.message ?? "Card payment failed");
        // ── Card payment confirmed — money captured from this point ──
        cardPaymentConfirmed = true;
        setProcessingLabel("Confirming your booking…");
        ({ pin, bookingId } = await createBooking(cardPaymentIntentId, "card", firstName, phone, email, guestName, forSomeoneElse, cc, address, intentUserId));

      } else {
        setProcessingLabel("Confirming your booking…");
        ({ pin, bookingId } = await createBooking("", "cash", firstName, phone, email, guestName, forSomeoneElse, cc, address));
      }

      setCustomerSnapshot({ firstName, phone, email, countryCode: cc, guestName, forSomeoneElse, address });
      setConfirmedServiceId(Number(serviceId));
      setConfirmedServicePrice(parseFloat(price) || 0);
      setConfirmedBarberSlug(barberSlug);
      saveBookingId(bookingId);
      clearBooking();
      setConfirmedPin(pin);
      setShowModal(true);
    } catch (err) {
      if (cardPaymentConfirmed) {
        // Card was charged but booking creation failed — store for support
        const failedRecord = {
          paymentIntentId: cardPaymentIntentId,
          businessId:      barberId,
          serviceId,
          amount:          price,
          customer:        firstName,
          phone,
          failedAt:        nowInTZ(),
          error:           (err as Error).message,
        };
        fetch(API_ENDPOINTS.LOG_PAYMENT_FAILURE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(failedRecord),
        }).catch(() => { /* best-effort — don't block UI */ });
        setPaymentError(
          `Your payment was processed but the booking could not be confirmed. ` +
          `Please contact support with reference: ${cardPaymentIntentId}`
        );
      } else {
        setPaymentError((err as Error).message ?? "Booking failed. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  }

  // ── Render: loading ───────────────────────────────────────────────────────
  if (!hydrated) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()} aria-label="Go back"><ArrowLeft /></button>
          <div>
            <h1 className={styles.headerTitle}>Confirm Booking</h1>
            <p className={styles.headerSub}>Loading your booking details…</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #F0EFED", borderTopColor: "#B8860B", animation: "spin 0.8s linear infinite" }} />
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
    <div className={`${styles.page}${showModal ? ` ${styles.pageBlurred}` : ""}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()} aria-label="Go back"><ArrowLeft /></button>
        <div>
          <h1 className={styles.headerTitle}>Confirm Booking</h1>
          <p className={styles.headerSub}>Review &amp; finalise your appointment</p>
        </div>
      </div>

      <div className={styles.body}>
        {/* Summary card */}
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

        {/* Cancellation policy */}
        <div className={styles.cancelBox}>
          <Check className={styles.cancelIcon} />
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

        {/* Stage 1 CTA — Looks good */}
        {stage === "summary" && (
          <div className={styles.ctaWrap}>
            <button className={styles.ctaBtn} onClick={() => setStage("form")}>
              Looks good &mdash; let&apos;s lock it in
            </button>
          </div>
        )}

        {/* Stage 2 — Full form */}
        {stage === "form" && (
          <div className={styles.formArea}>

            {/* Saved details banner */}
            {savedBanner && (
              <div className={styles.savedBanner}>
                <Check size={25} className={styles.savedBannerIcon} />
                <span className={styles.savedBannerText}>Your details are pre-filled from your last booking.</span>
                <button type="button" className={styles.savedBannerClear} onClick={clearSavedDetails}>Clear</button>
              </div>
            )}

            {/* Your details */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Your Details</h2>
              <p className={styles.sectionSub}>So we can send your booking confirmation</p>
              <div className={styles.inputRow}>
                <User className={styles.inputIcon} />
                <input className={`${styles.input}${fieldErrors.firstName ? ` ${styles.inputError}` : ""}`} placeholder="Enter your name" value={firstName} onChange={e => { setFirstName(e.target.value); setFieldErrors(prev => ({ ...prev, firstName: false })); }} autoComplete="given-name" />
              </div>
              <div className={styles.toggleRow} onClick={() => setForSomeoneElse(v => !v)}>
                <button className={`${styles.toggle} ${forSomeoneElse ? styles.toggleOn : ""}`} onClick={e => { e.stopPropagation(); setForSomeoneElse(v => !v); }} aria-label="Booking for someone else" type="button">
                  <span className={styles.toggleThumb} />
                </button>
                <span className={styles.toggleLabel}>Booking for someone else</span>
              </div>
              {forSomeoneElse && (
                <>
                  <div className={styles.inputRow}>
                    <User className={styles.inputIcon} />
                    <input className={`${styles.input}${fieldErrors.guestName ? ` ${styles.inputError}` : ""}`} placeholder="Guest name (who's showing up)" value={guestName} onChange={e => { setGuestName(e.target.value); setFieldErrors(prev => ({ ...prev, guestName: false })); }} />
                  </div>
                  <p className={styles.guestHint}>This name will appear on the check-in list</p>
                </>
              )}
              {isMobileBooking && (
                <>
                  <div className={styles.inputRow}>
                    <Building2 className={styles.inputIcon} />
                    <input className={styles.input} placeholder="Your address (barber comes to you)" value={address} onChange={e => setAddress(e.target.value)} autoComplete="street-address" />
                  </div>
                  <p className={styles.addressHint}>The barber will come to this address</p>
                </>
              )}
            </div>

            {/* Phone */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Phone number</h2>
              <div className={styles.phoneRow}>
                <div className={styles.countryWrap} ref={countryRef}>
                  <button type="button" className={`${styles.countryCode} ${countryOpen ? styles.countryCodeOpen : ""}`} onClick={() => setCountryOpen(v => !v)} aria-label="Select country code">
                    <span className={styles.flag}>{country.flag}</span>
                    <span className={styles.dialCode}>{country.dial_code}</span>
                    <ChevronDown size={12} className={`${styles.countryChevron} ${countryOpen ? styles.countryChevronOpen : ""}`} />
                  </button>
                  {countryOpen && (
                    <div className={styles.countryDropdown}>
                      <div className={styles.countrySearch}>
                        <Search size={13} className={styles.countrySearchIcon} />
                        <input ref={searchRef} className={styles.countrySearchInput} placeholder="Search country or code…" value={countrySearch} onChange={e => setCountrySearch(e.target.value)} />
                      </div>
                      <div className={styles.countryList}>
                        {filteredCountries.length === 0 ? (
                          <p className={styles.countryEmpty}>No results</p>
                        ) : filteredCountries.map(c => (
                          <button key={c.code + c.dial_code} type="button" className={`${styles.countryOption} ${c.code === country.code ? styles.countryOptionActive : ""}`} onClick={() => { setCountry(c); setCountryOpen(false); setCountrySearch(""); }}>
                            <span className={styles.flag}>{c.flag}</span>
                            <span className={styles.countryName}>{c.name}</span>
                            <span className={styles.countryDialCode}>{c.dial_code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.inputRow} style={{ flex: 1, marginBottom: 0 }}>
                  <Phone className={styles.inputIcon} />
                  <input className={`${styles.input}${fieldErrors.phone ? ` ${styles.inputError}` : ""}`} placeholder="4XX XXX XXX" type="tel" inputMode="numeric" value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setFieldErrors(prev => ({ ...prev, phone: false })); }} maxLength={11} autoComplete="tel" />
                </div>
              </div>
              <p className={styles.phoneNote}>
                <Lock size={11} className={styles.lockIcon} /> Your number is only used for your booking link. Never shared.
              </p>
            </div>

            {/* Payment */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Payment</h2>
              {PAYMENT_OPTIONS.map(({ key, Icon, label }) => {
                const active = payment === key;
                return (
                  <button key={key} type="button" className={`${styles.payOption} ${active ? styles.payOptionActive : ""}`} onClick={() => handlePaymentChange(key)}>
                    <Icon size={16} className={active ? styles.payIconActive : styles.payIcon} />
                    <span className={styles.payLabel}>{label}</span>
                    <span className={`${styles.payRadio} ${active ? styles.payRadioActive : ""}`} />
                  </button>
                );
              })}

              {payment === "card" && (
                <div className={styles.cardForm}>
                  <div className={styles.stripeElementWrap}>
                    <CardElement options={CARD_ELEMENT_OPTIONS} onChange={e => setCardComplete(e.complete)} />
                  </div>
                  <div className={styles.inputRow} style={{ marginBottom: 0 }}>
                    <User className={styles.inputIcon} />
                    <input className={styles.input} placeholder="Name on card" type="text" value={cardName} onChange={e => setCardName(e.target.value)} autoComplete="cc-name" />
                  </div>
                </div>
              )}

              {payment === "apple" && (
                <div className={styles.prButtonWrap}>
                  {prBtnLoading ? (
                    <div className={styles.prBtnSkeleton}>
                      <span className={styles.prBtnSkeletonSpinner} />
                      Checking wallet availability…
                    </div>
                  ) : prBtnAvailable && paymentRequest ? (
                    <PaymentRequestButtonElement options={{ paymentRequest, style: { paymentRequestButton: { theme: "dark", height: "48px" } } }} />
                  ) : (
                    <p className={styles.prUnavailable}>{walletLabel} is not available in this browser or device. Please select another payment method.</p>
                  )}
                </div>
              )}


              <input className={styles.inputNoIcon} placeholder="Email for receipt (optional)" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>

            {/* Error */}
            {paymentError && <p className={styles.paymentError}>{paymentError}</p>}

            {/* Legal */}
            <p className={styles.legalText}>
              By confirming, you agree to our{" "}
              <a href="/barbers/privacy" className={styles.legalLink}>Privacy Policy</a> and{" "}
              <a href="/barbers/terms" className={styles.legalLink}>Terms</a>.
            </p>

            {/* Confirm CTA — hidden for Apple Pay */}
            {payment !== "apple" && (
              <div className={styles.ctaWrap}>
                <button
                  type="button"
                  className={`${styles.ctaBtn} `}
                  // disabled={!canConfirm || isProcessing}
                  onClick={handleConfirm}
                >
                  {isProcessing ? <><span className={styles.btnSpinner} />Processing…</> : getCtaLabel()}
                </button>
              </div>
            )}

          </div>
        )}
      </div>

      

    </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className={styles.processingOverlay}>
          <div className={styles.processingCard}>
            <span className={styles.processingSpinner} />
            <p className={styles.processingLabel}>{processingLabel}</p>
          </div>
        </div>
      )}

      {/* Success modal — outside blurred div so it stays sharp */}
      {showModal && (
        <AppDownloadModal
          name={firstName}
          pin={confirmedPin ?? fallbackPin}
          bookingId={confirmedBookingId ?? undefined}
          serviceId={confirmedServiceId}
          servicePrice={confirmedServicePrice}
          onSkip={() => {
           if (confirmedBarberSlug) {
              router.push(`/barbers/${confirmedBarberSlug}`);
            } else {
                            router.push(`/barbers/${confirmedBarberSlug}`);
            }
          }}
          onSaveDetails={() => {
            try {
              if (customerSnapshot) {
                const toSave = {
                  firstName:   customerSnapshot.firstName,
                  phone:       customerSnapshot.phone,
                  countryCode: customerSnapshot.countryCode,
                  ...(customerSnapshot.email          ? { email:          customerSnapshot.email }          : {}),
                  ...(customerSnapshot.guestName      ? { guestName:      customerSnapshot.guestName }      : {}),
                  ...(customerSnapshot.forSomeoneElse ? { forSomeoneElse: customerSnapshot.forSomeoneElse } : {}),
                  ...(customerSnapshot.address        ? { address:        customerSnapshot.address }        : {}),
                };
                localStorage.setItem(SAVED_KEY, JSON.stringify(toSave));
              }
            } catch (err) {
              console.warn("[ConfirmBooking] Failed to save user details:", err);
            }
          }}
        />
      )}
    </>
  );
}
