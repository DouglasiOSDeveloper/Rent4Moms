import { describe, expect, it } from "vitest";
import type { PublicProductReview } from "../../domain/customerExperience/types";
import { externalTestimonialAttribution } from "./reviewAttribution";

const review = (sourceLabel?: string | null): PublicProductReview => ({
  id: "review-1",
  productId: "product-1",
  productName: "MamaRoo 4.0",
  customerDisplayName: "Família A.",
  rating: 5,
  comment: "Ótimo produto.",
  source: "external_testimonial",
  sourceLabel,
  isFeatured: true,
  reviewedAt: "2030-01-01T00:00:00.000Z",
  createdAt: "2030-01-01T00:00:00.000Z",
});

describe("externalTestimonialAttribution", () => {
  it("exibe o canal público informado pelo backend", () => {
    expect(externalTestimonialAttribution(review("WhatsApp"))).toBe("Depoimento do WhatsApp");
  });

  it("usa uma descrição segura quando o canal não está disponível", () => {
    expect(externalTestimonialAttribution(review(null))).toBe("Depoimento do canal externo");
  });
});
