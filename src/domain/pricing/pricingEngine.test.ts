import { calculateQuotePriceSummary, calculateRentalPrice } from "./pricingEngine";

const rates = { daily: 29, weekly: 149, monthly: 399 };

describe("pricingEngine", () => {
  it("uses the same monthly tariff for 30, 60 and 90 day periods", () => {
    expect(calculateRentalPrice({ rates, days: 30 }).totalCents).toBe(39_900);
    expect(calculateRentalPrice({ rates, days: 60 }).totalCents).toBe(79_800);
    expect(calculateRentalPrice({ rates, days: 90 }).totalCents).toBe(119_700);
  });

  it("combines monthly, weekly and daily blocks deterministically", () => {
    const result = calculateRentalPrice({ rates, days: 38, quantity: 2 });

    expect(result.monthlyBlocks).toBe(1);
    expect(result.weeklyBlocks).toBe(1);
    expect(result.dailyBlocks).toBe(1);
    expect(result.unitPriceCents).toBe(57_700);
    expect(result.totalCents).toBe(115_400);
  });

  it("discounts the base plus cover and makes the reducer free in 60/90 days", () => {
    const policy = {
      days60: { pricingMode: "percentage_discount" as const, fixedPriceCents: null, discountPercent: 12, freeScope: "base_product" as const },
      days90: { pricingMode: "percentage_discount" as const, fixedPriceCents: null, discountPercent: 12, freeScope: "base_product" as const },
    };
    const baseRates = { daily: 0, weekly: 0, monthly: 230 };
    const coverRates = [{ daily: 0, weekly: 0, monthly: 20 }];
    const reducerRates = [{ daily: 0, weekly: 0, monthly: 40 }];

    expect(calculateRentalPrice({ baseRates, coverRates, reducerRates, periodPricing: policy, days: 30 })).toMatchObject({
      totalCents: 29000,
      reducerWaiverCents: 0,
    });
    expect(calculateRentalPrice({ baseRates, coverRates, reducerRates, periodPricing: policy, days: 60 })).toMatchObject({
      discountEligibleSubtotalCents: 50000,
      baseDiscountCents: 6000,
      reducerWaiverCents: 8000,
      totalCents: 44000,
      benefitType: "discount",
    });
    expect(calculateRentalPrice({ baseRates, coverRates, reducerRates, periodPricing: policy, days: 90 })).toMatchObject({
      discountEligibleSubtotalCents: 75000,
      baseDiscountCents: 9000,
      reducerWaiverCents: 12000,
      totalCents: 66000,
      benefitType: "discount",
    });

    const renewal = calculateRentalPrice({
      baseRates,
      coverRates,
      reducerRates,
      periodPricing: policy,
      days: 90,
      mode: "renewal",
    });
    expect(renewal).toMatchObject({ discountCents: 0, reducerWaiverCents: 0, totalCents: 87000, benefitType: "none" });
  });


  it("never applies a promotional discount to renewal mode", () => {
    const rental = calculateRentalPrice({ rates, days: 30, discountPercent: 10 });
    const renewal = calculateRentalPrice({ rates, days: 30, discountPercent: 10, mode: "renewal" });

    expect(rental.discountCents).toBe(3_990);
    expect(renewal.discountCents).toBe(0);
  });

  it("adds shipping once to the quote total", () => {
    const item = calculateRentalPrice({ rates, days: 30 });
    const summary = calculateQuotePriceSummary([item, item], 2_500);

    expect(summary.itemsSubtotalCents).toBe(79_800);
    expect(summary.shippingCents).toBe(2_500);
    expect(summary.totalCents).toBe(82_300);
  });
});
