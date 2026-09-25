import { describe, expect, it } from "vitest";
import { getAvailability } from "./availability";

const item = (over: Partial<{ isAvailable: boolean; stockCount: number | null; minQuantity: number }> = {}) => ({
  isAvailable: true,
  stockCount: null,
  minQuantity: 1,
  ...over,
});

describe("getAvailability", () => {
  it("made-to-order dishes are unlimited with no badge", () => {
    expect(getAvailability(item())).toEqual({ canOrder: true, maxQuantity: Infinity, badge: null });
  });

  it("Aaji's toggle wins over stock", () => {
    const a = getAvailability(item({ isAvailable: false, stockCount: 50 }));
    expect(a.canOrder).toBe(false);
    expect(a.badge?.label).toBe("Not available today");
  });

  it("zero stock is sold out", () => {
    const a = getAvailability(item({ stockCount: 0 }));
    expect(a).toMatchObject({ canOrder: false, badge: { label: "Sold out", tone: "danger" } });
  });

  it("low finite stock says how many are left", () => {
    expect(getAvailability(item({ stockCount: 3 })).badge?.label).toBe("Only 3 left");
    expect(getAvailability(item({ stockCount: 30 })).badge).toBeNull();
    expect(getAvailability(item({ stockCount: 30 })).maxQuantity).toBe(30);
  });

  it("stock below the minimum order can't be ordered, even if plenty-looking", () => {
    const a = getAvailability(item({ stockCount: 15, minQuantity: 21 }));
    expect(a.canOrder).toBe(false);
    expect(a.badge?.label).toBe("Only 15 left");
  });
});
