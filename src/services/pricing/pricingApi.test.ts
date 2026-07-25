import { afterEach, describe, expect, it, vi } from "vitest";
import { estimateRemotePricing } from "./pricingApi";

afterEach(() => vi.restoreAllMocks());

describe("pricingApi", () => {
  it("requests an authoritative estimate with the selected composition", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      pricing: { totalCents: 51000 },
      composition: { chairModelId: "model-1", coverId: "cover-1", reducerId: null, ballSetId: "balls-1" },
      policy: {
        days60: { pricingMode: "percentage_discount", fixedPriceCents: null, discountPercent: 12, freeScope: "base_product" },
        days90: { pricingMode: "free", fixedPriceCents: null, discountPercent: 0, freeScope: "base_product" },
      },
    }), { status: 200, headers: { "content-type": "application/json" } }));

    const response = await estimateRemotePricing({
      productId: "product-1",
      periodDays: 60,
      quantity: 1,
      configuration: { chairModelId: "model-1", coverId: "cover-1", reducerId: null, ballSetId: "balls-1" },
    });

    expect(response.pricing.totalCents).toBe(51000);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/v1/pricing/estimate"), expect.objectContaining({ method: "POST" }));
  });
});
