import type { Category, Slot } from "@shared/api";

export const CATEGORY_LABELS: Record<Category, { en: string; mr: string }> = {
  breakfast: { en: "Breakfast", mr: "न्याहारी" },
  snacks: { en: "Snacks", mr: "फराळ" },
  meals: { en: "Meals", mr: "जेवण" },
  sweets: { en: "Sweets", mr: "गोड" },
  festive: { en: "Festive", mr: "सणासुदीचे" },
  upvas: { en: "Upvas", mr: "उपवास" },
};

export const SLOT_LABELS: Record<Slot, { label: string; hint: string }> = {
  morning: { label: "Morning", hint: "8 – 11 am" },
  afternoon: { label: "Afternoon", hint: "12 – 3 pm" },
  evening: { label: "Evening", hint: "5 – 8 pm" },
};

/** Finite stock at or below this shows "Only N left". */
export const LOW_STOCK_THRESHOLD = 10;
