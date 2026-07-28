import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupportRequest, listPublishedProductReviews, loadAccountOrder, requestRenewal, submitProductReview } from "./customerExperienceApi";

describe("customer experience API", () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  it("uses the protected account endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      quote: { id: "q1", payload: { items: [] } }, allocations: [], payment: null, events: [], attachments: [], renewals: [], reviews: [], supportRequests: [], renewalEligible: true, reviewEligibleItemIndexes: [], effectiveEndDate: "2030-01-01",
    }), { status: 200, headers: { "content-type": "application/json" } }));
    await loadAccountOrder("q1");
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/account/orders/q1"), expect.objectContaining({ credentials: "include" }));
  });
  it("normalizes product and operational image URLs from the protected detail", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.rent4moms.com.br/api/v1");
    vi.resetModules();
    const module = await import("./customerExperienceApi");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      quote: {
        id: "q1",
        payload: {
          items: [{
            id: "i1",
            productSnapshot: {
              photo: "/api/v1/media/assets/photo/content",
              assembly: { selectedImage: "/api/v1/media/assets/assembly/content" },
            },
          }],
        },
      },
      allocations: [],
      payment: null,
      events: [],
      attachments: [{ id: "a1", contentUrl: "/api/v1/account/orders/q1/attachments/a1/content" }],
      renewals: [],
      reviews: [],
      supportRequests: [],
      renewalEligible: false,
      reviewEligibleItemIndexes: [],
      effectiveEndDate: "2030-01-01",
    }), { status: 200, headers: { "content-type": "application/json" } }));

    const detail = await module.loadAccountOrder("q1");
    expect(detail.quote.payload.items[0].productSnapshot.photo).toBe("https://api.rent4moms.com.br/api/v1/media/assets/photo/content");
    expect(detail.quote.payload.items[0].productSnapshot.assembly?.selectedImage).toBe("https://api.rent4moms.com.br/api/v1/media/assets/assembly/content");
    expect(detail.attachments[0].contentUrl).toBe("https://api.rent4moms.com.br/api/v1/account/orders/q1/attachments/a1/content");
    vi.unstubAllEnvs();
  });
  it("submits renewal, review and support payloads", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("renewals")) return new Response(JSON.stringify({ renewal: { id: "r1" } }), { status: 201, headers: { "content-type": "application/json" } });
      if (url.includes("reviews")) return new Response(JSON.stringify({ review: { id: "v1" } }), { status: 201, headers: { "content-type": "application/json" } });
      return new Response(JSON.stringify({ supportRequest: { id: "s1" } }), { status: 201, headers: { "content-type": "application/json" } });
    });
    await requestRenewal("q1", { requestedEndDate: "2030-02-01" });
    await submitProductReview("q1", { quoteItemIndex: 0, rating: 5, comment: "Ótimo" });
    await createSupportRequest("q1", { subject: "Ajuda", message: "Preciso de ajuda" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it("loads public product reviews", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ reviews: [], summary: { rating: 0, reviewCount: 0 } }), { status: 200, headers: { "content-type": "application/json" } }));
    expect((await listPublishedProductReviews("p1")).summary.reviewCount).toBe(0);
  });
});
