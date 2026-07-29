import type { PublicProductReview } from "../../domain/customerExperience/types";

export function externalTestimonialAttribution(review: PublicProductReview): string {
  const sourceLabel = review.sourceLabel?.trim() || "canal externo";
  return `Depoimento do ${sourceLabel}`;
}
