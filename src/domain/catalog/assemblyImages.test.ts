import { describe, expect, it } from "vitest";
import type { CatalogSnapshot } from "./types";
import { normalizeCatalogSnapshotImageUrls } from "./assemblyImages";

const relativeContentUrl = "/api/v1/media/assets/asset-1/content";
const absoluteContentUrl = "https://cdn.example.com/image.jpg";
const productionApiBaseUrl = "https://api.rent4moms.com.br/api/v1";

function createSnapshot(): CatalogSnapshot {
  return {
    version: 2,
    products: [{
      id: "product-1",
      name: "MamaRoo 2.0",
      brand: "4moms",
      model: "2.0",
      categoryIds: [],
      ageMin: "2 meses",
      ageMax: "9 meses",
      weightMax: "9 kg",
      priceDaily: 0,
      priceWeekly: 0,
      priceMonthly: 0,
      status: "available",
      description: "",
      rating: 0,
      reviews: 0,
      photo: relativeContentUrl,
      images: [{ id: "product-image", url: relativeContentUrl, alt: "", originalName: "image.jpg", isPrimary: true, sortOrder: 0 }],
      featured: true,
      conservation: "Excelente",
      tags: [],
      minDays: 1,
      specs: { dimensions: "", productWeight: "", material: "", color: "", electric: "", includes: [] },
      isActive: true,
      publicationStatus: "published",
    }],
    categories: [],
    chairModels: [{
      id: "model-1",
      productId: "product-1",
      version: "2.0",
      technicalCode: "m20",
      name: "MamaRoo 2.0",
      description: "",
      ballSetId: "ball-set-1",
      isActive: true,
      availableQuantity: 1,
      defaultImage: relativeContentUrl,
      images: [{ id: "model-image", url: relativeContentUrl, alt: "", originalName: "image.jpg", isPrimary: true, sortOrder: 0 }],
    }],
    covers: [{
      id: "cover-1",
      kind: "cover",
      code: "p01",
      name: "Pano",
      description: "",
      priceAdjustment: { daily: 0, weekly: 0, monthly: 0 },
      isActive: true,
      availableQuantity: 1,
      photo: relativeContentUrl,
    }],
    reducers: [{
      id: "reducer-1",
      kind: "reducer",
      code: "r01",
      name: "Redutor",
      description: "",
      priceAdjustment: { daily: 0, weekly: 0, monthly: 0 },
      isActive: true,
      availableQuantity: 1,
      photo: relativeContentUrl,
    }],
    ballSets: [{
      id: "ball-set-1",
      code: "b01",
      name: "Bolinhas",
      modelId: "model-1",
      description: "",
      isActive: true,
      availableQuantity: 1,
      photo: absoluteContentUrl,
    }],
    compatibilities: [],
    assemblyVariants: [{
      id: "variant-1",
      modelId: "model-1",
      coverId: "cover-1",
      reducerId: "reducer-1",
      ballSetId: "ball-set-1",
      prefix: "2.0-001",
      isActive: true,
      publicationStatus: "published",
      images: [{
        id: "variant-image",
        angleId: "angle-frt",
        angle: "FRT",
        angleLabel: "Frontal",
        url: relativeContentUrl,
        alt: "",
        isVisible: true,
        sortOrder: 0,
      }],
    }],
    updatedAt: "2026-07-28T00:00:00.000Z",
  };
}

describe("normalizeCatalogSnapshotImageUrls", () => {
  it("converts every catalog media path to the production API origin", () => {
    const normalized = normalizeCatalogSnapshotImageUrls(createSnapshot(), productionApiBaseUrl);
    const expectedUrl = `https://api.rent4moms.com.br${relativeContentUrl}`;

    expect(normalized.products[0]?.photo).toBe(expectedUrl);
    expect(normalized.products[0]?.images?.[0]?.url).toBe(expectedUrl);
    expect(normalized.chairModels[0]?.defaultImage).toBe(expectedUrl);
    expect(normalized.chairModels[0]?.images?.[0]?.url).toBe(expectedUrl);
    expect(normalized.covers[0]?.photo).toBe(expectedUrl);
    expect(normalized.reducers[0]?.photo).toBe(expectedUrl);
    expect(normalized.assemblyVariants[0]?.images[0]?.url).toBe(expectedUrl);
  });

  it("keeps already absolute media URLs unchanged", () => {
    const normalized = normalizeCatalogSnapshotImageUrls(createSnapshot(), productionApiBaseUrl);

    expect(normalized.ballSets[0]?.photo).toBe(absoluteContentUrl);
  });
});
