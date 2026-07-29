import { createEmptyQuoteDraft } from "../../domain/quote/factories";
import type { QuoteDraft } from "../../domain/quote/types";

export const QUOTE_STORAGE_KEY = "rent4moms.quote-draft.v1";

function isQuoteDraft(value: unknown): value is QuoteDraft {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<QuoteDraft>;
  return candidate.version === 1 && Array.isArray(candidate.items);
}

function migrateQuoteDraft(draft: QuoteDraft): QuoteDraft {
  const empty = createEmptyQuoteDraft();
  return {
    ...empty,
    ...draft,
    address: { ...empty.address, ...draft.address },
    shippingQuote: { ...empty.shippingQuote, ...draft.shippingQuote },
    customerData: { ...empty.customerData, ...draft.customerData },
    contractData: { ...empty.contractData, ...(draft.contractData ?? {}) },
    additionalInfo: { ...empty.additionalInfo, ...draft.additionalInfo },
    consents: { ...empty.consents, ...draft.consents },
  };
}

export function loadQuoteDraft(storage: Pick<Storage, "getItem"> | null = getBrowserStorage()): QuoteDraft {
  if (!storage) return createEmptyQuoteDraft();

  try {
    const serialized = storage.getItem(QUOTE_STORAGE_KEY);
    if (!serialized) return createEmptyQuoteDraft();
    const parsed: unknown = JSON.parse(serialized);
    return isQuoteDraft(parsed) ? migrateQuoteDraft(parsed) : createEmptyQuoteDraft();
  } catch {
    return createEmptyQuoteDraft();
  }
}

export function saveQuoteDraft(
  draft: QuoteDraft,
  storage: Pick<Storage, "setItem"> | null = getBrowserStorage(),
): void {
  if (!storage) return;
  storage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(draft));
}

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}
