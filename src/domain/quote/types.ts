import type { AssemblyAngle } from "../catalog/types";
import type { RentalPriceBreakdown, RentalRateTable } from "../pricing/types";
import type { Product } from "../shared/types";

export type FulfillmentMethod = "delivery" | "pickup" | "arrange";
export type ShippingQuoteStatus = "not_requested" | "calculated" | "unavailable";

export interface QuoteComponentSnapshot {
  id: string;
  code: string;
  name: string;
  description: string;
  priceAdjustment: RentalRateTable;
}

export interface QuoteAssemblySnapshot {
  chairModelId: string;
  chairModelVersion: string;
  chairModelName: string;
  variantId: string;
  prefix: string;
  cover: QuoteComponentSnapshot;
  reducer: QuoteComponentSnapshot | null;
  ballSet: {
    id: string;
    code: string;
    name: string;
    description: string;
  };
  selectedAngle: AssemblyAngle;
  selectedImage: string;
  availableQuantity: number;
}

export interface ProductSnapshot {
  id: string;
  name: string;
  brand: string;
  model: string;
  photo: string;
  description: string;
  rates: RentalRateTable;
  assembly?: QuoteAssemblySnapshot;
}

export interface QuoteItem {
  id: string;
  productId: string;
  productSnapshot: ProductSnapshot;
  quantity: number;
  periodDays: number;
  startDate: string;
  endDate: string;
  priceSnapshot: RentalPriceBreakdown;
}

export interface QuoteAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

export interface QuoteCustomerData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export interface QuoteAdditionalInfo {
  reason: string;
  notes: string;
  referralSource: string;
}

export interface QuoteConsents {
  terms: boolean;
  privacy: boolean;
  rentalConditions: boolean;
  marketing: boolean;
}

export interface QuoteShippingQuote {
  status: ShippingQuoteStatus;
  amountCents: number;
  cep: string;
}

export interface QuoteDraft {
  version: 1;
  items: QuoteItem[];
  fulfillment: FulfillmentMethod;
  address: QuoteAddress;
  deliverySlot: string;
  shippingQuote: QuoteShippingQuote;
  customerData: QuoteCustomerData;
  additionalInfo: QuoteAdditionalInfo;
  consents: QuoteConsents;
  updatedAt: string;
}

export interface AddProductToQuoteOptions {
  periodDays?: number;
  startDate?: string;
  quantity?: number;
  fulfillment?: FulfillmentMethod;
  deliverySlot?: string;
  cep?: string;
  shippingAmountCents?: number | null;
  rates?: RentalRateTable;
  description?: string;
  photo?: string;
  assembly?: QuoteAssemblySnapshot;
}


export interface QuoteSubmission {
  id: string;
  code: string;
  status: string;
  totalCents: number;
  holdExpiresAt: string | null;
  allocations: Array<{ componentRole: string; unitCode: string }>;
  createdAt: string;
  requiresAccountClaim?: boolean;
}

export interface QuoteStoreValue {
  draft: QuoteDraft;
  quoteItemIds: string[];
  addProduct: (product: Product, options?: AddProductToQuoteOptions) => void;
  removeItem: (productId: string) => void;
  updateAllItemsPeriod: (periodDays: number) => void;
  updateAllItemsStartDate: (startDate: string) => void;
  updateFulfillment: (fulfillment: FulfillmentMethod) => void;
  updateDeliverySlot: (deliverySlot: string) => void;
  updateAddress: (patch: Partial<QuoteAddress>) => void;
  updateShippingQuote: (amountCents: number | null, cep: string) => void;
  updateCustomerData: (patch: Partial<QuoteCustomerData>) => void;
  updateAdditionalInfo: (patch: Partial<QuoteAdditionalInfo>) => void;
  updateConsents: (patch: Partial<QuoteConsents>) => void;
  lastSubmission: QuoteSubmission | null;
  submitQuote: () => Promise<QuoteSubmission>;
  clearDraft: () => void;
}
