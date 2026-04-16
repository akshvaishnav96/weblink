"use client";

import { CreditCard, User, CheckCircle } from "lucide-react";
import { RiAppleLine } from "react-icons/ri";
import { FaGoogle } from "react-icons/fa";
import { CardElement } from "@stripe/react-stripe-js";
import type { StripeCardElementOptions } from "@stripe/stripe-js";
import styles from "../page.module.css";
import type { PaymentMethod } from "../_types";

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

const PAY_OPTIONS = [
  { key: "apple"  as PaymentMethod, label: "Apple Pay",  Icon: RiAppleLine },
  { key: "google" as PaymentMethod, label: "Google Pay", Icon: FaGoogle    },
  { key: "card"   as PaymentMethod, label: "Card",       Icon: CreditCard  },
];

interface Props {
  payment: PaymentMethod;
  onPaymentChange: (p: PaymentMethod) => void;
  cardName: string;
  setCardName: (v: string) => void;
  onCardChange: (complete: boolean, errorMsg: string | null) => void;
}

export default function PaymentSection({
  payment,
  onPaymentChange,
  cardName,
  setCardName,
  onCardChange,
}: Props) {
  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>Payment Method</p>

      {/* 3-column card grid */}
      <div className={styles.payGrid}>
        {PAY_OPTIONS.map(({ key, label, Icon }) => {
          const active = payment === key;
          return (
            <button
              key={key}
              type="button"
              className={`${styles.payCard}${active ? ` ${styles.payCardActive}` : ""}`}
              onClick={() => onPaymentChange(key)}
            >
              {active && <CheckCircle size={15} className={styles.payCardBadge} />}
              <span className={`${styles.payCardIcon}${active ? ` ${styles.payCardIconActive}` : ""}`}>
                <Icon size={22} />
              </span>
              <span className={`${styles.payCardLabel}${active ? ` ${styles.payCardLabelActive}` : ""}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Card form — shown when card selected */}
      {payment === "card" && (
        <div className={styles.cardForm}>
          <div className={styles.stripeElementWrap}>
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={(e) => onCardChange(e.complete, e.error?.message ?? null)}
            />
          </div>
          <div className={styles.inputRow} style={{ marginBottom: 0 }}>
            <User className={styles.inputIcon} />
            <input
              className={styles.input}
              placeholder="Name on card"
              value={cardName}
              autoComplete="cc-name"
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
