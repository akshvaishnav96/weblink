import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface BookingSelection {
  barberId: string;
  serviceName: string;
  serviceId: string;
  staffName: string;
  staffId: string;
  staffInitials: string;
  staffPicture: string;
  displayTime: string;
  duration: string;
  price: string;
  businessName: string;
  businessAddress: string;
  rawTimeSlot: string;
  bookingDate: string;
  serviceType: string;
}

export interface CustomerInfo {
  firstName: string;
  phone: string;
  countryCode: string;
  email: string;
  guestName: string;
  isBookingSomeone: boolean;
  payment: "onsite" | "apple" | "card" | "upi";
  // Stripe fields — set after payment method is captured
  paymentMethodId?: string;  // Stripe PaymentMethod ID (card / Apple/Google Pay)
  paymentIntentId?: string;  // Stripe PaymentIntent ID (set after Apple/Google Pay completes)
  upiId?: string;            // UPI VPA entered by user
}

interface BookingState {
  selection: Partial<BookingSelection>;
  customer: Partial<CustomerInfo>;
  setSelection: (data: BookingSelection) => void;
  setCustomer: (data: Partial<CustomerInfo>) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      selection: {},
      customer: {},
      setSelection: (selection) => set({ selection }),
      setCustomer: (customer) => set((state) => ({ customer: { ...state.customer, ...customer } })),
      clearBooking: () => set({ selection: {}, customer: {} }),
    }),
    {
      name: "groomly-booking",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
