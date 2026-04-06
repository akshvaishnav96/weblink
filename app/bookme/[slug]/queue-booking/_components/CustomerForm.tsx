import { useState } from "react";
import { User, Phone, Lock, ChevronDown, Search, Bell } from "lucide-react";
import styles from "../page.module.css";
import type { Country, FieldErrors } from "../_types";

interface Props {
  firstName: string;     setFirstName: (v: string) => void;
  phone: string;         setPhone: (v: string) => void;
  email: string;         setEmail: (v: string) => void;

  country: Country;
  countryOpen: boolean;  setCountryOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  countrySearch: string; setCountrySearch: (v: string) => void;
  filteredCountries: Country[];
  countryRef: React.RefObject<HTMLDivElement | null>;
  searchRef: React.RefObject<HTMLInputElement | null>;
  onSelectCountry: (c: Country) => void;

  fieldErrors: FieldErrors;
  setFieldErrors: (fn: (prev: FieldErrors) => FieldErrors) => void;

  savedBanner: boolean;
  clearSaved: () => void;

  clearPaymentError: () => void;
}

export default function CustomerForm({
  firstName, setFirstName,
  phone, setPhone,
  email, setEmail,
  country, countryOpen, setCountryOpen,
  countrySearch, setCountrySearch,
  filteredCountries, countryRef, searchRef,
  onSelectCountry,
  fieldErrors, setFieldErrors,
  savedBanner, clearSaved,
  clearPaymentError,
}: Props) {
  const [webNotify, setWebNotify] = useState(true);

  return (
    <div className={styles.section}>

      {/* Section label */}
      <p className={styles.sectionLabel}>Your Details</p>

      {/* Welcome back banner */}
      {savedBanner && (
        <div className={styles.welcomeChip}>
          <span>Welcome back, {firstName} ⚡</span>
          <button className={styles.forgetLink} onClick={clearSaved}>Forget my details</button>
        </div>
      )}

      {/* First name */}
      <div className={styles.inputRow}>
        <User className={styles.inputIcon} />
        <input
          className={`${styles.input}${fieldErrors.firstName ? ` ${styles.inputError}` : ""}`}
          placeholder="First name *"
          value={firstName}
          autoComplete="given-name"
          onChange={e => {
            setFirstName(e.target.value);
            setFieldErrors(p => ({ ...p, firstName: false }));
            clearPaymentError();
          }}
        />
      </div>

      {/* Phone + country picker */}
      <div className={styles.phoneRow}>
        <div className={styles.countryWrap} ref={countryRef}>
          <button
            type="button"
            className={`${styles.countryCode}${countryOpen ? ` ${styles.countryCodeOpen}` : ""}`}
            onClick={() => setCountryOpen(p => !p)}
          >
            <span className={styles.flag}>{country.flag}</span>
            <span className={styles.dialCode}>{country.dial_code}</span>
            <ChevronDown
              size={14}
              className={`${styles.countryChevron}${countryOpen ? ` ${styles.countryChevronOpen}` : ""}`}
            />
          </button>

          {countryOpen && (
            <div className={styles.countryDropdown}>
              <div className={styles.countrySearch}>
                <Search className={styles.countrySearchIcon} size={14} />
                <input
                  ref={searchRef}
                  className={styles.countrySearchInput}
                  placeholder="Search country…"
                  value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                />
              </div>
              <div className={styles.countryList}>
                {filteredCountries.length === 0 ? (
                  <p className={styles.countryEmpty}>No results</p>
                ) : filteredCountries.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    className={`${styles.countryOption}${c.code === country.code ? ` ${styles.countryOptionActive}` : ""}`}
                    onClick={() => onSelectCountry(c)}
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

        <div style={{ flex: 1 }}>
          <div className={styles.inputRow} style={{ marginBottom: 4 }}>
            <Phone className={styles.inputIcon} />
            <input
              className={`${styles.input}${fieldErrors.phone ? ` ${styles.inputError}` : ""}`}
              placeholder="Phone number *"
              value={phone}
              inputMode="tel"
              autoComplete="tel-national"
              onChange={e => {
                setPhone(e.target.value.replace(/[^0-9\s\-()]/g, ""));
                setFieldErrors(p => ({ ...p, phone: false }));
                clearPaymentError();
              }}
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <input
        className={styles.inputNoIcon}
        placeholder="Email for receipt (optional)"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={e => { setEmail(e.target.value); clearPaymentError(); }}
      />

      {/* Lock note */}
      <p className={styles.phoneNote}>
        <Lock className={styles.lockIcon} size={11} />
        Only used for queue updates. Never shared.
      </p>

      {/* Web link notifications toggle */}
      <div className={styles.notifyCard}>
        <span className={styles.notifyIconWrap}>
          <Bell size={16} className={styles.notifyIcon} />
        </span>
        <div className={styles.notifyText}>
          <p className={styles.notifyTitle}>Web link notifications</p>
          <p className={styles.notifyDesc}>Receive a link to track your place in the queue</p>
        </div>
        <button
          type="button"
          className={`${styles.toggle}${webNotify ? ` ${styles.toggleOn}` : ""}`}
          onClick={() => setWebNotify(p => !p)}
          aria-label="Toggle web notifications"
        >
          <span className={styles.toggleThumb} />
        </button>
      </div>

    </div>
  );
}
