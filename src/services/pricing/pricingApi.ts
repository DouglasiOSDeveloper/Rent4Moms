import type { ProductPeriodPricing, RentalPriceBreakdown } from "../../domain/pricing/types";
import { apiRequest } from "../api/apiClient";

export interface PricingAssemblySelection {
  chairModelId: string;
  variantId?: string;
  coverId: string;
  reducerId: string | null;
  ballSetId: string;
}

export interface PricingEstimateRequest {
  productId: string;
  periodDays: number;
  quantity: number;
  mode?: "rental" | "renewal";
  configuration?: PricingAssemblySelection;
}

export interface PricingEstimateResponse {
  pricing: RentalPriceBreakdown;
  composition: PricingAssemblySelection | null;
  policy: ProductPeriodPricing;
}

export async function estimateRemotePricing(input: PricingEstimateRequest): Promise<PricingEstimateResponse> {
  return apiRequest<PricingEstimateResponse>("/pricing/estimate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
