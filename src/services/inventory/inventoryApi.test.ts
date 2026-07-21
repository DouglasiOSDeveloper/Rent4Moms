import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../api/apiClient";
import {
  applyQuoteInventoryAction,
  createInventoryUnit,
  expireInventoryHolds,
  loadInventoryOverview,
} from "./inventoryApi";

vi.mock("../api/apiClient", () => ({
  apiRequest: vi.fn(),
}));

const requestMock = vi.mocked(apiRequest);

describe("inventoryApi", () => {
  beforeEach(() => requestMock.mockReset());

  it("loads the protected inventory overview", async () => {
    const response = {
      summary: { total: 0, byStatus: {}, byType: {}, activeAllocations: 0, expiringSoon: 0 },
      units: [], allocations: [], movements: [], availability: [],
    };
    requestMock.mockResolvedValue(response);

    await expect(loadInventoryOverview()).resolves.toEqual(response);
    expect(requestMock).toHaveBeenCalledWith("/admin/inventory/overview");
  });

  it("creates a physical unit with its full payload", async () => {
    const input = {
      code: "R4M-COVER-P01-004",
      itemType: "cover" as const,
      itemId: "cover-01",
      label: "Pano tipo 1",
      status: "available" as const,
      condition: "Bom",
      location: "Estoque principal",
      notes: "",
    };
    const unit = { id: "unit-1", ...input, createdAt: "2026-07-20T00:00:00.000Z", updatedAt: "2026-07-20T00:00:00.000Z" };
    requestMock.mockResolvedValue({ unit });

    await expect(createInventoryUnit(input)).resolves.toEqual(unit);
    expect(requestMock).toHaveBeenCalledWith("/admin/inventory/units", {
      method: "POST",
      body: JSON.stringify(input),
    });
  });

  it("sends order transitions and expiration requests to the backend", async () => {
    requestMock
      .mockResolvedValueOnce({ quote: { id: "quote-1" }, allocations: [] })
      .mockResolvedValueOnce({ expiredAllocations: 4 });

    await applyQuoteInventoryAction("quote-1", "return", "Devolução conferida");
    await expect(expireInventoryHolds()).resolves.toBe(4);

    expect(requestMock).toHaveBeenNthCalledWith(1, "/admin/quotes/quote-1/inventory-action", {
      method: "POST",
      body: JSON.stringify({ action: "return", reason: "Devolução conferida" }),
    });
    expect(requestMock).toHaveBeenNthCalledWith(2, "/admin/inventory/expire", { method: "POST" });
  });
});
