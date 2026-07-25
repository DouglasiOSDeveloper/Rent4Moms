import { describe, expect, it } from "vitest";
import type { Product } from "../catalog/types";
import { createQuoteItem, repriceQuoteItem } from "./factories";

const product: Product = {
  id: "product-1",
  name: "MamaRoo",
  brand: "4moms",
  model: "4.0",
  categoryIds: [],
  ageMin: "",
  ageMax: "",
  weightMax: "",
  priceDaily: 0,
  priceWeekly: 0,
  priceMonthly: 230,
  periodPricing: {
    days60: { pricingMode: "percentage_discount", fixedPriceCents: null, discountPercent: 12, freeScope: "base_product" },
    days90: { pricingMode: "percentage_discount", fixedPriceCents: null, discountPercent: 12, freeScope: "base_product" },
  },
  status: "available",
  description: "",
  rating: 0,
  reviews: 0,
  photo: "",
  featured: false,
  conservation: "",
  tags: [],
  minDays: 30,
  specs: { dimensions: "", productWeight: "", material: "", color: "", electric: "", includes: [] },
  isActive: true,
  publicationStatus: "published",
};

const coverRate = { daily: 0, weekly: 0, monthly: 20 };
const reducerRate = { daily: 0, weekly: 0, monthly: 40 };

describe("quote factories pricing roles", () => {
  it("does not double count role-specific component rates", () => {
    const item = createQuoteItem(product, {
      periodDays: 60,
      componentRates: [coverRate, reducerRate],
      coverRates: [coverRate],
      reducerRates: [reducerRate],
    });
    expect(item.priceSnapshot.totalCents).toBe(44000);
  });

  it("migrates an old assembly snapshot when repricing", () => {
    const item = createQuoteItem(product, {
      periodDays: 30,
      componentRates: [coverRate, reducerRate],
      assembly: {
        chairModelId: "model-1",
        chairModelVersion: "4.0",
        chairModelName: "MamaRoo 4.0",
        variantId: "variant-1",
        prefix: "m40_p01_r01_b40",
        cover: { id: "cover-1", code: "p01", name: "Pano", description: "", priceAdjustment: coverRate },
        reducer: { id: "reducer-1", code: "r01", name: "Redutor", description: "", priceAdjustment: reducerRate },
        ballSet: { id: "balls-1", code: "b40", name: "Bolinhas", description: "" },
        selectedAngle: "FRT",
        selectedImage: "",
        availableQuantity: 1,
      },
    });
    const legacyItem = {
      ...item,
      productSnapshot: {
        ...item.productSnapshot,
        coverRates: undefined,
        reducerRates: undefined,
      },
    };
    expect(repriceQuoteItem(legacyItem, { periodDays: 60 }).priceSnapshot.totalCents).toBe(44000);
  });
});
