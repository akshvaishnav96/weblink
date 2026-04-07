import { User, Phone, Lock, ChevronDown, Search } from "lucide-react";
import styles from "../page.module.css";
import type { Country, FieldErrors } from "../_types";

interface Props {
  // Field values + setters
  firstName: string;     setFirstName: (v: string) => void;
  phone: string;         setPhone: (v: string) => void;
  email: string;         setEmail: (v: string) => void;

  // Country picker
  country: Country;
  countryOpen: boolean;  setCountryOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  countrySearch: string; setCountrySearch: (v: string) => void;
  filteredCountries: Country[];
  countryRef: React.RefObject<HTMLDivElement | null>;
  searchRef: React.RefObject<HTMLInputElement | null>;
  onSelectCountry: (c: Country) => void;

  // Validation
  fieldErrors: FieldErrors;
  setFieldErrors: (fn: (prev: FieldErrors) => FieldErrors) => void;

  // Saved banner
  savedBanner: boolean;
  clearSaved: () => void;

  // Side-effect: clear payment error on any change
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
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitleRow}>
        <div>
          <p className={styles.sectionTitle}>About You</p>
          {!savedBanner && <p className={styles.sectionSub}>Your details for the queue booking</p>}
        </div>
      </div>
        {savedBanner && (
          <div className={styles.welcomeChip}>
            <span className={styles.welcomeText}>Welcome back, {firstName} ⚡</span>
            <button className={styles.forgetLink} onClick={clearSaved}>Forget my details</button>
          </div>
        )}

      {/* Name */}
      <div className={styles.inputRow}>
        <User className={styles.inputIcon} />
        <input
          className={`${styles.input}${fieldErrors.firstName ? ` ${styles.inputError}` : ""}`}
          placeholder="Your name"
          value={firstName}
          autoComplete="given-name"
          maxLength={100}
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
              placeholder="Phone number"
              value={phone}
              inputMode="tel"
              autoComplete="tel-national"
              maxLength={15}
              onChange={e => {
                setPhone(e.target.value.replace(/[^0-9\s\-()]/g, ""));
                setFieldErrors(p => ({ ...p, phone: false }));
                clearPaymentError();
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.phoneNote}>
        <Lock className={styles.lockIcon} size={11} />
        Your phone number is used for queue updates only
      </div>

      {/* Email (optional) */}
      <input
        className={styles.inputNoIcon}
        placeholder="Email address (optional)"
        type="email"
        inputMode="email"
        autoComplete="email"
        maxLength={255}
        value={email}
        onChange={e => { setEmail(e.target.value); clearPaymentError(); }}
      />
    </div>
  );
}
