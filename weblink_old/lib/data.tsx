import {
  Barber,
  Booking,
  Package,
  PointActivity,
  RewardItem,
  UserProfile,
} from "@/types";

import {
  Scissors,
  Sparkles,
  Hand,
  Droplets,
  Shield,
  Dumbbell,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Service Categories
───────────────────────────────────────────── */

export const SERVICE_CATEGORIES = [
  { id: "haircut", label: "Haircut", icon: <Scissors /> },
  { id: "beard", label: "Beard", icon: <Sparkles /> },
  { id: "massage", label: "Massage", icon: <Hand /> },
  { id: "facial", label: "Facial", icon: <Droplets /> },
  { id: "nails", label: "Nails", icon: <Shield /> },
  { id: "recovery", label: "Recovery", icon: <Dumbbell /> },
];

/* ─────────────────────────────────────────────
   Barber Directory
───────────────────────────────────────────── */

export const BARBERS: Barber[] = [
  {
    id: "marcus-rivera",
    initials: "MR",
    name: "Marcus Rivera",
    title: "Master Barber",
    address: "42 King St, Downtown",
    rating: 4.9,
    reviewCount: 284,
    distance: "0.3 mi",
    priceFrom: 35,
    website: "https://example.com",
    instagram: "https://instagram.com",
    bio: "Master Barber with years of experience delivering premium grooming services.",
    services: [
      {
        id: "hair-beard",
        name: "Hair & Beard",
        duration: 60,
        price: 55,
        originalPrice: 60,
        paymentType: "PAY_ONLINE",
        isMostPopular: true,
        nextAvailable: "Today, 5:00 PM",
        description:
          "Full haircut plus beard trim, shape-up, and hot towel finish.",
        staffAvailability: [
          {
            staffId: "mr",
            staffInitials: "MR",
            staffName: "Marcus R.",
            slots: ["3:00 PM", "4:30 PM"],
          },
          {
            staffId: "jp",
            staffInitials: "JP",
            staffName: "Jay P.",
            isMostBooked: true,
            slots: ["3:30 PM", "5:00 PM", "6:00 PM"],
          },
          {
            staffId: "dl",
            staffInitials: "DL",
            staffName: "Deon L.",
            slots: ["2:00 PM", "3:45 PM", "5:15 PM"],
          },
        ],
      },
      {
        id: "haircut",
        name: "Haircut",
        duration: 30,
        price: 35,
        originalPrice: 40,
        paymentType: "PAY_ONLINE_OR_ONSITE",
        nextAvailable: "Today, 2:30 PM",
        description: "Classic haircut with scissor or clipper finish.",
        staffAvailability: [
          {
            staffId: "mr",
            staffInitials: "MR",
            staffName: "Marcus R.",
            slots: ["2:30 PM", "4:00 PM", "5:30 PM"],
          },
          {
            staffId: "jp",
            staffInitials: "JP",
            staffName: "Jay P.",
            isMostBooked: true,
            slots: ["1:00 PM", "3:00 PM", "5:00 PM"],
          },
          {
            staffId: "dl",
            staffInitials: "DL",
            staffName: "Deon L.",
            slots: ["2:00 PM", "4:30 PM"],
          },
        ],
      },
      {
        id: "beard-trim",
        name: "Beard Trim",
        duration: 20,
        price: 20,
        paymentType: "PAY_ONSITE",
        nextAvailable: "Today, 1:45 PM",
        description: "Beard shaping, line-up and conditioning.",
        staffAvailability: [
          {
            staffId: "mr",
            staffInitials: "MR",
            staffName: "Marcus R.",
            isMostBooked: true,
            slots: ["1:45 PM", "3:15 PM", "5:45 PM"],
          },
          {
            staffId: "jp",
            staffInitials: "JP",
            staffName: "Jay P.",
            slots: ["2:15 PM", "4:00 PM"],
          },
        ],
      },
      {
        id: "skin-fade",
        name: "Skin Fade",
        duration: 45,
        price: 40,
        paymentType: "PAY_ONSITE",
        nextAvailable: "Tomorrow, 10:00 AM",
        description: "Precision skin fade blended to perfection.",
        staffAvailability: [
          {
            staffId: "mr",
            staffInitials: "MR",
            staffName: "Marcus R.",
            slots: ["10:00 AM", "1:30 PM"],
          },
          {
            staffId: "dl",
            staffInitials: "DL",
            staffName: "Deon L.",
            isMostBooked: true,
            slots: ["11:00 AM", "2:00 PM", "4:00 PM"],
          },
        ],
      },
      {
        id: "kids-cut",
        name: "Kids Cut",
        duration: 25,
        price: 25,
        paymentType: "PAY_ONSITE",
        nextAvailable: "Today, 4:00 PM",
        description: "Gentle cut for kids, scissor or clipper styled.",
        staffAvailability: [
          {
            staffId: "jp",
            staffInitials: "JP",
            staffName: "Jay P.",
            isMostBooked: true,
            slots: ["4:00 PM", "5:00 PM"],
          },
          {
            staffId: "dl",
            staffInitials: "DL",
            staffName: "Deon L.",
            slots: ["4:30 PM", "5:30 PM"],
          },
        ],
      },
      {
        id: "hot-towel-shave",
        name: "Hot Towel Shave",
        duration: 30,
        price: 30,
        paymentType: "WALK_IN_ONLY",
        description: "Traditional straight razor shave with hot towel treatment.",
        staffAvailability: [
          {
            staffId: "mr",
            staffInitials: "MR",
            staffName: "Marcus R.",
            slots: [],
            hours: "12:00 PM - 8:00 PM"
          },
          {
            staffId: "jp",
            staffInitials: "JP",
            staffName: "Jay P.",
            slots: [],
            hours: "10:00 AM - 6:00 PM"
          },
        ],
      },
    ],
  },

  {
    id: "james-chen",
    initials: "JC",
    name: "James Chen",
    title: "Hair Stylist & Colorist",
    address: "88 Park Ave",
    rating: 4.8,
    reviewCount: 192,
    distance: "0.7 mi",
    priceFrom: 45,
    services: [],
  },

  {
    id: "derek-williams",
    initials: "DW",
    name: "Derek Williams",
    title: "Beard Specialist",
    address: "15 Oak Street",
    rating: 4.9,
    reviewCount: 341,
    distance: "1.2 mi",
    priceFrom: 30,
    services: [],
  },

  {
    id: "alex-thompson",
    initials: "AT",
    name: "Alex Thompson",
    title: "Wellness & Massage",
    address: "220 Wellness Blvd",
    rating: 5,
    reviewCount: 196,
    distance: "0.5 mi",
    priceFrom: 60,
    services: [],
  },

  {
    id: "tyler-brooks",
    initials: "TB",
    name: "Tyler Brooks",
    title: "Grooming Expert",
    address: "5 Style Lane",
    rating: 4.7,
    reviewCount: 98,
    distance: "1.5 mi",
    priceFrom: 40,
    services: [],
  },
];

/* ─────────────────────────────────────────────
   Groomly Packages
───────────────────────────────────────────── */

export const PACKAGES: Package[] = [
  {
    id: "date-night",
    title: "Date Night Ready",
    description: "Haircut, beard trim, facial & cologne consultation",
    price: 89,
    duration: 135,
    rating: 4.8,
    imageUrl: "/barber-shop.jpg",
  },
  {
    id: "pro-look",
    title: "Pro Look",
    description: "Executive cut, hot towel shave & scalp treatment",
    price: 85,
    duration: 90,
    rating: 4.8,
    imageUrl: "/barber-shop.jpg",
  },
  {
    id: "athlete-recovery",
    title: "Athlete Recovery",
    description: "Deep tissue massage, cold therapy & stretch session",
    price: 110,
    duration: 120,
    rating: 4.8,
    imageUrl: "/barber-shop.jpg",
  },
];

/* ─────────────────────────────────────────────
   Bookings
───────────────────────────────────────────── */

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    barberId: "marcus-rivera",
    barberName: "Marcus Rivera",
    barberInitials: "MR",
    service: "Hair & Beard",
    date: "Fri, Mar 14, 2026",
    time: "5:00 PM",
    duration: 60,
    price: 55,
    status: "confirmed",
    address: "42 King St, Downtown",
  },
  {
    id: "b2",
    barberId: "james-chen",
    barberName: "James Chen",
    barberInitials: "JC",
    service: "Skin Fade",
    date: "Wed, Mar 5, 2026",
    time: "3:30 PM",
    duration: 45,
    price: 40,
    status: "completed",
    address: "88 Park Ave",
  },
];

