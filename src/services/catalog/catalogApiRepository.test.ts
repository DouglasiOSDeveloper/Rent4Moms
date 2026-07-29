import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyCatalogSnapshot } from "../../domain/catalog/emptyCatalog";
import { DEFAULT_PRODUCT_PERIOD_PRICING } from "../../domain/pricing/types";
import { apiRequest } from "../api/apiClient";
import { CatalogApiRepository } from "./catalogApiRepository";

vi.mock("../api/apiClient", () => ({ apiRequest: vi.fn() }));

const requestMock = vi.mocked(apiRequest);

describe("CatalogApiRepository Stage C CRUD", () => {
  beforeEach(() => requestMock.mockReset());

  it("creates products through the normalized entity endpoint", async () => {
    const input = {
      name: "MamaRoo 4.0",
      brand: "4moms",
      model: "4.0",
      categoryIds: [],
      ageMin: "0 meses",
      ageMax: "6 meses",
      weightMax: "9 kg",
      priceDaily: 20,
      priceWeekly: 149,
      priceMonthly: 399,
      periodPricing: DEFAULT_PRODUCT_PERIOD_PRICING,
      status: "available" as const,
      description: "",
      details: { audience: "", includedItems: "", usage: "", safety: "" },
      featured: false,
      conservation: "Bom",
      tags: [],
      minDays: 1,
      specs: { dimensions: "", productWeight: "", material: "", color: "", electric: "", includes: [] },
      isActive: true,
      publicationStatus: "draft" as const,
    };
    const catalog = createEmptyCatalogSnapshot();
    requestMock.mockResolvedValue({ entity: { id: "product-1", rating: 0, reviews: 0, ...input }, catalog });

    const repository = new CatalogApiRepository();
    await repository.createProduct(input);

    expect(requestMock).toHaveBeenCalledWith("/admin/catalog/products", {
      method: "POST",
      body: JSON.stringify(input),
    });
  });

  it("persists an empty compatibility selection without a local fallback", async () => {
    const catalog = createEmptyCatalogSnapshot();
    requestMock
      .mockResolvedValueOnce({
        entity: {
          id: "cover-1",
          kind: "cover",
          code: "p01",
          name: "Pano 1",
          description: "",
          priceAdjustment: { daily: 0, weekly: 0, monthly: 0 },
          isActive: true,
          availableQuantity: 0,
        },
        catalog,
      })
      .mockResolvedValueOnce({ catalog });

    const repository = new CatalogApiRepository();
    await repository.saveComponent("cover", {
      code: "p01",
      name: "Pano 1",
      description: "",
      priceAdjustment: { daily: 0, weekly: 0, monthly: 0 },
      isActive: true,
      compatibleModelIds: [],
      preferredModelIds: [],
    });

    expect(requestMock).toHaveBeenNthCalledWith(2, "/admin/catalog/components/cover/cover-1/compatibilities", {
      method: "PUT",
      body: JSON.stringify({ compatibleModelIds: [], preferredModelIds: [] }),
    });
  });
});
