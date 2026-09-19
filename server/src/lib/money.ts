/** All money in this codebase is an integer count of paise. */

export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);

export const formatINR = (paise: number): string =>
  `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
