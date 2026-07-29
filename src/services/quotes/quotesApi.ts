import type { QuoteDraft, QuoteSubmission } from "../../domain/quote/types";
import { apiRequest } from "../api/apiClient";


export interface PersistedQuote {
  id: string;
  code: string;
  customerId: string | null;
  customerEmail: string;
  customerCpfDigits: string;
  customerName: string;
  status: string;
  totalCents: number;
  holdExpiresAt: string | null;
  payload: QuoteDraft;
  createdAt: string;
  updatedAt: string;
}

export async function createRemoteQuote(draft: QuoteDraft): Promise<QuoteSubmission> {
  const payload = {
    version: draft.version,
    fulfillment: draft.fulfillment,
    address: draft.address,
    deliverySlot: draft.deliverySlot,
    customerData: draft.customerData,
    contractData: draft.contractData,
    additionalInfo: draft.additionalInfo,
    consents: draft.consents,
    updatedAt: draft.updatedAt,
    items: draft.items.map((item) => {
      const assembly = item.productSnapshot.assembly;
      return {
        productId: item.productId,
        quantity: item.quantity,
        periodDays: item.periodDays,
        startDate: item.startDate,
        ...(assembly ? {
          configuration: {
            chairModelId: assembly.chairModelId,
            variantId: assembly.variantId,
            coverId: assembly.cover.id,
            reducerId: assembly.reducer?.id ?? null,
            ballSetId: assembly.ballSet.id,
            selectedAngle: assembly.selectedAngle,
          },
        } : {}),
      };
    }),
  };
  const response = await apiRequest<{ quote: QuoteSubmission }>("/quotes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.quote;
}

export async function listAccountQuotes(): Promise<PersistedQuote[]> {
  const response = await apiRequest<{ quotes: PersistedQuote[] }>("/account/quotes");
  return response.quotes;
}

export async function listAdminQuotes(): Promise<PersistedQuote[]> {
  const response = await apiRequest<{ quotes: PersistedQuote[] }>("/admin/quotes");
  return response.quotes;
}
