import type {
  AccountOrderDetail, CustomerExperienceAdminQueue, ProductReview, ProductReviewsResponse,
  RenewalRequest, ReviewStatus, SupportRequest, SupportStatus,
} from "../../domain/customerExperience/types";
import { apiRequest, resolveApiResourceUrl } from "../api/apiClient";

function normalizeDetail(detail: AccountOrderDetail): AccountOrderDetail {
  return {
    ...detail,
    quote: {
      ...detail.quote,
      payload: {
        ...detail.quote.payload,
        items: detail.quote.payload.items.map((item) => ({
          ...item,
          productSnapshot: {
            ...item.productSnapshot,
            photo: resolveApiResourceUrl(item.productSnapshot.photo),
            ...(item.productSnapshot.assembly
              ? {
                  assembly: {
                    ...item.productSnapshot.assembly,
                    selectedImage: resolveApiResourceUrl(item.productSnapshot.assembly.selectedImage),
                  },
                }
              : {}),
          },
        })),
      },
    },
    attachments: detail.attachments.map((item) => ({
      ...item,
      contentUrl: resolveApiResourceUrl(item.contentUrl),
    })),
  };
}
export async function loadAccountOrder(quoteId: string): Promise<AccountOrderDetail> {
  return normalizeDetail(await apiRequest<AccountOrderDetail>(`/account/orders/${quoteId}`));
}
export async function requestRenewal(quoteId: string, input: { requestedEndDate: string; note?: string }): Promise<RenewalRequest> {
  return (await apiRequest<{ renewal: RenewalRequest }>(`/account/rentals/${quoteId}/renewals`, { method: "POST", body: JSON.stringify({ requestedEndDate: input.requestedEndDate, note: input.note ?? "" }) })).renewal;
}
export async function submitProductReview(quoteId: string, input: { quoteItemIndex: number; rating: number; comment: string }): Promise<ProductReview> {
  return (await apiRequest<{ review: ProductReview }>(`/account/rentals/${quoteId}/reviews`, { method: "POST", body: JSON.stringify(input) })).review;
}
export async function createSupportRequest(quoteId: string, input: { subject: string; message: string }): Promise<SupportRequest> {
  return (await apiRequest<{ supportRequest: SupportRequest }>(`/account/orders/${quoteId}/support`, { method: "POST", body: JSON.stringify(input) })).supportRequest;
}
export async function listPublishedProductReviews(productId: string): Promise<ProductReviewsResponse> {
  const response = await apiRequest<Partial<ProductReviewsResponse>>(`/products/${productId}/reviews`);
  const summary = response.summary;

  return {
    reviews: Array.isArray(response.reviews) ? response.reviews : [],
    summary: {
      rating: typeof summary?.rating === "number" && Number.isFinite(summary.rating) ? summary.rating : 0,
      reviewCount: typeof summary?.reviewCount === "number" && Number.isFinite(summary.reviewCount)
        ? Math.max(0, Math.trunc(summary.reviewCount))
        : 0,
    },
  };
}
export async function loadCustomerExperienceAdminQueue(): Promise<CustomerExperienceAdminQueue> {
  return await apiRequest<CustomerExperienceAdminQueue>("/admin/customer-experience");
}
export async function decideRenewal(id: string, status: "approved" | "rejected" | "cancelled", adminNote = ""): Promise<RenewalRequest> {
  return (await apiRequest<{ renewal: RenewalRequest }>(`/admin/customer-experience/renewals/${id}`, { method: "PATCH", body: JSON.stringify({ status, adminNote }) })).renewal;
}
export async function moderateReview(id: string, status: ReviewStatus): Promise<ProductReview> {
  return (await apiRequest<{ review: ProductReview }>(`/admin/customer-experience/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })).review;
}
export async function updateSupportRequest(id: string, status: SupportStatus, adminNote = ""): Promise<SupportRequest> {
  return (await apiRequest<{ supportRequest: SupportRequest }>(`/admin/customer-experience/support/${id}`, { method: "PATCH", body: JSON.stringify({ status, adminNote }) })).supportRequest;
}
