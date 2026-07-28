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
import type { ShippingEstimate } from "../../domain/shipping/types";

export type QuoteAction =
  | { type: "ADD_PRODUCT"; product: Product; options?: AddProductToQuoteOptions }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_ALL_PERIOD"; periodDays: number }
  | { type: "UPDATE_ALL_START_DATE"; startDate: string }
  | { type: "UPDATE_FULFILLMENT"; fulfillment: FulfillmentMethod }
  | { type: "UPDATE_DELIVERY_SLOT"; deliverySlot: string }
  | { type: "UPDATE_ADDRESS"; patch: Partial<QuoteAddress> }
  | { type: "UPDATE_SHIPPING_QUOTE"; estimate: ShippingEstimate | null; cep: string }
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
      const optionAddress = options?.address;
      const cep = optionAddress?.cep ?? options?.cep ?? state.address.cep;
      const deliverySlot = options?.deliverySlot ?? state.deliverySlot;
      const hasShippingEstimate = options?.shippingEstimate !== undefined;
      const shippingEstimate = options?.shippingEstimate;

      const cepChanged = cep !== state.address.cep;
      const address = optionAddress
        ? { ...optionAddress, cep }
        : cepChanged
          ? { cep, street: "", number: "", complement: "", district: "", city: "", state: "" }
          : { ...state.address, cep };

      return touch({
        ...state,
        items,
        fulfillment,
        deliverySlot: fulfillment === "delivery" ? deliverySlot : "",
        address,
        shippingQuote: fulfillment !== "delivery"
          ? { status: "not_requested", amountCents: 0, cep }
          : hasShippingEstimate
            ? shippingEstimate
              ? { ...shippingEstimate, cep }
              : { status: "unavailable", amountCents: 0, cep }
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
      const routeFields: Array<keyof QuoteAddress> = ["cep", "street", "number", "district", "city", "state"];
      const routeChanged = routeFields.some((field) => (
        action.patch[field] !== undefined && action.patch[field] !== state.address[field]
      ));
      return touch({
        ...state,
        address,
        shippingQuote: routeChanged
          ? { status: "not_requested", amountCents: 0, cep: address.cep }
          : state.shippingQuote,
      });
    }

    case "UPDATE_SHIPPING_QUOTE":
      return touch({
        ...state,
        shippingQuote: state.fulfillment !== "delivery"
          ? { status: "not_requested", amountCents: 0, cep: action.cep }
          : action.estimate
            ? { ...action.estimate, cep: action.cep }
            : { status: "unavailable", amountCents: 0, cep: action.cep },
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