/* ─────────────────────────────────────────────
   User Rewards
───────────────────────────────────────────── */

export const USER_POINTS = 840;

export const USER_TIER: "Bronze" | "Silver" | "Gold" | "Platinum" = "Silver";

export const NEXT_TIER_POINTS = 1000;

export const USER_PROFILE: UserProfile = {
  name: "Jordan Mitchell",
  email: "jordan.mitchell@email.com",
  phone: "+1 (555) 012-3456",
  initials: "JM",
  memberSince: "Jan 2025",
};

/* ─────────────────────────────────────────────
   Rewards Catalog
───────────────────────────────────────────── */

export const REWARDS: RewardItem[] = [
  {
    id: "r1",
    title: "Free Beard Trim",
    description: "Valid at any partner barber",
    points: 500,
    icon: "🪒",
  },
  {
    id: "r2",
    title: "$10 Off Any Service",
    description: "Applied at checkout",
    points: 800,
    icon: "💰",
  },
  {
    id: "r3",
    title: "Free Haircut",
    description: "Full haircut at any partner barber",
    points: 1200,
    icon: "✂️",
  },
];

/* ─────────────────────────────────────────────
   Point History
───────────────────────────────────────────── */

export const POINT_ACTIVITIES: PointActivity[] = [
  {
    id: "a1",
    description: "Hair & Beard — Marcus Rivera",
    points: 55,
    date: "Feb 25, 2026",
  },
  {
    id: "a2",
    description: "Skin Fade — James Chen",
    points: 40,
    date: "Feb 10, 2026",
  },
  {
    id: "a3",
    description: "Redeemed: $10 Off",
    points: -800,
    date: "Jan 28, 2026",
  },
];

/* ─────────────────────────────────────────────
   Available Booking Slots
───────────────────────────────────────────── */

export const TIME_SLOTS = [
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
];