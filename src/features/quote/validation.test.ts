import { DEFAULT_DELIVERY_SETTINGS } from "../../domain/delivery/slots";
import { createEmptyQuoteDraft } from "../../domain/quote/factories";
import { INITIAL_PRODUCTS } from "../../test/fixtures/catalogFixture";
import { quoteReducer } from "../../stores/quote/quoteReducer";
import { validateQuoteStep } from "./validation";

describe("quote step validation", () => {
  const now = new Date("2026-07-20T15:00:00.000Z");

  it("blocks same-day delivery and missing address fields", () => {
    let draft = quoteReducer(createEmptyQuoteDraft(), {
      type: "ADD_PRODUCT",
      product: INITIAL_PRODUCTS[0],
      options: { periodDays: 30, startDate: "2026-07-20", fulfillment: "delivery", cep: "01001-000" },
    });
    draft = quoteReducer(draft, { type: "UPDATE_SHIPPING_QUOTE", estimate: {
      status: "calculated" as const,
      amountCents: 2_500,
      cep: "01001-000",
      provider: "test_routes",
      formulaVersion: "distance-fuel-v1" as const,
      originLabel: "Estoque de teste",
      oneWayDistanceKm: 5,
      chargedDistanceKm: 10,
      durationSeconds: 900,
      fuelLiters: 1,
      parameters: { fuelPriceCentsPerLiter: 600, consumptionKmPerLiter: 10, multiplier: 1, minimumFeeCents: 2500, roundTrip: true, maxDistanceKm: 50 },
      calculatedAt: new Date(0).toISOString(),
    }, cep: "01001-000" });

    const errors = validateQuoteStep(1, draft, DEFAULT_DELIVERY_SETTINGS, now);
    expect(errors.startDate).toContain("amanhã");
    expect(errors.street).toBeTruthy();
    expect(errors.deliverySlot).toBeTruthy();
  });

  it("accepts a complete delivery step", () => {
    let draft = quoteReducer(createEmptyQuoteDraft(), {
      type: "ADD_PRODUCT",
      product: INITIAL_PRODUCTS[0],
      options: { periodDays: 30, startDate: "2026-07-21", fulfillment: "delivery", cep: "01001-000", deliverySlot: "11:00" },
    });
    draft = quoteReducer(draft, { type: "UPDATE_ADDRESS", patch: { street: "Praça da Sé", number: "100", city: "São Paulo", state: "SP" } });
    draft = quoteReducer(draft, { type: "UPDATE_SHIPPING_QUOTE", estimate: {
      status: "calculated" as const,
      amountCents: 2_500,
      cep: "01001-000",
      provider: "test_routes",
      formulaVersion: "distance-fuel-v1" as const,
      originLabel: "Estoque de teste",
      oneWayDistanceKm: 5,
      chargedDistanceKm: 10,
      durationSeconds: 900,
      fuelLiters: 1,
      parameters: { fuelPriceCentsPerLiter: 600, consumptionKmPerLiter: 10, multiplier: 1, minimumFeeCents: 2500, roundTrip: true, maxDistanceKm: 50 },
      calculatedAt: new Date(0).toISOString(),
    }, cep: "01001-000" });

    expect(validateQuoteStep(1, draft, DEFAULT_DELIVERY_SETTINGS, now)).toEqual({});
  });

  it("validates required personal data", () => {
    const draft = {
      ...createEmptyQuoteDraft(),
      customerData: {
        name: "Ana Clara",
        cpf: "529.982.247-25",
        email: "ana@example.com",
        phone: "(11) 98765-4321",
        whatsapp: "",
      },
    };
    expect(validateQuoteStep(2, draft, DEFAULT_DELIVERY_SETTINGS, now)).toEqual({});
  });
});
