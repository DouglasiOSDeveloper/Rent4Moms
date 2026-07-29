import { describe, expect, it } from "vitest";
import type { AssemblyVariant, Product } from "../catalog/types";
import type { QuoteItem } from "./types";
import { resolveQuoteItemDisplayImage } from "./itemImage";

function quoteItem(overrides: Partial<QuoteItem["productSnapshot"]> = {}): QuoteItem {
  return {
    id: "item-1",
    productId: "product-1",
    productSnapshot: {
      id: "product-1",
      name: "mamaRoo 2.0",
      brand: "4moms",
      model: "2.0",
      photo: "",
      description: "",
      rates: { daily: 0, weekly: 0, monthly: 250 },
      assembly: {
        chairModelId: "model-1",
        chairModelVersion: "2.0",
        chairModelName: "mamaRoo 2.0",
        variantId: "variant-1",
        prefix: "2.0-003",
        cover: { id: "cover-1", code: "P09", name: "Pano 9", description: "", priceAdjustment: { daily: 0, weekly: 0, monthly: 0 } },
        reducer: null,
        ballSet: { id: "balls-1", code: "B20", name: "Bolinhas 2.0", description: "" },
        selectedAngle: "FRT",
        selectedImage: "",
        availableQuantity: 1,
      },
      ...overrides,
    },
    quantity: 1,
    periodDays: 30,
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    priceSnapshot: {} as QuoteItem["priceSnapshot"],
  };
}

const product = { id: "product-1", photo: "/api/v1/media/assets/product-photo/content" } as Product;
const variant = {
  id: "variant-1",
  images: [
    { id: "image-dir", angleId: "dir", angle: "DIR", angleLabel: "Direita", url: "/api/v1/media/assets/dir/content", alt: "Direita", isVisible: true, sortOrder: 2 },
    { id: "image-frt", angleId: "frt", angle: "FRT", angleLabel: "Frontal", url: "/api/v1/media/assets/frt/content", alt: "Frontal", isVisible: true, sortOrder: 1 },
  ],
} as AssemblyVariant;

const catalog = { products: [product], assemblyVariants: [variant] };

describe("imagem exibida em pedidos persistidos", () => {
  it("preserva a imagem pública registrada no snapshot", () => {
    expect(resolveQuoteItemDisplayImage(quoteItem({ photo: "/api/v1/media/assets/snapshot/content" }), catalog))
      .toBe("/api/v1/media/assets/snapshot/content");
  });

  it("recupera a imagem da variante e do ângulo quando o snapshot antigo está vazio", () => {
    expect(resolveQuoteItemDisplayImage(quoteItem(), catalog)).toBe("/api/v1/media/assets/frt/content");
  });

  it("ignora uma referência administrativa privada e usa a mídia pública atual", () => {
    expect(resolveQuoteItemDisplayImage(quoteItem({ photo: "/api/v1/admin/media/assets/private/content" }), catalog))
      .toBe("/api/v1/media/assets/frt/content");
  });

  it("usa a foto pública do produto quando a variante não está mais disponível", () => {
    expect(resolveQuoteItemDisplayImage(quoteItem(), { products: [product], assemblyVariants: [] }))
      .toBe("/api/v1/media/assets/product-photo/content");
  });
});
