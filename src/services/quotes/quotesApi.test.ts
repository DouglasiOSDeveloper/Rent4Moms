import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PRODUCT_PERIOD_PRICING } from "../../domain/pricing/types";
import type { QuoteDraft } from "../../domain/quote/types";
import { apiRequest } from "../api/apiClient";
import { createRemoteQuote } from "./quotesApi";

vi.mock("../api/apiClient", () => ({ apiRequest: vi.fn() }));
const requestMock = vi.mocked(apiRequest);

function draftFixture(): QuoteDraft {
  return {
    version: 1,
    items: [{
      id: "product-1",
      productId: "product-1",
      quantity: 1,
      periodDays: 60,
      startDate: "2030-01-10",
      endDate: "2030-03-11",
      productSnapshot: {
        id: "product-1",
        name: "Produto",
        brand: "Marca",
        model: "Modelo",
        photo: "",
        description: "",
        rates: { daily: 999, weekly: 999, monthly: 999 },
        baseRates: { daily: 999, weekly: 999, monthly: 999 },
        componentRates: [{ daily: 999, weekly: 999, monthly: 999 }],
        periodPricing: DEFAULT_PRODUCT_PERIOD_PRICING,
        assembly: {
          chairModelId: "model-1",
          chairModelVersion: "4.0",
          chairModelName: "Modelo 4.0",
          variantId: "variant-1",
          prefix: "m40-p01",
          cover: { id: "cover-1", code: "p01", name: "Pano 1", description: "", priceAdjustment: { daily: 999, weekly: 999, monthly: 999 } },
          reducer: null,
          ballSet: { id: "balls-1", code: "b40", name: "Bolinhas", description: "" },
          selectedAngle: "FRT",
          selectedImage: "",
          availableQuantity: 1,
        },
      },
      priceSnapshot: {
        days: 60, quantity: 1, mode: "rental", monthlyBlocks: 2, weeklyBlocks: 0, dailyBlocks: 0,
        baseUnitPriceCents: 99900, coverUnitPriceCents: 0, reducerUnitPriceCents: 0, otherComponentsUnitPriceCents: 99900, componentsUnitPriceCents: 99900, unitPriceCents: 199800,
        baseSubtotalCents: 99900, coverSubtotalCents: 0, reducerSubtotalCents: 0, otherComponentsSubtotalCents: 99900, componentsSubtotalCents: 99900, discountEligibleSubtotalCents: 99900, subtotalCents: 199800,
        discountPercent: 0, baseDiscountCents: 0, reducerWaiverCents: 0, freeBaseCents: 0, freeComponentsCents: 0,
        discountCents: 0, totalCents: 199800, appliedPeriodDays: 60, benefitType: "none", freeScope: null,
      },
    }],
    fulfillment: "pickup",
    address: { cep: "", street: "", number: "", complement: "", district: "", city: "", state: "" },
    deliverySlot: "",
    shippingQuote: { status: "not_requested", amountCents: 0, cep: "" },
    customerData: { name: "Cliente", cpf: "52998224725", email: "cliente@teste.local", phone: "11999999999", whatsapp: "" },
    contractData: { customerBirthDate: "1990-01-01", nationality: "Brasileira", maritalStatus: "Casada", occupation: "Professora", babyName: "Bebê", babySex: "Feminino", babyBirthDate: "2029-01-01" },
    additionalInfo: { reason: "", notes: "", referralSource: "" },
    consents: { terms: true, privacy: true, rentalConditions: true, marketing: false },
    updatedAt: new Date().toISOString(),
  };
}

describe("quotesApi", () => {
  beforeEach(() => requestMock.mockReset());

  it("submits only product and configuration IDs, never browser pricing tables", async () => {
    requestMock.mockResolvedValue({ quote: { id: "q1", code: "ORC-1", status: "Em análise", totalCents: 1000, holdExpiresAt: null, allocations: [], createdAt: new Date().toISOString() } });

    await createRemoteQuote(draftFixture());

    const request = requestMock.mock.calls[0]?.[1] as { body: string };
    const body = JSON.parse(request.body) as Record<string, unknown>;
    const item = (body.items as Array<Record<string, unknown>>)[0];
    expect(item).toEqual({
      productId: "product-1",
      quantity: 1,
      periodDays: 60,
      startDate: "2030-01-10",
      configuration: {
        chairModelId: "model-1",
        variantId: "variant-1",
        coverId: "cover-1",
        reducerId: null,
        ballSetId: "balls-1",
        selectedAngle: "FRT",
      },
    });
    expect(JSON.stringify(item)).not.toContain("999");
    expect(item).not.toHaveProperty("productSnapshot");
    expect(item).not.toHaveProperty("priceSnapshot");
    expect(body).not.toHaveProperty("shippingQuote");
    expect(body.contractData).toEqual({ customerBirthDate: "1990-01-01", nationality: "Brasileira", maritalStatus: "Casada", occupation: "Professora", babyName: "Bebê", babySex: "Feminino", babyBirthDate: "2029-01-01" });
  });
});
