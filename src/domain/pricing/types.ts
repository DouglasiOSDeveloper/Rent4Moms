export type PricingMode = "rental" | "renewal";

export interface RentalRateTable {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface RentalPriceInput {
  rates: RentalRateTable;
  days: number;
  quantity?: number;
  mode?: PricingMode;
  discountPercent?: number;
}

export interface RentalPriceBreakdown {
  days: number;
  quantity: number;
  mode: PricingMode;
  monthlyBlocks: number;
  weeklyBlocks: number;
  dailyBlocks: number;
  unitPriceCents: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
}

export interface QuotePriceSummary {
  itemsSubtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
}
