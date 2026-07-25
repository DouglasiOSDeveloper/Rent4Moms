export type PricingMode = "rental" | "renewal";
export type PricingRuleMode = "rate_composition" | "fixed_price" | "percentage_discount" | "free";
export type PricingFreeScope = "base_product" | "full_configuration";
export type PricingBenefitType = "none" | "fixed_price" | "discount" | "free_base" | "free_configuration";

export interface RentalRateTable {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface ProductPeriodPricingRule {
  pricingMode: PricingRuleMode;
  fixedPriceCents: number | null;
  discountPercent: number;
  freeScope: PricingFreeScope;
}

export interface ProductPeriodPricing {
  days60: ProductPeriodPricingRule;
  days90: ProductPeriodPricingRule;
}

export const DEFAULT_PRODUCT_PERIOD_PRICING: ProductPeriodPricing = {
  days60: { pricingMode: "rate_composition", fixedPriceCents: null, discountPercent: 0, freeScope: "base_product" },
  days90: { pricingMode: "rate_composition", fixedPriceCents: null, discountPercent: 0, freeScope: "base_product" },
};

export interface RentalPriceInput {
  rates?: RentalRateTable;
  baseRates?: RentalRateTable;
  componentRates?: RentalRateTable[];
  coverRates?: RentalRateTable[];
  reducerRates?: RentalRateTable[];
  periodPricing?: ProductPeriodPricing | null;
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
  baseUnitPriceCents: number;
  coverUnitPriceCents: number;
  reducerUnitPriceCents: number;
  otherComponentsUnitPriceCents: number;
  componentsUnitPriceCents: number;
  unitPriceCents: number;
  baseSubtotalCents: number;
  coverSubtotalCents: number;
  reducerSubtotalCents: number;
  otherComponentsSubtotalCents: number;
  componentsSubtotalCents: number;
  discountEligibleSubtotalCents: number;
  subtotalCents: number;
  discountPercent: number;
  baseDiscountCents: number;
  reducerWaiverCents: number;
  freeBaseCents: number;
  freeComponentsCents: number;
  discountCents: number;
  totalCents: number;
  appliedPeriodDays: 60 | 90 | null;
  benefitType: PricingBenefitType;
  freeScope: PricingFreeScope | null;
}

export interface QuotePriceSummary {
  itemsSubtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
}
