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
  const response = await apiRequest<{ quote: QuoteSubmission }>("/quotes", {
    method: "POST",
    body: JSON.stringify(draft),
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
