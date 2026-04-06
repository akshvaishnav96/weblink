export type PaymentMethod = "apple" | "google" | "card";

export type Country = {
  name: string;
  flag: string;
  code: string;
  dial_code: string;
};

export type FieldErrors = {
  firstName?: boolean;
  guestName?: boolean;
  phone?: boolean;
};

export type CustomerSnapshot = {
  firstName: string;
  phone: string;
  email: string;
  countryCode: string;
  guestName: string;
  forSomeoneElse: boolean;
};

export type QueueBookingSummary = {
  serviceName: string;
  staffId: string;
  staffName: string;
  staffInitials: string;
  duration: string;
  price: number;
  deposit: number;
  remaining: number;
  waitMins: number;
  people: number;
};
