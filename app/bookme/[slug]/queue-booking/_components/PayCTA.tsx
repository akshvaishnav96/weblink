import { ShieldCheck, AlertTriangle, Zap, CreditCard } from "lucide-react";
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
  walletLabel: string;
  // Wallet pay
  paymentRequest: PaymentRequest | null;
  prBtnAvailable: boolean;
  prBtnLoading: boolean;
}

function PayBtnIcon({ payment, walletLabel }: { payment: PaymentMethod; walletLabel: string }) {
  if (payment === "apple") {
    const both     = walletLabel.includes("Apple") && walletLabel.includes("Google");
    if (both) return null;
    if (walletLabel.includes("Apple"))  return <RiAppleLine size={19} />;
    if (walletLabel.includes("Google")) return <FaGoogle    size={15} />;
    return null;
  }
  return <CreditCard size={17} />;
}

export default function PayCTA({
  deposit, remaining,
  canConfirm, isProcessing, processingLabel,
  onPay,
  showSaveBanner, onSaveDetails, onDismissSave,
  payment, walletLabel,
  paymentRequest, prBtnAvailable, prBtnLoading,
}: Props) {
  const disabled = !canConfirm || isProcessing;
  const isWallet = payment === "apple";

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

      {/* Legal text */}
      <p className={styles.legalText}>
        By paying, you agree to our{" "}
        <a href="/bookme/privacy" className={styles.legalLink}>Privacy Policy</a>
        {" "}and{" "}
        <a href="/bookme/terms" className={styles.legalLink}>Terms</a>.
      </p>

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
              {walletLabel} is not available in this browser or device. Please select Card payment instead.
            </p>
          )}
        </>
      ) : (
        /* Card pay button */
        <button
          className={`${styles.ctaBtn}${disabled ? ` ${styles.ctaBtnDisabled}` : ""}`}
          disabled={disabled}
          onClick={onPay}
        >
          {isProcessing ? (
            <>
              <span className={styles.btnSpinner} />
              {processingLabel}
            </>
          ) : (
            <>
              <PayBtnIcon payment={payment} walletLabel={walletLabel} />
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
