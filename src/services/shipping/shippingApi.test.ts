import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../api/apiClient";
import { estimateRemoteShipping } from "./shippingApi";

vi.mock("../api/apiClient", () => ({ apiRequest: vi.fn() }));
const requestMock = vi.mocked(apiRequest);

describe("shippingApi", () => {
  beforeEach(() => requestMock.mockReset());

  it("requests a server-authoritative distance estimate for the destination", async () => {
    requestMock.mockResolvedValue({
      shippingQuote: {
        status: "calculated",
        amountCents: 2700,
        cep: "01001000",
        provider: "test_routes",
        formulaVersion: "distance-fuel-v1",
        oneWayDistanceKm: 15,
        chargedDistanceKm: 30,
        durationSeconds: 1200,
        fuelLiters: 3,
        parameters: {
          fuelPriceCentsPerLiter: 600,
          consumptionKmPerLiter: 10,
          multiplier: 1.5,
          minimumFeeCents: 2000,
          roundTrip: true,
          maxDistanceKm: 50,
        },
        calculatedAt: "2030-01-01T00:00:00.000Z",
      },
    });

    const address = {
      cep: "71925180",
      street: "Quadra 205 Sul",
      number: "624",
      complement: "",
      district: "Águas Claras",
      city: "Brasília",
      state: "DF",
    };
    const result = await estimateRemoteShipping(address);

    expect(result.amountCents).toBe(2700);
    expect(requestMock).toHaveBeenCalledWith("/shipping/estimate", {
      method: "POST",
      body: JSON.stringify({ address }),
    });
  });
});
