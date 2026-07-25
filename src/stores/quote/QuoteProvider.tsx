import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { Product } from "../../domain/shared/types";
import type {
  AddProductToQuoteOptions,
  FulfillmentMethod,
  QuoteAddress,
  QuoteAdditionalInfo,
  QuoteConsents,
  QuoteCustomerData,
  QuoteStoreValue,
  QuoteSubmission,
} from "../../domain/quote/types";
import type { ShippingEstimate } from "../../domain/shipping/types";
import { createRemoteQuote } from "../../services/quotes/quotesApi";
import { useCatalog } from "../catalog/CatalogProvider";
import { loadQuoteDraft, saveQuoteDraft } from "./persistence";
import { quoteReducer } from "./quoteReducer";

const QuoteContext = createContext<QuoteStoreValue | null>(null);
const LAST_SUBMISSION_KEY = "rent4moms.quote.last-submission.v1";

function loadLastSubmission(): QuoteSubmission | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(LAST_SUBMISSION_KEY);
    return value ? JSON.parse(value) as QuoteSubmission : null;
  } catch {
    return null;
  }
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const { refreshCatalog } = useCatalog();
  const [draft, dispatch] = useReducer(quoteReducer, undefined, () => loadQuoteDraft());
  const [lastSubmission, setLastSubmission] = useState<QuoteSubmission | null>(() => loadLastSubmission());

  useEffect(() => {
    saveQuoteDraft(draft);
  }, [draft]);

  const addProduct = useCallback((product: Product, options?: AddProductToQuoteOptions) => {
    dispatch({ type: "ADD_PRODUCT", product, options });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "REMOVE_ITEM", productId });
  }, []);

  const updateAllItemsPeriod = useCallback((periodDays: number) => {
    dispatch({ type: "UPDATE_ALL_PERIOD", periodDays });
  }, []);

  const updateAllItemsStartDate = useCallback((startDate: string) => {
    dispatch({ type: "UPDATE_ALL_START_DATE", startDate });
  }, []);

  const updateFulfillment = useCallback((fulfillment: FulfillmentMethod) => {
    dispatch({ type: "UPDATE_FULFILLMENT", fulfillment });
  }, []);

  const updateDeliverySlot = useCallback((deliverySlot: string) => {
    dispatch({ type: "UPDATE_DELIVERY_SLOT", deliverySlot });
  }, []);

  const updateAddress = useCallback((patch: Partial<QuoteAddress>) => {
    dispatch({ type: "UPDATE_ADDRESS", patch });
  }, []);

  const updateShippingQuote = useCallback((estimate: ShippingEstimate | null, cep: string) => {
    dispatch({ type: "UPDATE_SHIPPING_QUOTE", estimate, cep });
  }, []);

  const updateCustomerData = useCallback((patch: Partial<QuoteCustomerData>) => {
    dispatch({ type: "UPDATE_CUSTOMER", patch });
  }, []);

  const updateAdditionalInfo = useCallback((patch: Partial<QuoteAdditionalInfo>) => {
    dispatch({ type: "UPDATE_ADDITIONAL_INFO", patch });
  }, []);

  const updateConsents = useCallback((patch: Partial<QuoteConsents>) => {
    dispatch({ type: "UPDATE_CONSENTS", patch });
  }, []);

  const submitQuote = useCallback(async (): Promise<QuoteSubmission> => {
    const submission = await createRemoteQuote(draft);
    await refreshCatalog();
    setLastSubmission(submission);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(LAST_SUBMISSION_KEY, JSON.stringify(submission));
    }
    dispatch({ type: "CLEAR" });
    return submission;
  }, [draft, refreshCatalog]);

  const clearDraft = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo<QuoteStoreValue>(() => ({
    draft,
    quoteItemIds: draft.items.map((item) => item.productId),
    addProduct,
    removeItem,
    updateAllItemsPeriod,
    updateAllItemsStartDate,
    updateFulfillment,
    updateDeliverySlot,
    updateAddress,
    updateShippingQuote,
    updateCustomerData,
    updateAdditionalInfo,
    updateConsents,
    lastSubmission,
    submitQuote,
    clearDraft,
  }), [
    draft,
    addProduct,
    removeItem,
    updateAllItemsPeriod,
    updateAllItemsStartDate,
    updateFulfillment,
    updateDeliverySlot,
    updateAddress,
    updateShippingQuote,
    updateCustomerData,
    updateAdditionalInfo,
    updateConsents,
    lastSubmission,
    submitQuote,
    clearDraft,
  ]);

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote(): QuoteStoreValue {
  const value = useContext(QuoteContext);
  if (!value) throw new Error("useQuote must be used within QuoteProvider");
  return value;
}
