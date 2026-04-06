import { ShieldCheck, AlertTriangle, Zap, CreditCard } from "lucide-react";
import LegalText from "@/components/booking/LegalText";
import { RiAppleLine } from "react-icons/ri";
import { FaGoogle } from "react-icons/fa";
import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import type { PaymentRequest } from "@stripe/stripe-js";
import { formatPrice } from "@/lib/utils";
import styles from "../page.module.css";
import type { PaymentMethod } from "../_types";

interface Props {
  deposit: number;
  remaining: number;
  canConfirm: boolean;
  isProcessing: boolean;
  processingLabel: string;
  onPay: () => void;
  showSaveBanner: boolean;
  onSaveDetails: () => void;
  onDismissSave: () => void;
  payment: PaymentMethod;
  paymentError: string | null;
  // Wallet pay
  paymentRequest: PaymentRequest | null;
  prBtnAvailable: boolean;
  prBtnLoading: boolean;
}

function PayBtnIcon({ payment }: { payment: PaymentMethod }) {
  if (payment === "apple")  return <RiAppleLine size={19} />;
  if (payment === "google") return <FaGoogle    size={15} />;
  return <CreditCard size={17} />;
}

export default function PayCTA({
  deposit, remaining,
  canConfirm, isProcessing, processingLabel,
  onPay,
  showSaveBanner, onSaveDetails, onDismissSave,
  payment, paymentError,
  paymentRequest, prBtnAvailable, prBtnLoading,
}: Props) {
  const isWallet = payment === "apple" || payment === "google";

  return (
    <div className={styles.ctaWrap}>

      {/* "Faster next time?" save banner */}
      {showSaveBanner && (
        <div className={styles.fasterBanner}>
          <Zap className={styles.fasterBannerIcon} size={14} />
          <span className={styles.fasterBannerText}>Faster next time? We'll remember your details.</span>
          <button className={styles.fasterBannerYes} onClick={onSaveDetails}>Yes</button>
          <button className={styles.fasterBannerDismiss} onClick={onDismissSave} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Header row: PAY NOW amount + Secure badge */}
      <div className={styles.ctaHeader}>
        <div>
          <p className={styles.ctaHeaderLabel}>PAY NOW</p>
          <p className={styles.ctaHeaderAmount}>{formatPrice(deposit)}</p>
        </div>
        <div className={styles.ctaSecure}>
          <ShieldCheck className={styles.ctaSecureIcon} />
          <span>Secure</span>
        </div>
      </div>

      <LegalText action="paying" />

      {/* Validation / payment error */}
      {paymentError && (
        <p className={styles.ctaError}>{paymentError}</p>
      )}

      {/* Wallet pay — native Apple/Google Pay button */}
      {isWallet ? (
        <>
          {prBtnLoading && (
            <div className={styles.prBtnSkeleton}>
              <span className={styles.prBtnSkeletonSpinner} />
              Checking wallet availability…
            </div>
          )}
          {!prBtnLoading && prBtnAvailable && paymentRequest && (
            <PaymentRequestButtonElement
              options={{ paymentRequest, style: { paymentRequestButton: { theme: "dark", height: "52px" } } }}
            />
          )}
          {!prBtnLoading && !prBtnAvailable && (
            <p className={styles.prUnavailable}>
              {payment === "apple" ? "Apple Pay" : "Google Pay"} is not available in this browser. Please select Card instead.
            </p>
          )}
        </>
      ) : (
        /* Card pay button */
        <button
          className={`${styles.ctaBtn}${!canConfirm || isProcessing ? ` ${styles.ctaBtnDisabled}` : ""}`}
          disabled={isProcessing}
          onClick={onPay}
        >
          {isProcessing ? (
            <>
              <span className={styles.btnSpinner} />
              {processingLabel}
            </>
          ) : (
            <>
              <PayBtnIcon payment={payment} />
              Pay {formatPrice(deposit)}
            </>
          )}
        </button>
      )}

      {/* Remaining + non-refundable */}
      <p className={styles.remainingNote}>
        {formatPrice(remaining)} remaining · Pay on-site after service
      </p>
      <p className={styles.nonRefundText}>
        <AlertTriangle className={styles.nonRefundIcon} size={12} />
        50% queue deposit is non-refundable
      </p>

    </div>
  );
}
