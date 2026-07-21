import type { Product } from "../shared/types";
import { calculateRentalPrice } from "../pricing/pricingEngine";
import { addDays } from "../../lib/dates";
import type {
  AddProductToQuoteOptions,
  ProductSnapshot,
  QuoteDraft,
  QuoteItem,
} from "./types";

export function createEmptyQuoteDraft(): QuoteDraft {
  return {
    version: 1,
    items: [],
    fulfillment: "delivery",
    address: {
      cep: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
    },
    deliverySlot: "",
    shippingQuote: {
      status: "not_requested",
      amountCents: 0,
      cep: "",
    },
    customerData: {
      name: "",
      cpf: "",
      email: "",
      phone: "",
      whatsapp: "",
    },
    additionalInfo: {
      reason: "",
      notes: "",
      referralSource: "",
    },
    consents: {
      terms: false,
      privacy: false,
      rentalConditions: false,
      marketing: false,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function createProductSnapshot(
  product: Product,
  options: Pick<AddProductToQuoteOptions, "rates" | "description" | "photo" | "assembly"> = {},
): ProductSnapshot {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    model: product.model,
    photo: options.photo ?? product.photo,
    description: options.description ?? product.description,
    rates: options.rates ?? {
      daily: product.priceDaily,
      weekly: product.priceWeekly,
      monthly: product.priceMonthly,
    },
    assembly: options.assembly,
  };
}

export function createQuoteItem(product: Product, options: AddProductToQuoteOptions = {}): QuoteItem {
  const periodDays = Math.max(1, Math.trunc(options.periodDays ?? product.minDays));
  const quantity = Math.max(1, Math.trunc(options.quantity ?? 1));
  const startDate = options.startDate ?? "";
  const productSnapshot = createProductSnapshot(product, options);

  return {
    id: product.id,
    productId: product.id,
    productSnapshot,
    quantity,
    periodDays,
    startDate,
    endDate: startDate ? addDays(startDate, periodDays) : "",
    priceSnapshot: calculateRentalPrice({
      rates: productSnapshot.rates,
      days: periodDays,
      quantity,
    }),
  };
}

export function repriceQuoteItem(
  item: QuoteItem,
  patch: Partial<Pick<QuoteItem, "periodDays" | "startDate" | "quantity">>,
): QuoteItem {
  const periodDays = Math.max(1, Math.trunc(patch.periodDays ?? item.periodDays));
  const quantity = Math.max(1, Math.trunc(patch.quantity ?? item.quantity));
  const startDate = patch.startDate ?? item.startDate;

  return {
    ...item,
    periodDays,
    quantity,
    startDate,
    endDate: startDate ? addDays(startDate, periodDays) : "",
    priceSnapshot: calculateRentalPrice({
      rates: item.productSnapshot.rates,
      days: periodDays,
      quantity,
    }),
  };
}
