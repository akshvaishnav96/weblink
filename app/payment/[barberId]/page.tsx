"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, User, Phone, Building2, Smartphone, CreditCard, Lock, ChevronDown, Search } from "lucide-react";
import COUNTRIES_RAW from "@/utils/countries.json";
import BarberAvatar from "@/components/ui/BarberAvatar";
import styles from "./page.module.css";

type Country = { name: string; flag: string; code: string; dial_code: string };
const COUNTRIES = COUNTRIES_RAW as Country[];

export default function PaymentPage() {
  const router       = useRouter();
  const { barberId } = useParams<{ barberId: string }>();
  const searchParams = useSearchParams();

  const serviceName     = searchParams.get("service")         ?? "—";
  const staffName       = searchParams.get("staff")           ?? "Anyone";
  const staffInitials   = searchParams.get("staffInitials")   ?? "??";
  const staffPicture    = searchParams.get("staffPicture")    ?? "";
  const time            = searchParams.get("time")            ?? "—";
  const duration        = searchParams.get("duration")        ?? "—";
  const price           = searchParams.get("price")           ?? "0";
  const businessName    = searchParams.get("businessName")    ?? barberId;
  const businessAddress = searchParams.get("businessAddress") ?? "—";
  const serviceId       = searchParams.get("serviceId")       ?? "";
  const staffId         = searchParams.get("staffId")         ?? "0";
  const rawTimeSlot     = searchParams.get("rawTimeSlot")     ?? "";
  const bookingDate     = searchParams.get("bookingDate")     ?? "";
  const serviceType     = searchParams.get("serviceType")     ?? "walkin";

  const [staffImgFailed, setStaffImgFailed] = useState(false);
  const [firstName,      setFirstName]      = useState("");
  const [forSomeoneElse, setForSomeoneElse] = useState(false);
  const [guestName,      setGuestName]      = useState("");
  const [phone,          setPhone]          = useState("");
  const [payment,        setPayment]        = useState<"onsite" | "apple" | "card">("onsite");
  const [email,          setEmail]          = useState("");
  const [cardNumber,     setCardNumber]     = useState("");
  const [cardExpiry,     setCardExpiry]     = useState("");
  const [cardCvv,        setCardCvv]        = useState("");
  const [cardName,       setCardName]       = useState("");
  const [country,        setCountry]        = useState<Country>(COUNTRIES.find(c => c.code === "AU") ?? COUNTRIES[0]);
  const [countryOpen,    setCountryOpen]    = useState(false);
  const [countrySearch,  setCountrySearch]  = useState("");
  const countryRef = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);

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
      (c) => c.name.toLowerCase().includes(q) || c.dial_code.includes(q)
    );
  }, [countrySearch]);

  const SUMMARY_ROWS = [
    { label: "Business Name", value: businessName },
    { label: "Service",       value: serviceName },
    { label: "Staff",         value: staffName },
    { label: "Date & Time",   value: time },
    { label: "Duration",      value: duration !== "—" ? `${duration} min` : "—" },
    { label: "Location",      value: businessAddress },
  ];

  const PAYMENT_OPTIONS = [
    { key: "onsite", Icon: Building2,  label: "Pay on site" },
    { key: "apple",  Icon: Smartphone, label: "Apple Pay / Google Pay" },
    { key: "card",   Icon: CreditCard, label: "Card details" },
  ] as const;

  const canConfirm = firstName.trim().length > 0 && phone.trim().length > 0;

  return (
    <div className={styles.page}>
      {/* ── Sticky header ── */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft />
        </button>
        <div>
          <h1 className={styles.headerTitle}>Confirm Booking</h1>
          <p className={styles.headerSub}>Review &amp; finalise your appointment</p>
        </div>
      </div>

      {/* ── Body (stacked → two-column on desktop) ── */}
      <div className={styles.body}>

        {/* LEFT: summary card */}
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

        {/* LEFT: cancellation policy */}
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

        {/* RIGHT: form */}
        <div className={styles.formArea}>

          {/* Your details */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Details</h2>
            <p className={styles.sectionSub}>So we can send your booking confirmation</p>

            <div className={styles.inputRow}>
              <User className={styles.inputIcon} />
              <input
                className={styles.input}
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>

            <div className={styles.toggleRow} onClick={() => setForSomeoneElse((v) => !v)}>
              <button
                className={`${styles.toggle} ${forSomeoneElse ? styles.toggleOn : ""}`}
                onClick={(e) => { e.stopPropagation(); setForSomeoneElse((v) => !v); }}
                aria-label="Booking for someone else"
                type="button"
              >
                <span className={styles.toggleThumb} />
              </button>
              <span className={styles.toggleLabel}>Booking for someone else</span>
            </div>

            {forSomeoneElse && (
              <div className={styles.inputRow}>
                <User className={styles.inputIcon} />
                <input
                  className={styles.input}
                  placeholder="Guest name (who's showing up)"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Phone */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Phone number</h2>
            <div className={styles.phoneRow}>
              <div className={styles.countryWrap} ref={countryRef}>
                <button
                  type="button"
                  className={`${styles.countryCode} ${countryOpen ? styles.countryCodeOpen : ""}`}
                  onClick={() => setCountryOpen((v) => !v)}
                  aria-label="Select country code"
                >
                  <span className={styles.flag}>{country.flag}</span>
                  <span className={styles.dialCode}>{country.dial_code}</span>
                  <ChevronDown size={12} className={`${styles.countryChevron} ${countryOpen ? styles.countryChevronOpen : ""}`} />
                </button>
                {countryOpen && (
                  <div className={styles.countryDropdown}>
                    <div className={styles.countrySearch}>
                      <Search size={13} className={styles.countrySearchIcon} />
                      <input
                        ref={searchRef}
                        className={styles.countrySearchInput}
                        placeholder="Search country or code…"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                      />
                    </div>
                    <div className={styles.countryList}>
                      {filteredCountries.length === 0 ? (
                        <p className={styles.countryEmpty}>No results</p>
                      ) : filteredCountries.map((c) => (
                        <button
                          key={c.code + c.dial_code}
                          type="button"
                          className={`${styles.countryOption} ${c.code === country.code ? styles.countryOptionActive : ""}`}
                          onClick={() => { setCountry(c); setCountryOpen(false); setCountrySearch(""); }}
                        >
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
                <input
                  className={styles.input}
                  placeholder="4XX XXX XXX"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
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
                <button
                  key={key}
                  type="button"
                  className={`${styles.payOption} ${active ? styles.payOptionActive : ""}`}
                  onClick={() => setPayment(key)}
                >
                  <Icon
                    size={16}
                    className={active ? styles.payIconActive : styles.payIcon}
                  />
                  <span className={styles.payLabel}>{label}</span>
                  <span className={`${styles.payRadio} ${active ? styles.payRadioActive : ""}`} />
                </button>
              );
            })}

            {payment === "card" && (
              <div className={styles.cardForm}>
                <div className={styles.inputRow}>
                  <CreditCard className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    placeholder="Card number"
                    type="text"
                    inputMode="numeric"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                      setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
                    }}
                    autoComplete="cc-number"
                  />
                </div>
                <div className={styles.cardRow}>
                  <input
                    className={styles.inputNoIcon}
                    placeholder="MM / YY"
                    type="text"
                    inputMode="numeric"
                    maxLength={7}
                    value={cardExpiry}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                      if (raw.length >= 2) {
                        const month = parseInt(raw.slice(0, 2), 10);
                        if (month < 1 || month > 12) return; // block invalid month
                      }
                      setCardExpiry(raw.length > 2 ? `${raw.slice(0,2)} / ${raw.slice(2)}` : raw);
                    }}
                    autoComplete="cc-exp"
                  />
                  <input
                    className={styles.inputNoIcon}
                    placeholder="CVV"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    autoComplete="cc-csc"
                  />
                </div>
                <div className={styles.inputRow} style={{ marginBottom: 0 }}>
                  <User className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    placeholder="Name on card"
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    autoComplete="cc-name"
                  />
                </div>
              </div>
            )}

            <input
              className={styles.inputNoIcon}
              placeholder="Email for receipt (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {/* Legal + CTA */}
          <p className={styles.legalText}>
            By confirming, you agree to our{" "}
            <a href="/privacy" className={styles.legalLink}>Privacy Policy</a>{" "}
            and{" "}
            <a href="/terms" className={styles.legalLink}>Terms</a>.
          </p>

          <div className={styles.ctaWrap}>
            <button
              type="button"
              className={`${styles.ctaBtn} ${!canConfirm ? styles.ctaBtnDisabled : ""}`}
              disabled={!canConfirm}
              onClick={() => {
                if (!canConfirm) return;
                const qp = new URLSearchParams({
                  service:           serviceName,
                  staff:             staffName,
                  time,
                  price,
                  duration,
                  payment,
                  businessName,
                  location:          businessAddress,
                  firstName,
                  serviceId,
                  staffId,
                  rawTimeSlot,
                  bookingDate,
                  serviceType,
                  countryCode:       country.dial_code,
                  phone,
                  email,
                  guestName,
                  isBookingSomeone:  forSomeoneElse ? "1" : "0",
                  barberId,
                });
                router.push(`/confirm-booking?${qp.toString()}`);
              }}
            >
              Confirm Booking
            </button>
          </div>

          <p className={styles.poweredBy}>Powered by Valet Vault</p>
        </div>
      </div>
    </div>
  );
}
