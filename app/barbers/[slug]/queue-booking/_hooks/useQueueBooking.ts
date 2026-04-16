"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import type {
  PaymentRequest,
  PaymentRequestPaymentMethodEvent,
} from "@stripe/stripe-js";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import COUNTRIES_RAW from "@/utils/countries.json";
import { useBookingStore } from "@/store/bookingStore";
import { useBookingHydrated } from "@/hooks/useBookingHydrated";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import {
  STORAGE_KEYS,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_CURRENCY,
  APPLE_PAY_COUNTRY,
  COUNTRY_SEARCH_FOCUS_DELAY_MS,
  PIN_MIN,
  PIN_MAX,
} from "@/lib/constants";
import { detectWalletLabel, nowInTZ } from "@/lib/utils";
import type { Country, FieldErrors, PaymentMethod } from "../_types";

const COUNTRIES = COUNTRIES_RAW as Country[];

// ─── Types ────────────────────────────────────────────────────────────────────

type FormRef = {
  firstName: string;
  phone: string;
  email: string;
  guestName: string;
  forSomeoneElse: boolean;
  country: Country;
  cardName: string;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQueueBooking() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const pageSlug = params?.slug ?? "";

  const { selection, clearBooking } = useBookingStore();
  const hydrated = useBookingHydrated();
  const stripe = useStripe();
  const elements = useElements();

  // ── From booking store (no URL params needed) ──────────────────────────────
  const people = selection.people ?? 1;
  const waitMins = selection.waitMins ?? 0;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [forSomeoneElse, setForSomeoneElse] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cardName, setCardName] = useState("");
  const [country, setCountry] = useState<Country>(
    COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY_CODE) ?? COUNTRIES[0],
  );
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [savedBanner, setSavedBanner] = useState(false);
  const [saveDismissed, setSaveDismissed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const countryRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Payment state ──────────────────────────────────────────────────────────
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null,
  );
  const [prBtnAvailable, setPrBtnAvailable] = useState(false);
  const [prBtnLoading, setPrBtnLoading] = useState(false);
  const [walletLabel, setWalletLabel] = useState(detectWalletLabel);
  const [cardComplete, setCardComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("Processing…");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Stable ref for form values — avoids stale closures inside payment handlers
  const formRef = useRef<FormRef>({
    firstName,
    phone,
    email,
    guestName,
    forSomeoneElse,
    country,
    cardName,
  });
  useEffect(() => {
    formRef.current = {
      firstName,
      phone,
      email,
      guestName,
      forSomeoneElse,
      country,
      cardName,
    };
  });

  // ── Derived booking values ─────────────────────────────────────────────────
  const businessName = selection.businessName ?? "—";
  const serviceName = selection.serviceName ?? "—";
  const staffName = selection.staffName ?? "Anyone Available";
  const staffInitials = selection.staffInitials ?? "??";
  const duration = selection.duration ?? "—";
  const unitPrice = parseFloat(selection.price ?? "0") || 0;
  const price = Math.round(unitPrice * people * 100) / 100;
  const deposit = Math.round(price * 50) / 100;
  const remaining = Math.round((price - deposit) * 100) / 100;
  const barberId = selection.barberId ?? "";
  const barberSlug = selection.barberSlug ?? "";
  const serviceId = selection.serviceId ?? "";

  const fallbackPin = useMemo(() => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return String(PIN_MIN + (buf[0] % (PIN_MAX - PIN_MIN + 1)));
  }, []);

  // ── Redirect guard ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (!selection.serviceId) {
      router.replace(pageSlug ? `/barbers/${pageSlug}` : "/barbers/not-found");
    }
  }, [hydrated, selection.serviceId, router, pageSlug]);

  // ── Load saved customer details ────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SAVED_USER);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<{
        firstName: string;
        phone: string;
        email: string;
        countryCode: string;
        guestName: string;
        forSomeoneElse: boolean;
      }>;
      if (saved.firstName) setFirstName(saved.firstName);
      if (saved.phone) setPhone(saved.phone);
      if (saved.email) setEmail(saved.email);
      if (saved.guestName) setGuestName(saved.guestName);
      if (saved.forSomeoneElse) setForSomeoneElse(saved.forSomeoneElse);
      if (saved.countryCode) {
        const found = COUNTRIES.find((c) => c.dial_code === saved.countryCode);
        if (found) setCountry(found);
      }
      setSavedBanner(true);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Country picker: close on outside click ─────────────────────────────────
  useEffect(() => {
    if (!countryOpen) return;
    function onOutsideClick(e: MouseEvent) {
      if (!countryRef.current?.contains(e.target as Node)) {
        setCountryOpen(false);
        setCountrySearch("");
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    setTimeout(() => searchRef.current?.focus(), COUNTRY_SEARCH_FOCUS_DELAY_MS);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [countryOpen]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial_code.includes(q),
    );
  }, [countrySearch]);

  // ── Apple/Google Pay: initialise on mount / when method changes ────────────
  useEffect(() => {
    if (!stripe || (payment !== "apple" && payment !== "google") || !deposit) return;
    const amount = Math.round(deposit * 100);
    if (amount <= 0) return;

    const pr = stripe.paymentRequest({
      country: APPLE_PAY_COUNTRY,
      currency: DEFAULT_CURRENCY,
      total: { label: `${serviceName} (deposit)`, amount },
      requestPayerName: false,
      requestPayerEmail: false,
    });

    pr.canMakePayment().then((result) => {
      setPrBtnLoading(false);
      if (!result) {
        setPaymentRequest(null);
        setPrBtnAvailable(false);
        return;
      }
      setPaymentRequest(pr);
      setPrBtnAvailable(true);
      const r = result as Record<string, boolean>;
      if (r.applePay && r.googlePay) setWalletLabel("Apple Pay / Google Pay");
      else if (r.applePay) setWalletLabel("Apple Pay");
      else if (r.googlePay) setWalletLabel("Google Pay");
    });
  }, [stripe, payment, deposit, serviceName]);

  // ── Apple Pay: handle payment method event ─────────────────────────────────
  useEffect(() => {
    if (!paymentRequest || !stripe) return;

    const handler = async (event: PaymentRequestPaymentMethodEvent) => {
      const {
        firstName: fn,
        phone: ph,
        email: em,
        guestName: gn,
        forSomeoneElse: fse,
        country: ct,
      } = formRef.current;
      let paymentConfirmed = false;
      let capturedIntentId = "";

      try {
        const base = buildBasePayload({
          firstName: fn,
          phone: ph,
          email: em,
          guestName: gn,
          isBookingSomeone: fse,
          countryCode: ct.dial_code,
        });
        const res = await fetch(API_ENDPOINTS.BOOKING_PAYMENT_INTENT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...base,
            total_amount: Math.round(deposit * 100),
            services: base.services.map(
              (s: { service_id: number; price: number }) => ({
                ...s,
                price: Math.round(deposit * 100),
              }),
            ),
            payment_intent_id: "",
          }),
        });
        const json = await res.json();
        if (!json.status) {
          event.complete("fail");
          return;
        }

        capturedIntentId = json.payment_intent_id ?? "";
        const { error } = await stripe.confirmCardPayment(json.client_secret, {
          payment_method: event.paymentMethod.id,
        });
        if (error) {
          event.complete("fail");
          setPaymentError(error.message ?? "Payment failed");
          return;
        }

        paymentConfirmed = true;
        event.complete("success");
        setIsProcessing(true);
        setProcessingLabel("Joining queue…");

        const { pin, bookingId, position } = await createBookingOnServer(
          capturedIntentId,
          "apple",
          fn,
          ph,
          em,
          gn,
          fse,
          ct.dial_code,
          json.user_id ?? null,
        );
        finaliseSuccess({
          fn,
          ph,
          em,
          cc: ct.dial_code,
          gn,
          fse,
          pin,
          bookingId,
          position,
        });
      } catch (err) {
        if (paymentConfirmed) {
          logPaymentFailure(capturedIntentId, fn, ph, (err as Error).message);
          setPaymentError(
            `Payment processed but queue join failed. Reference: ${capturedIntentId}`,
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

  // ── Helpers ────────────────────────────────────────────────────────────────

  function buildBasePayload({
    firstName: fn,
    phone: ph,
    email: em,
    guestName: gn,
    isBookingSomeone: fse,
    countryCode: cc,
  }: {
    firstName: string;
    phone: string;
    email: string;
    guestName: string;
    isBookingSomeone: boolean;
    countryCode: string;
  }) {
    return {
      business_id: Number(barberId),
      staff_id: ["anyone", "fastest"].includes(selection.staffId ?? "")
        ? 0
        : Number(selection.staffId ?? 0),
      total_amount: deposit,
      is_secure: false,
      booking_type: "queue",
      service_type: selection.serviceType ?? "walkin",
      services: [{ service_id: Number(serviceId), price: deposit }],
      customer_name: fn,
      is_booking_someone: fse,
      ...(fse ? { guest_name: gn } : {}),
      customer_country_code: cc,
      customer_phone_number: ph,
      customer_email: em,
      payment_mode: "card",
      people_count: people,
      user_id: selection.userId ?? null,
    };
  }

  async function createBookingOnServer(
    piId: string,
    pm: string,
    fn: string,
    ph: string,
    em: string,
    gn: string,
    fse: boolean,
    cc: string,
    userId: number | null,
  ): Promise<{ pin: string; bookingId: number | null; position?: number }> {
    const payload = {
      ...buildBasePayload({
        firstName: fn,
        phone: ph,
        email: em,
        guestName: gn,
        isBookingSomeone: fse,
        countryCode: cc,
      }),
      payment_intent_id: piId,
      payment_mode: pm,
      user_id: pm === "cash" ? null : userId,
    };
    const res = await fetch(API_ENDPOINTS.BOOKING_CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.status) throw new Error(json.message ?? "Queue booking failed");

    const bId =
      json.data?.booking_id ??
      json.data?.id ??
      json.booking_id ??
      json.id ??
      null;
    const bookingId = bId ? Number(bId) : null;

    const pin = json.data?.booking_otp
      ? String(json.data.booking_otp).slice(-4)
      : fallbackPin;
    const position = json.data?.queue_position ?? json.data?.position ?? null;
    return {
      pin,
      bookingId,
      position: position ? Number(position) : undefined,
    };
  }

  function logPaymentFailure(
    piId: string,
    fn: string,
    ph: string,
    errMsg: string,
  ) {
    fetch(API_ENDPOINTS.LOG_PAYMENT_FAILURE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentIntentId: piId,
        businessId: barberId,
        serviceId,
        amount: deposit,
        customer: fn,
        phone: ph,
        failedAt: nowInTZ(),
        error: errMsg,
      }),
    }).catch(() => {
      /* best-effort */
    });
  }

  function saveBookingId(bookingId: number | null) {
    if (!bookingId) return;
    try {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.BOOKING_IDS) ?? "[]",
      ) as number[];
      if (!stored.includes(bookingId)) {
        localStorage.setItem(
          STORAGE_KEYS.BOOKING_IDS,
          JSON.stringify([bookingId, ...stored]),
        );
      }
    } catch {
      /* ignore */
    }
  }

  function finaliseSuccess({
    fn = "",
    em = "",
    pin,
    bookingId,
    position,
  }: {
    fn?: string;
    ph?: string;
    em?: string;
    cc?: string;
    gn?: string;
    fse?: boolean;
    pin: string;
    bookingId: number | null;
    position?: number;
  }) {
    saveBookingId(bookingId);
    clearBooking();
    try {
      sessionStorage.setItem(
        STORAGE_KEYS.QUEUE_STATUS,
        JSON.stringify({
          bookingId: String(bookingId ?? ""),
          pin,
          position: position ?? 1,
          serviceName,
          staffName,
          duration,
          people,
          waitMins,
          firstName: fn,
          email: em,
        }),
      );
    } catch { /* ignore */ }
    router.replace(`/barbers/${barberSlug}/queue/${bookingId ?? pin}`);
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  function validateForm(): string | null {
    if (!firstName.trim()) return "Customer name is required.";
    if (firstName.trim().length < 3) return "Customer name must be at least 3 characters.";
    if (firstName.trim().length > 100) return "Customer name must not exceed 100 characters.";
    if (forSomeoneElse && !guestName.trim()) return "Guest name is required when booking for someone else.";
    if (forSomeoneElse && guestName.trim().length < 3) return "Guest name must be at least 3 characters.";
    if (forSomeoneElse && guestName.trim().length > 100) return "Guest name must not exceed 100 characters.";
    if (!country.dial_code) return "Country code is required.";
    if (!phone.trim()) return "Phone number is required.";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 11) return "Phone number must be between 9 to 11 digits.";
    if (email.trim() && email.trim().length > 255) return "Email must not exceed 255 characters.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
    return null;
  }

  const canConfirm =
    firstName.trim().length >= 3 &&
    firstName.trim().length <= 100 &&
    phone.replace(/\D/g, "").length >= 9 &&
    phone.replace(/\D/g, "").length <= 11 &&
    !!country.dial_code &&
    (!forSomeoneElse || (guestName.trim().length >= 3 && guestName.trim().length <= 100)) &&
    (payment !== "card" || cardComplete);

  // ── Main pay handler ───────────────────────────────────────────────────────

  async function handlePay() {
    if (isProcessing) return;

    const errors = {
      firstName: !firstName.trim() || firstName.trim().length < 3,
      guestName: forSomeoneElse && (!guestName.trim() || guestName.trim().length < 3),
      phone: !phone.trim() || phone.replace(/\D/g, "").length < 9 || phone.replace(/\D/g, "").length > 11,
    };
    setFieldErrors(errors);

    const validationError = validateForm();
    if (validationError) {
      setPaymentError(validationError);
      return;
    }

    setIsProcessing(true);
    setProcessingLabel("Processing deposit…");
    setPaymentError(null);

    const cc = country.dial_code;
    let cardPaymentConfirmed = false;
    let cardIntentId = "";

    try {
      if (!stripe || !elements) throw new Error("Stripe not loaded.");
      const cardEl = elements.getElement(CardElement);
      if (!cardEl) throw new Error("Card element not found.");

      const { paymentMethod, error: pmErr } = await stripe.createPaymentMethod({
        type: "card",
        card: cardEl,
        billing_details: {
          name: cardName || firstName,
          phone: `${cc}${phone}`,
          email: email || undefined,
        },
      });
      if (pmErr) throw new Error(pmErr.message);

      const base = buildBasePayload({
        firstName,
        phone,
        email,
        guestName,
        isBookingSomeone: forSomeoneElse,
        countryCode: cc,
      });
      const intentRes = await fetch(API_ENDPOINTS.BOOKING_PAYMENT_INTENT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...base,
          total_amount: Math.round(deposit * 100),
          services: base.services.map((s) => ({
            ...s,
            price: Math.round(deposit * 100),
          })),
        }),
      });
      const intentJson = await intentRes.json();
      if (!intentJson.status)
        throw new Error(intentJson.message ?? "Payment intent failed");

      cardIntentId = intentJson.payment_intent_id ?? "";
      const { error: stripeErr } = await stripe.confirmCardPayment(
        intentJson.client_secret,
        { payment_method: paymentMethod!.id },
      );
      if (stripeErr)
        throw new Error(stripeErr.message ?? "Card payment failed");

      cardPaymentConfirmed = true;
      setProcessingLabel("Joining queue…");

      try {
        localStorage.setItem(
          STORAGE_KEYS.SAVED_USER,
          JSON.stringify({
            firstName,
            phone,
            email,
            countryCode: cc,
            guestName,
            forSomeoneElse,
          }),
        );
      } catch {
        /* ignore */
      }

      const { pin, bookingId, position } = await createBookingOnServer(
        cardIntentId,
        "card",
        firstName,
        phone,
        email,
        guestName,
        forSomeoneElse,
        cc,
        intentJson.user_id ?? null,
      );
      finaliseSuccess({
        fn: firstName,
        ph: phone,
        em: email,
        cc,
        gn: guestName,
        fse: forSomeoneElse,
        pin,
        bookingId,
        position,
      });
    } catch (err) {
      if (cardPaymentConfirmed) {
        logPaymentFailure(
          cardIntentId,
          firstName,
          phone,
          (err as Error).message,
        );
        setPaymentError(
          `Your deposit was charged but queue join failed. Reference: ${cardIntentId}`,
        );
      } else {
        setPaymentError(
          (err as Error).message ?? "Payment failed. Please try again.",
        );
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function handlePaymentChange(p: PaymentMethod) {
    setPayment(p);
    setPaymentError(null);
    setCardComplete(false);
    setPrBtnLoading(p === "apple");
  }

  function clearSaved() {
    localStorage.removeItem(STORAGE_KEYS.SAVED_USER);
    setFirstName("");
    setPhone("");
    setEmail("");
    setGuestName("");
    setForSomeoneElse(false);
    setCountry(
      COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY_CODE) ?? COUNTRIES[0],
    );
    setSavedBanner(false);
  }

  // ── "Faster next time" banner ──────────────────────────────────────────────
  const showSaveBanner =
    !savedBanner &&
    !saveDismissed &&
    firstName.trim().length >= 3 &&
    phone.replace(/\D/g, "").length >= 9;

  function handleSaveDetails() {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SAVED_USER,
        JSON.stringify({
          firstName,
          phone,
          email,
          countryCode: country.dial_code,
          guestName,
          forSomeoneElse,
        }),
      );
    } catch { /* ignore */ }
    setSavedBanner(true);
  }

  function handleDismissSave() {
    setSaveDismissed(true);
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    // Navigation
    hydrated,
    goBack: () => router.back(),

    // Booking summary
    businessName,
    serviceName,
    staffId: selection.staffId ?? "",
    staffName,
    staffInitials,
    duration,
    price,
    deposit,
    remaining,
    waitMins,
    people,

    // Form
    firstName,
    setFirstName,
    forSomeoneElse,
    setForSomeoneElse,
    guestName,
    setGuestName,
    phone,
    setPhone,
    email,
    setEmail,
    cardName,
    setCardName,
    country,
    setCountry,
    countryOpen,
    setCountryOpen,
    countrySearch,
    setCountrySearch,
    filteredCountries,
    countryRef,
    searchRef,
    fieldErrors,
    setFieldErrors,
    savedBanner,
    clearSaved,
    showSaveBanner,
    handleSaveDetails,
    handleDismissSave,

    // Payment
    payment,
    handlePaymentChange,
    paymentRequest,
    prBtnAvailable,
    prBtnLoading,
    walletLabel,
    cardComplete,
    setCardComplete,

    // Status
    isProcessing,
    processingLabel,
    paymentError,
    setPaymentError,
    canConfirm,
    handlePay,

    serviceId,
    barberSlug,
  } as const;
}

export type QueueBookingState = ReturnType<typeof useQueueBooking>;
