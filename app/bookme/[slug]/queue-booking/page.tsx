"use client";

import { ArrowLeft } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { useQueueBooking } from "./_hooks/useQueueBooking";
import QueueSummaryCard from "./_components/QueueSummaryCard";
import HowPaymentWorks from "./_components/HowPaymentWorks";
import CustomerForm from "./_components/CustomerForm";
import PaymentSection from "./_components/PaymentSection";
import PayCTA from "./_components/PayCTA";
import styles from "./page.module.css";

// ─── Entry point — provides Stripe context ─────────────────────────────────
export default function QueueBookingPage() {
  return (
    <Elements stripe={getStripe()}>
      <QueueBookingView />
    </Elements>
  );
}

// ─── Page view — uses hook, composes components ────────────────────────────
function QueueBookingView() {
  const q = useQueueBooking();

  if (!q.hydrated) {
    return (
      <div className={styles.page}>
        <PageHeader title="Queue Booking" sub="Loading…" onBack={q.goBack} />
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.page}>

        <PageHeader title="Payment" sub={q.businessName} onBack={q.goBack} />

        <div className={styles.body}>

          <QueueSummaryCard
            serviceName={q.serviceName}
            staffId={q.staffId}
            staffName={q.staffName}
            staffInitials={q.staffInitials}
            duration={q.duration}
            price={q.price}
            waitMins={q.waitMins}
            people={q.people}
          />

          <HowPaymentWorks deposit={q.deposit} remaining={q.remaining} />

          <div className={styles.formArea}>

            <CustomerForm
              firstName={q.firstName}         setFirstName={q.setFirstName}
              phone={q.phone}                 setPhone={q.setPhone}
              email={q.email}                 setEmail={q.setEmail}
              country={q.country}
              countryOpen={q.countryOpen}     setCountryOpen={q.setCountryOpen}
              countrySearch={q.countrySearch} setCountrySearch={q.setCountrySearch}
              filteredCountries={q.filteredCountries}
              countryRef={q.countryRef}
              searchRef={q.searchRef}
              onSelectCountry={c => { q.setCountry(c); q.setCountryOpen(false); q.setCountrySearch(""); }}
              fieldErrors={q.fieldErrors}
              setFieldErrors={q.setFieldErrors}
              savedBanner={q.savedBanner}
              clearSaved={q.clearSaved}
              clearPaymentError={() => q.setPaymentError(null)}
            />

            <PaymentSection
              deposit={q.deposit}
              payment={q.payment}
              onPaymentChange={q.handlePaymentChange}
              walletLabel={q.walletLabel}
              paymentRequest={q.paymentRequest}
              prBtnAvailable={q.prBtnAvailable}
              prBtnLoading={q.prBtnLoading}
              cardName={q.cardName}
              setCardName={q.setCardName}
              onCardChange={(complete, errMsg) => {
                q.setCardComplete(complete);
                q.setPaymentError(errMsg);
              }}
            />

            {q.paymentError && (
              <p className={styles.paymentError}>{q.paymentError}</p>
            )}

            <PayCTA
              deposit={q.deposit}
              remaining={q.remaining}
              canConfirm={q.canConfirm}
              isProcessing={q.isProcessing}
              processingLabel={q.processingLabel}
              onPay={q.handlePay}
              showSaveBanner={q.showSaveBanner}
              onSaveDetails={q.handleSaveDetails}
              onDismissSave={q.handleDismissSave}
              payment={q.payment}
              walletLabel={q.walletLabel}
              paymentRequest={q.paymentRequest}
              prBtnAvailable={q.prBtnAvailable}
              prBtnLoading={q.prBtnLoading}
            />

          </div>
        </div>

      </div>

      {/* Processing overlay */}
      {q.isProcessing && (
        <div className={styles.processingOverlay}>
          <div className={styles.processingCard}>
            <span className={styles.processingSpinner} />
            <p className={styles.processingLabel}>{q.processingLabel}</p>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Shared header ─────────────────────────────────────────────────────────
function PageHeader({ title, sub, onBack }: { title: string; sub: string; onBack: () => void }) {
  return (
    <div className={styles.header}>
      <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
        <ArrowLeft />
      </button>
      <div>
        <h1 className={styles.headerTitle}>{title}</h1>
        <p className={styles.headerSub}>{sub}</p>
      </div>
    </div>
  );
}
