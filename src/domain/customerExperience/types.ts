import type { InventoryAllocation } from "../inventory/types";
import type { ManualPayment, OperationalAttachment } from "../operations/types";
import type { PersistedQuote } from "../../services/quotes/quotesApi";

export type RenewalStatus = "pending" | "approved" | "rejected" | "cancelled";
export interface RenewalRequest {
  id: string; quoteId: string; customerId: string; requestedEndDate: string; extensionDays: number; amountCents: number;
  status: RenewalStatus; customerNote: string; adminNote: string; decidedBy: string | null; decidedAt: string | null; createdAt: string; updatedAt: string;
}
export type ReviewStatus = "published" | "hidden" | "rejected";
export type ReviewSource = "verified_customer" | "external_testimonial";
export interface ProductReview {
  id: string; quoteId: string | null; quoteItemIndex: number | null; customerId: string | null; productId: string; productName: string;
  customerDisplayName: string; rating: number; comment: string; status: ReviewStatus; isFeatured: boolean; source: ReviewSource; sourceNote: string; reviewedAt: string; createdBy: string | null; moderatedBy: string | null; moderatedAt: string | null; createdAt: string; updatedAt: string;
}
export interface PublicProductReview { id: string; productId: string; productName: string; customerDisplayName: string; rating: number; comment: string; source: ReviewSource; isFeatured: boolean; reviewedAt: string; createdAt: string; }
export interface ManualReviewInput { productId: string; customerDisplayName: string; rating: number; comment: string; status: "published" | "hidden"; isFeatured: boolean; sourceNote: string; reviewedAt: string; }
export type SupportStatus = "open" | "in_progress" | "closed";
export interface SupportRequest {
  id: string; quoteId: string; customerId: string; subject: string; message: string; status: SupportStatus;
  adminNote: string; assignedTo: string | null; createdAt: string; updatedAt: string;
}
export interface CustomerTimelineEvent { id: string; quoteId: string; type: string; title: string; createdAt: string; }
export interface AccountOrderDetail {
  quote: PersistedQuote;
  allocations: InventoryAllocation[];
  payment: ManualPayment | null;
  events: CustomerTimelineEvent[];
  attachments: OperationalAttachment[];
  renewals: RenewalRequest[];
  reviews: ProductReview[];
  supportRequests: SupportRequest[];
  renewalEligible: boolean;
  reviewEligibleItemIndexes: number[];
  effectiveEndDate: string;
}
export interface ProductReviewsResponse { reviews: PublicProductReview[]; summary: { rating: number; reviewCount: number }; }
export interface CustomerExperienceAdminQueue { renewals: RenewalRequest[]; reviews: ProductReview[]; supportRequests: SupportRequest[]; }
