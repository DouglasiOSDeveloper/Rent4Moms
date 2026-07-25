import { describe, expect, it } from "vitest";
import {
  formatAdminMoney,
  parseAdminDecimal,
  parseAdminMultiplier,
  sanitizeAdminDecimalDraft,
} from "./adminShippingFields";

describe("adminShippingFields", () => {
  it("accepts dot or comma and formats Brazilian monetary values", () => {
    expect(sanitizeAdminDecimalDraft("6.19")).toBe("6,19");
    expect(parseAdminDecimal("6,19")).toBe(6.19);
    expect(formatAdminMoney(619)).toBe("6,19");
  });

  it("turns the digit-only multiplier 12 into 1.2", () => {
    expect(parseAdminMultiplier("12")).toBe(1.2);
    expect(parseAdminMultiplier("1,2")).toBe(1.2);
  });

  it("keeps decimal consumption and distance values", () => {
    expect(parseAdminDecimal(sanitizeAdminDecimalDraft("10,5"))).toBe(10.5);
    expect(parseAdminDecimal(sanitizeAdminDecimalDraft("42.75"))).toBe(42.75);
  });
});
