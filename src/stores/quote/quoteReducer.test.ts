import { INITIAL_PRODUCTS } from "../../data/mocks/catalog";
import { createEmptyQuoteDraft } from "../../domain/quote/factories";
import { loadQuoteDraft, QUOTE_STORAGE_KEY, saveQuoteDraft } from "./persistence";
import { quoteReducer } from "./quoteReducer";

describe("quote draft", () => {
  const product = INITIAL_PRODUCTS[0];

  it("keeps the complete product-page selection in one quote item", () => {
    const draft = quoteReducer(createEmptyQuoteDraft(), {
      type: "ADD_PRODUCT",
      product,
      options: {
        periodDays: 60,
        startDate: "2026-08-01",
        quantity: 2,
        fulfillment: "delivery",
        deliverySlot: "11:00",
        cep: "01000-000",
        shippingAmountCents: 2_500,
      },
    });

    expect(draft.items).toHaveLength(1);
    expect(draft.items[0]).toMatchObject({
      productId: product.id,
      periodDays: 60,
      quantity: 2,
      startDate: "2026-08-01",
      endDate: "2026-09-30",
    });
    expect(draft.items[0].priceSnapshot.totalCents).toBe(159_600);
    expect(draft.fulfillment).toBe("delivery");
    expect(draft.deliverySlot).toBe("11:00");
    expect(draft.address.cep).toBe("01000-000");
    expect(draft.shippingQuote.amountCents).toBe(2_500);
  });

  it("reprices every item when the shared period changes", () => {
    const withItem = quoteReducer(createEmptyQuoteDraft(), {
      type: "ADD_PRODUCT",
      product,
      options: { periodDays: 30, startDate: "2026-08-01" },
    });
    const updated = quoteReducer(withItem, { type: "UPDATE_ALL_PERIOD", periodDays: 90 });

    expect(updated.items[0].periodDays).toBe(90);
    expect(updated.items[0].endDate).toBe("2026-10-30");
    expect(updated.items[0].priceSnapshot.totalCents).toBe(119_700);
  });


  it("preserves the selected assembly in the product snapshot", () => {
    const draft = quoteReducer(createEmptyQuoteDraft(), {
      type: "ADD_PRODUCT",
      product,
      options: {
        periodDays: 30,
        rates: { daily: 31, weekly: 159, monthly: 434 },
        description: "Cadeira. Pano. Redutor.",
        photo: "data:image/svg+xml,assembly",
        assembly: {
          chairModelId: "chair-model-40",
          chairModelVersion: "4.0",
          chairModelName: "MamaRoo 4.0",
          variantId: "4.0-026",
          prefix: "m40_p07_r01_b40",
          cover: {
            id: "cover-07",
            code: "p07",
            name: "Pano tipo 7",
            description: "Pano.",
            priceAdjustment: { daily: 0.17, weekly: 1.25, monthly: 5 },
          },
          reducer: {
            id: "reducer-01",
            code: "r01",
            name: "Redutor tipo 1",
            description: "Redutor.",
            priceAdjustment: { daily: 1.17, weekly: 8.75, monthly: 35 },
          },
          ballSet: {
            id: "ball-set-40",
            code: "b40",
            name: "Conjunto de bolinhas 4.0",
            description: "Bolinhas.",
          },
          selectedAngle: "FRT",
          selectedImage: "data:image/svg+xml,assembly",
          availableQuantity: 2,
        },
      },
    });

    expect(draft.items[0].productSnapshot.assembly?.variantId).toBe("4.0-026");
    expect(draft.items[0].productSnapshot.assembly?.ballSet.code).toBe("b40");
    expect(draft.items[0].productSnapshot.description).toBe("Cadeira. Pano. Redutor.");
    expect(draft.items[0].priceSnapshot.totalCents).toBe(43_400);
  });

  it("persists and restores the full draft", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => { memory.set(key, value); },
    };
    const draft = quoteReducer(createEmptyQuoteDraft(), {
      type: "ADD_PRODUCT",
      product,
      options: { periodDays: 30, startDate: "2026-08-01", cep: "01000-000" },
    });

    saveQuoteDraft(draft, storage);
    const restored = loadQuoteDraft(storage);

    expect(memory.has(QUOTE_STORAGE_KEY)).toBe(true);
    expect(restored).toEqual(draft);
  });
});
