/** All money is an integer count of paise. These are the only conversions. */

export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);

export const paiseToRupees = (paise: number): number => paise / 100;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 28000 → "₹280" */
export const formatINR = (paise: number): string => inr.format(paise / 100);
