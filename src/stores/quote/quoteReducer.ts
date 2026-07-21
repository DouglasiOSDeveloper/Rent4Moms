import type { Product } from "../../domain/shared/types";
import { createEmptyQuoteDraft, createQuoteItem, repriceQuoteItem } from "../../domain/quote/factories";
import type {
  AddProductToQuoteOptions,
  FulfillmentMethod,
  QuoteAddress,
  QuoteAdditionalInfo,
  QuoteConsents,
  QuoteCustomerData,
  QuoteDraft,
} from "../../domain/quote/types";

export type QuoteAction =
  | { type: "ADD_PRODUCT"; product: Product; options?: AddProductToQuoteOptions }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_ALL_PERIOD"; periodDays: number }
  | { type: "UPDATE_ALL_START_DATE"; startDate: string }
  | { type: "UPDATE_FULFILLMENT"; fulfillment: FulfillmentMethod }
  | { type: "UPDATE_DELIVERY_SLOT"; deliverySlot: string }
  | { type: "UPDATE_ADDRESS"; patch: Partial<QuoteAddress> }
  | { type: "UPDATE_SHIPPING_QUOTE"; amountCents: number | null; cep: string }
  | { type: "UPDATE_CUSTOMER"; patch: Partial<QuoteCustomerData> }
  | { type: "UPDATE_ADDITIONAL_INFO"; patch: Partial<QuoteAdditionalInfo> }
  | { type: "UPDATE_CONSENTS"; patch: Partial<QuoteConsents> }
  | { type: "CLEAR" };

function touch(draft: QuoteDraft): QuoteDraft {
  return { ...draft, updatedAt: new Date().toISOString() };
}

export function quoteReducer(state: QuoteDraft, action: QuoteAction): QuoteDraft {
  switch (action.type) {
    case "ADD_PRODUCT": {
      const nextItem = createQuoteItem(action.product, action.options);
      const existingIndex = state.items.findIndex((item) => item.productId === action.product.id);
      const items = existingIndex >= 0
        ? state.items.map((item, index) => index === existingIndex ? nextItem : item)
        : [...state.items, nextItem];
      const options = action.options;
      const fulfillment = options?.fulfillment ?? state.fulfillment;
      const cep = options?.cep ?? state.address.cep;
      const deliverySlot = options?.deliverySlot ?? state.deliverySlot;
      const hasShippingValue = options?.shippingAmountCents !== undefined;
      const shippingAmount = options?.shippingAmountCents;

      return touch({
        ...state,
        items,
        fulfillment,
        deliverySlot: fulfillment === "delivery" ? deliverySlot : "",
        address: { ...state.address, cep },
        shippingQuote: fulfillment !== "delivery"
          ? { status: "not_requested", amountCents: 0, cep }
          : hasShippingValue
            ? {
                status: shippingAmount === null ? "unavailable" : "calculated",
                amountCents: shippingAmount ?? 0,
                cep,
              }
            : state.shippingQuote,
      });
    }

    case "REMOVE_ITEM":
      return touch({ ...state, items: state.items.filter((item) => item.productId !== action.productId) });

    case "UPDATE_ALL_PERIOD":
      return touch({
        ...state,
        items: state.items.map((item) => repriceQuoteItem(item, { periodDays: action.periodDays })),
      });

    case "UPDATE_ALL_START_DATE":
      return touch({
        ...state,
        items: state.items.map((item) => repriceQuoteItem(item, { startDate: action.startDate })),
      });

    case "UPDATE_FULFILLMENT":
      return touch({
        ...state,
        fulfillment: action.fulfillment,
        shippingQuote: action.fulfillment === "delivery"
          ? state.shippingQuote
          : { status: "not_requested", amountCents: 0, cep: state.address.cep },
      });

    case "UPDATE_DELIVERY_SLOT":
      return touch({ ...state, deliverySlot: action.deliverySlot });

    case "UPDATE_ADDRESS": {
      const address = { ...state.address, ...action.patch };
      const cepChanged = action.patch.cep !== undefined && action.patch.cep !== state.address.cep;
      return touch({
        ...state,
        address,
        shippingQuote: cepChanged
          ? { status: "not_requested", amountCents: 0, cep: address.cep }
          : state.shippingQuote,
      });
    }

    case "UPDATE_SHIPPING_QUOTE":
      return touch({
        ...state,
        shippingQuote: state.fulfillment !== "delivery"
          ? { status: "not_requested", amountCents: 0, cep: action.cep }
          : {
              status: action.amountCents === null ? "unavailable" : "calculated",
              amountCents: action.amountCents ?? 0,
              cep: action.cep,
            },
      });

    case "UPDATE_CUSTOMER":
      return touch({ ...state, customerData: { ...state.customerData, ...action.patch } });

    case "UPDATE_ADDITIONAL_INFO":
      return touch({ ...state, additionalInfo: { ...state.additionalInfo, ...action.patch } });

    case "UPDATE_CONSENTS":
      return touch({ ...state, consents: { ...state.consents, ...action.patch } });

    case "CLEAR":
      return createEmptyQuoteDraft();

    default:
      return state;
  }
}
