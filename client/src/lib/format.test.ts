import { describe, expect, it } from "vitest";
import { formatINR, rupeesToPaise } from "./format";

describe("money", () => {
  it("formats paise as rupees, Indian grouping, no stray decimals", () => {
    expect(formatINR(28000)).toBe("₹280");
    expect(formatINR(12345600)).toBe("₹1,23,456");
    expect(formatINR(2550)).toBe("₹25.5");
  });

  it("converts rupee input to integer paise without float drift", () => {
    expect(rupeesToPaise(19.99)).toBe(1999);
    expect(rupeesToPaise(0.1 + 0.2)).toBe(30);
  });
});
