import { afterEach, describe, expect, it, vi } from "vitest";
import type { OrderOperationDetail } from "../../domain/operations/types";
import { API_BASE_URL } from "../api/apiClient";
import {
  addOrderNote,
  applyOrderLifecycle,
  normalizeOrderOperationDetailImageUrls,
  saveManualPayment,
  uploadOperationalAttachment,
} from "./operationsApi";

describe("operationsApi", () => {
  afterEach(() => vi.restoreAllMocks());

  it("saves a manual payment with its audit fields", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      payment: { id: "payment-1", quoteId: "quote-1", status: "received", amountCents: 39900, method: "pix", receivedAt: null, note: "", updatedBy: "admin-1", createdAt: "2030-01-01T00:00:00.000Z", updatedAt: "2030-01-01T00:00:00.000Z" },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await saveManualPayment("quote-1", { status: "received", amountCents: 39900, method: "pix", receivedAt: null, note: "" });
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/admin/operations/orders/quote-1/payment`, expect.objectContaining({
      method: "PATCH",
      credentials: "include",
      body: JSON.stringify({ status: "received", amountCents: 39900, method: "pix", receivedAt: null, note: "" }),
    }));
  });

  it("normalizes product and attachment images returned with API-relative paths", () => {
    const relativeUrl = "/api/v1/media/assets/asset-1/content";
    const apiBaseUrl = "https://api.rent4moms.com.br/api/v1";
    const detail = {
      quote: {
        payload: {
          items: [{
            productSnapshot: {
              photo: relativeUrl,
              assembly: { selectedImage: relativeUrl },
            },
          }],
        },
      },
      attachments: [{ contentUrl: relativeUrl }],
    } as unknown as OrderOperationDetail;

    const normalized = normalizeOrderOperationDetailImageUrls(detail, apiBaseUrl);
    const expected = "https://api.rent4moms.com.br/api/v1/media/assets/asset-1/content";
    expect(normalized.quote.payload.items[0]?.productSnapshot.photo).toBe(expected);
    expect(normalized.quote.payload.items[0]?.productSnapshot.assembly?.selectedImage).toBe(expected);
    expect(normalized.attachments[0]?.contentUrl).toBe(expected);
  });

  it("uploads photos as multipart without forcing a JSON content type", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      attachment: { id: "attachment-1", quoteId: "quote-1", unitId: null, kind: "delivery", originalName: "foto.png", mimeType: "image/png", sizeBytes: 8, note: "", contentUrl: "/api/v1/admin/operations/attachments/attachment-1/content", createdAt: "2030-01-01T00:00:00.000Z" },
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "foto.png", { type: "image/png" });

    await uploadOperationalAttachment("quote-1", { file, kind: "delivery", note: "Entrega" });
    const [, init] = fetchMock.mock.calls[0] ?? [];
    expect(init?.body).toBeInstanceOf(FormData);
    expect(new Headers(init?.headers).has("Content-Type")).toBe(false);
  });

  it("sends lifecycle actions and internal notes to the protected endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({
        quote: { id: "quote-1", payload: { items: [] } },
        allocations: [],
        payment: null,
        attachments: [],
        events: [],
        hygieneJobs: [],
        maintenanceJobs: [],
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ event: { id: "event-1" } }), { status: 201, headers: { "Content-Type": "application/json" } }));

    await applyOrderLifecycle("quote-1", { action: "deliver", note: "Entregue", responsible: "Equipe" });
    await addOrderNote("quote-1", "Cliente avisado");
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${API_BASE_URL}/admin/operations/orders/quote-1/lifecycle`, expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_BASE_URL}/admin/operations/orders/quote-1/notes`, expect.objectContaining({ method: "POST" }));
  });
});
