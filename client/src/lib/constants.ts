import type { Category, Slot } from "@shared/api";

export const CATEGORY_LABELS: Record<Category, { en: string; mr: string }> = {
  snacks: { en: "Marathi Snacks", mr: "खास महाराष्ट्राची चव" },
  faral: { en: "Diwali Faral", mr: "सणासुदीचे" },
  "thali-veg": { en: "Veg Thali", mr: "शाकाहारी थाळी" },
  "thali-nonveg": { en: "Non-veg Thali", mr: "मांसाहारी थाळी" },
};

export const SLOT_LABELS: Record<Slot, { label: string; hint: string }> = {
  morning: { label: "Morning", hint: "8 – 11 am" },
  afternoon: { label: "Afternoon", hint: "12 – 3 pm" },
  evening: { label: "Evening", hint: "5 – 8 pm" },
};

/** Finite stock at or below this shows "Only N left". */
export const LOW_STOCK_THRESHOLD = 10;
