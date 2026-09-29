/** One line about her food, shown on the curtain between pages. */
const SLOGANS = [
  "घरगुती चव, प्रेमाने, home taste, made with love",
  "Ground at home. Pounded at home. Cooked to order.",
  "Every order read and confirmed by Aaji herself",
  "Forty years at the same stove",
  "चटक मटक!, the taste you remember",
  "No packets, no shortcuts, no hurry",
];

export const randomSlogan = (): string => SLOGANS[Math.floor(Math.random() * SLOGANS.length)]!;
