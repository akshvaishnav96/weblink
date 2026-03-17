"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, User, Phone, Building2,
  Smartphone, CreditCard, Lock, ChevronDown, Search, Wallet,
} from "lucide-react";
import {
  Elements,
  CardElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { PaymentRequest, StripeCardElementOptions } from "@stripe/stripe-js";
import COUNTRIES_RAW from "@/utils/countries.json";
import { useBookingStore } from "@/store/bookingStore";
import { useBookingHydrated } from "@/hooks/useBookingHydrated";
import { fetchBusinessProfile, type ApiBusinessProfile } from "@/lib/api";
import { getStripe } from "@/lib/stripe";
import styles from "./page.module.css";

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
export default function PaymentPage() {
  return (
    <Elements stripe={getStripe()}>
      <PaymentPageInner />
    </Elements>
  );
}

// ─── Inner component: has access to useStripe / useElements ───────────────
function PaymentPageInner() {
  const router       = useRouter();
  const { barberId } = useParams<{ barberId: string }>();
  const { selection, setCustomer } = useBookingStore();
  const hydrated = useBookingHydrated();
  const stripe   = useStripe();
  const elements = useElements();

  // ── Fallback re-fetch when selection is missing after hydration ──────────
  const [fallbackProfile, setFallbackProfile]  = useState<ApiBusinessProfile | null>(null);
  const [fallbackLoading, setFallbackLoading]  = useState(false);
  const selectionMissing = hydrated && !selection.serviceId;

  useEffect(() => {
    if (!selectionMissing) return;
    setFallbackLoading(true);
    fetchBusinessProfile(barberId)
      .then(setFallbackProfile)
      .catch(() => {})
      .finally(() => setFallbackLoading(false));
  }, [selectionMissing, barberId]);

  // ── Saved details (localStorage) ─────────────────────────────────────────
  const SAVED_KEY = "groomly-saved-user";
  const [savedBanner, setSavedBanner] = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [firstName,      setFirstName]      = useState("");
  const [forSomeoneElse, setForSomeoneElse] = useState(false);
  const [guestName,      setGuestName]      = useState("");
  const [phone,          setPhone]          = useState("");
  const [payment,        setPayment]        = useState<"onsite" | "apple" | "card" | "upi">("onsite");
  const [email,          setEmail]          = useState("");
  const [cardName,       setCardName]       = useState("");
  const [upiId,          setUpiId]          = useState("");
  const [country,        setCountry]        = useState<Country>(
    COUNTRIES.find(c => c.code === "AU") ?? COUNTRIES[0]
  );
  const [countryOpen,   setCountryOpen]   = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [paymentError,  setPaymentError]  = useState<string | null>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);

  // ── Apple/Google Pay payment request state ────────────────────────────────
  const [paymentRequest,    setPaymentRequest]    = useState<PaymentRequest | null>(null);
  const [prBtnAvailable,    setPrBtnAvailable]    = useState(false);

  // Ref to capture latest form values inside async callbacks
  const formRef = useRef({ firstName, phone, email, guestName, forSomeoneElse, country, cardName });
  useEffect(() => {
    formRef.current = { firstName, phone, email, guestName, forSomeoneElse, country, cardName };
  });

  // ── Initialise payment request (Apple/Google Pay) ─────────────────────────
  useEffect(() => {
    if (!stripe || !selection.price || payment !== "apple") return;
    const amount = Math.round((parseFloat(selection.price) || 0) * 100);
    if (amount <= 0) return;

    const pr = stripe.paymentRequest({
      country:  "AU",
      currency: "aud",
      total: {
        label:  selection.businessName ?? "Booking",
        amount,
      },
      requestPayerName:  false,
      requestPayerEmail: false,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setPrBtnAvailable(true);
      } else {
        setPaymentRequest(null);
        setPrBtnAvailable(false);
      }
    });
  }, [stripe, payment, selection.price, selection.businessName]);

  // ── Handle Apple/Google Pay payment method event ───────────────────────────
  useEffect(() => {
    if (!paymentRequest || !stripe) return;

    const handler = async (event: Parameters<Parameters<PaymentRequest["on"]>[1]>[0] & { complete: (s: string) => void; paymentMethod: { id: string } }) => {
      const { firstName: fn, phone: ph, email: em, guestName: gn, forSomeoneElse: fse, country: ct } = formRef.current;
      try {
        const basePayload = buildBasePayload({
          firstName: fn, phone: ph, email: em, guestName: gn,
          isBookingSomeone: fse, countryCode: ct.dial_code, paymentMode: "apple_pay",
        });
        const res = await fetch("/api/booking/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...basePayload,
            total_amount:      Math.round(basePayload.total_amount * 100),
            services:          basePayload.services.map((s: { service_id: number; price: number }) => ({ ...s, price: Math.round(s.price * 100) })),
            payment_intent_id: "",
          }),
        });
        const json = await res.json();
        if (!json.status) { event.complete("fail"); return; }

        const clientSecret: string    = json.client_secret    ?? "";
        const paymentIntentId: string = json.payment_intent_id ?? "";

        const { error } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: event.paymentMethod.id }
        );
        if (error) { event.complete("fail"); setPaymentError(error.message ?? "Payment failed"); return; }

        event.complete("success");
        setCustomer({
          firstName: fn, phone: ph, countryCode: ct.dial_code,
          email: em, guestName: gn, isBookingSomeone: fse,
          payment: "apple", paymentIntentId,
        });
        router.push("/confirm-booking");
      } catch {
        event.complete("fail");
        setPaymentError("Payment failed. Please try again.");
      }
    };

    // @ts-expect-error - Stripe types are complex here
    paymentRequest.on("paymentmethod", handler);
    return () => {
      // @ts-expect-error
      paymentRequest.off("paymentmethod", handler);
    };
  }, [paymentRequest, stripe, setCustomer, router]);

  // ── Load saved details from localStorage ─────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { firstName?: string; phone?: string; email?: string; countryCode?: string };
      if (saved.firstName) { setFirstName(saved.firstName); }
      if (saved.phone)     { setPhone(saved.phone); }
      if (saved.email)     { setEmail(saved.email); }
      if (saved.countryCode) {
        const found = COUNTRIES.find(c => c.dial_code === saved.countryCode);
        if (found) setCountry(found);
      }
      setSavedBanner(true);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearSavedDetails() {
    localStorage.removeItem(SAVED_KEY);
    setFirstName(""); setPhone(""); setEmail("");
    setCountry(COUNTRIES.find(c => c.code === "AU") ?? COUNTRIES[0]);
    setSavedBanner(false);
  }

  // ── Country picker ─────────────────────────────────────────────────────────
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
        setCountrySearch("");
      }
    }
    if (countryOpen) {
      document.addEventListener("mousedown", handleOutside);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [countryOpen]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      c => c.name.toLowerCase().includes(q) || c.dial_code.includes(q)
    );
  }, [countrySearch]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function buildBasePayload({
    firstName: fn, phone: ph, email: em, guestName: gn,
    isBookingSomeone: fse, countryCode: cc, paymentMode: pm,
  }: {
    firstName: string; phone: string; email: string; guestName: string;
    isBookingSomeone: boolean; countryCode: string; paymentMode: string;
  }) {
    const amount = parseFloat(selection.price ?? "0") || 0;
    return {
      business_id:           Number(selection.barberId ?? 0),
      staff_id:              selection.staffId === "anyone" ? 0 : Number(selection.staffId ?? 0),
      time_slot:             selection.rawTimeSlot ?? "",
      booking_date:          selection.bookingDate ?? "",
      total_amount:          amount,
      is_secure:             false,
      service_type:          selection.serviceType ?? "walkin",
      services:              [{ service_id: Number(selection.serviceId ?? 0), price: amount }],
      customer_name:         fn,
      is_booking_someone:    fse,
      guest_name:            gn,
      customer_country_code: cc,
      customer_phone_number: ph,
      customer_email:        em,
      payment_mode:          pm,
    };
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const serviceName     = selection.serviceName     ?? "—";
  const staffName       = selection.staffName       ?? "Anyone";
  const time            = selection.displayTime     ?? "—";
  const duration        = selection.duration        ?? "—";
  const price           = selection.price           ?? "0";
  const businessName    = selection.businessName    ?? barberId;
  const businessAddress = selection.businessAddress ?? "—";

  const SUMMARY_ROWS = [
    { label: "Business Name", value: businessName },
    { label: "Service",       value: serviceName },
    { label: "Staff",         value: staffName },
    { label: "Date & Time",   value: time },
    { label: "Duration",      value: duration !== "—" ? `${duration} min` : "—" },
    { label: "Location",      value: businessAddress },
  ];

  const PAYMENT_OPTIONS = [
    { key: "onsite" as const, Icon: Building2,  label: "Pay on site" },
    { key: "apple"  as const, Icon: Smartphone, label: "Apple Pay / Google Pay" },
    { key: "card"   as const, Icon: CreditCard, label: "Card details" },
    { key: "upi"    as const, Icon: Wallet,     label: "UPI" },
  ];

  const canConfirm =
    firstName.trim().length > 0 &&
    phone.trim().length > 0 &&
    (payment !== "upi" || upiId.trim().includes("@"));

  // ── Main submit handler ────────────────────────────────────────────────────
  async function handleConfirmBooking() {
    if (!canConfirm || isProcessing) return;
    setIsProcessing(true);
    setPaymentError(null);

    try {
      if (payment === "card") {
        if (!stripe || !elements) throw new Error("Stripe is not loaded yet. Please wait.");
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error("Card element not found.");

        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name:  cardName || firstName,
            phone: `${country.dial_code}${phone}`,
            email: email || undefined,
          },
        });
        if (error) throw new Error(error.message);
        setCustomer({
          firstName, phone, countryCode: country.dial_code,
          email, guestName, isBookingSomeone: forSomeoneElse,
          payment: "card", paymentMethodId: paymentMethod!.id,
        });
      } else if (payment === "upi") {
        setCustomer({
          firstName, phone, countryCode: country.dial_code,
          email, guestName, isBookingSomeone: forSomeoneElse,
          payment: "upi", upiId,
        });
      } else {
        // onsite
        setCustomer({
          firstName, phone, countryCode: country.dial_code,
          email, guestName, isBookingSomeone: forSomeoneElse,
          payment,
        });
      }

      router.push("/confirm-booking");
    } catch (err) {
      setPaymentError((err as Error).message ?? "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  // ── Render guards ──────────────────────────────────────────────────────────
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

  if (selectionMissing) {
    const displayName = fallbackProfile?.business_display_name ?? fallbackProfile?.business_name ?? "this provider";
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()} aria-label="Go back"><ArrowLeft /></button>
          <div>
            <h1 className={styles.headerTitle}>Session Expired</h1>
            <p className={styles.headerSub}>Please reselect your time slot</p>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>What happened?</span>
              <span className={styles.summaryValue} style={{ textAlign: "right" }}>Your session was cleared. No payment was taken.</span>
            </div>
          </div>
          <div className={styles.cancelBox}>
            <CheckCircle2 className={styles.cancelIcon} />
            <div>
              <p className={styles.cancelTitle}>{fallbackLoading ? "Loading…" : `Return to ${displayName} and pick a new slot.`}</p>
              <ul className={styles.cancelList}><li>Your booking was not completed.</li><li>Simply pick a new slot and try again.</li></ul>
            </div>
          </div>
          <div className={styles.formArea}>
            <button type="button" className={styles.ctaBtn} onClick={() => router.push(`/provider/${barberId}`)}>
              Back to {fallbackLoading ? "Provider" : displayName}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal render ──────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* ── Header ── */}
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

        {/* Form */}
        <div className={styles.formArea}>

          {/* Saved details banner */}
          {savedBanner && (
            <div className={styles.savedBanner}>
              <CheckCircle2 size={15} className={styles.savedBannerIcon} />
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
              <input className={styles.input} placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" />
            </div>
            <div className={styles.toggleRow} onClick={() => setForSomeoneElse(v => !v)}>
              <button className={`${styles.toggle} ${forSomeoneElse ? styles.toggleOn : ""}`} onClick={e => { e.stopPropagation(); setForSomeoneElse(v => !v); }} aria-label="Booking for someone else" type="button">
                <span className={styles.toggleThumb} />
              </button>
              <span className={styles.toggleLabel}>Booking for someone else</span>
            </div>
            {forSomeoneElse && (
              <div className={styles.inputRow}>
                <User className={styles.inputIcon} />
                <input className={styles.input} placeholder="Guest name (who's showing up)" value={guestName} onChange={e => setGuestName(e.target.value)} />
              </div>
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
                <input className={styles.input} placeholder="4XX XXX XXX" type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
              </div>
            </div>
            <p className={styles.phoneNote}>
              <Lock size={11} className={styles.lockIcon} /> Your number is only used for your booking link. Never shared.
            </p>
          </div>

          {/* Payment options */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Payment</h2>

            {PAYMENT_OPTIONS.map(({ key, Icon, label }) => {
              const active = payment === key;
              return (
                <button key={key} type="button" className={`${styles.payOption} ${active ? styles.payOptionActive : ""}`} onClick={() => { setPayment(key); setPaymentError(null); }}>
                  <Icon size={16} className={active ? styles.payIconActive : styles.payIcon} />
                  <span className={styles.payLabel}>{label}</span>
                  <span className={`${styles.payRadio} ${active ? styles.payRadioActive : ""}`} />
                </button>
              );
            })}

            {/* Card details — Stripe CardElement */}
            {payment === "card" && (
              <div className={styles.cardForm}>
                <div className={styles.stripeElementWrap}>
                  <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
                <div className={styles.inputRow} style={{ marginBottom: 0 }}>
                  <User className={styles.inputIcon} />
                  <input className={styles.input} placeholder="Name on card" type="text" value={cardName} onChange={e => setCardName(e.target.value)} autoComplete="cc-name" />
                </div>
              </div>
            )}

            {/* Apple / Google Pay — Payment Request Button */}
            {payment === "apple" && (
              <div className={styles.prButtonWrap}>
                {prBtnAvailable && paymentRequest ? (
                  <PaymentRequestButtonElement
                    options={{ paymentRequest, style: { paymentRequestButton: { theme: "dark", height: "48px" } } }}
                  />
                ) : (
                  <p className={styles.prUnavailable}>
                    Apple Pay / Google Pay is not available in this browser or device.
                    Please select another payment method.
                  </p>
                )}
              </div>
            )}

            {/* UPI */}
            {payment === "upi" && (
              <div className={styles.cardForm}>
                <input
                  className={styles.upiInput}
                  placeholder="Enter UPI ID (e.g. yourname@upi)"
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  autoComplete="off"
                  inputMode="email"
                />
                <p className={styles.upiHint}>
                  You will be prompted to approve the payment in your UPI app after confirming.
                </p>
              </div>
            )}

            {/* Email (always shown) */}
            <input className={styles.inputNoIcon} placeholder="Email for receipt (optional)" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>

          {/* Payment error */}
          {paymentError && <p className={styles.paymentError}>{paymentError}</p>}

          {/* Legal */}
          <p className={styles.legalText}>
            By confirming, you agree to our{" "}
            <a href="/privacy" className={styles.legalLink}>Privacy Policy</a> and{" "}
            <a href="/terms" className={styles.legalLink}>Terms</a>.
          </p>

          {/* CTA — hidden for Apple Pay (the PR button IS the CTA) */}
          {payment !== "apple" && (
            <div className={styles.ctaWrap}>
              <button
                type="button"
                className={`${styles.ctaBtn} ${(!canConfirm || isProcessing) ? styles.ctaBtnDisabled : ""}`}
                disabled={!canConfirm || isProcessing}
                onClick={handleConfirmBooking}
              >
                {isProcessing ? (
                  <><span className={styles.btnSpinner} />Processing…</>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          )}

          <p className={styles.poweredBy}>Powered by Valet Vault</p>
        </div>
      </div>
    </div>
  );
}
