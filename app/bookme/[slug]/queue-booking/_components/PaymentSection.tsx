"use client";

import { CreditCard, User } from "lucide-react";
import { RiAppleLine } from "react-icons/ri";
import { FaGoogle } from "react-icons/fa";
import {
  CardElement,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import type { PaymentRequest, StripeCardElementOptions } from "@stripe/stripe-js";
import { formatPrice } from "@/lib/utils";
import styles from "../page.module.css";
import type { PaymentMethod } from "../_types";

// "🍎 Apple Pay / 🇬 Google Pay" label with icons inline
function WalletLabel({ label, active }: { label: string; active: boolean }) {
  const cls = active ? styles.payIconActive : styles.payIcon;
  const isApple  = label.includes("Apple");
  const isGoogle = label.includes("Google");
  const both = isApple && isGoogle;
  return (
    <span className={styles.walletLabelRow}>
      {isApple && (
        <span className={styles.walletPart}>
          <RiAppleLine className={cls} size={18} />
          <span>Apple Pay</span>
        </span>
      )}
      {both && <span className={styles.walletSep}>/</span>}
      {isGoogle && (
        <span className={styles.walletPart}>
          <FaGoogle className={cls} size={14} />
          <span>Google Pay</span>
        </span>
      )}
    </span>
  );
}

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

interface Props {
  deposit: number;
  payment: PaymentMethod;
  onPaymentChange: (p: PaymentMethod) => void;

  // Wallet pay
  walletLabel: string;
  paymentRequest: PaymentRequest | null;
  prBtnAvailable: boolean;
  prBtnLoading: boolean;

  // Card
  cardName: string;
  setCardName: (v: string) => void;
  onCardChange: (complete: boolean, errorMsg: string | null) => void;
}

export default function PaymentSection({
  deposit, payment, onPaymentChange,
  walletLabel, paymentRequest, prBtnAvailable, prBtnLoading,
  cardName, setCardName, onCardChange,
}: Props) {
  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>Payment Method</p>
      <p className={styles.sectionSub}>Deposit: {formatPrice(deposit)}</p>

      {/* Apple / Google Pay option */}
      <button
        type="button"
        className={`${styles.payOption}${payment === "apple" ? ` ${styles.payOptionActive}` : ""}`}
        onClick={() => onPaymentChange("apple")}
      >
        <WalletLabel label={walletLabel} active={payment === "apple"} />
        <span className={`${styles.payRadio}${payment === "apple" ? ` ${styles.payRadioActive}` : ""}`} />
      </button>

      {payment === "apple" && (
        <p className={styles.walletHint}>
          The pay button will appear below ↓
        </p>
      )}

      {/* Card option */}
      <button
        type="button"
        className={`${styles.payOption}${payment === "card" ? ` ${styles.payOptionActive}` : ""}`}
        onClick={() => onPaymentChange("card")}
      >
        <CreditCard className={payment === "card" ? styles.payIconActive : styles.payIcon} size={18} />
        <span className={styles.payLabel}>Card details</span>
        <span className={`${styles.payRadio}${payment === "card" ? ` ${styles.payRadioActive}` : ""}`} />
      </button>

      {payment === "card" && (
        <div className={styles.cardForm}>
          <div className={styles.stripeElementWrap}>
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={e => onCardChange(e.complete, e.error?.message ?? null)}
            />
          </div>
          <div className={styles.inputRow} style={{ marginBottom: 0 }}>
            <User className={styles.inputIcon} />
            <input
              className={styles.input}
              placeholder="Name on card"
              value={cardName}
              autoComplete="cc-name"
              onChange={e => setCardName(e.target.value)}
            />
          </div>
          
        </div>
      )}
    </div>
  );
}
