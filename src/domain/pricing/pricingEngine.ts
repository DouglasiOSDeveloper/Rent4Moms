import {
  DEFAULT_PRODUCT_PERIOD_PRICING,
  type ProductPeriodPricing,
  type ProductPeriodPricingRule,
  type QuotePriceSummary,
  type RentalPriceBreakdown,
  type RentalPriceInput,
  type RentalRateTable,
} from "./types";

function toCents(value: number): number {
  return Math.round(Math.max(0, Number.isFinite(value) ? value : 0) * 100);
}

function normalizePositiveInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.trunc(value));
}

export function normalizeProductPeriodPricing(
  value: ProductPeriodPricing | null | undefined,
): ProductPeriodPricing {
  const normalizeRule = (rule: ProductPeriodPricingRule | undefined): ProductPeriodPricingRule => {
    const pricingMode = rule?.pricingMode === "fixed_price"
      || rule?.pricingMode === "percentage_discount"
      || rule?.pricingMode === "free"
      ? rule.pricingMode
      : "rate_composition";
    return {
      pricingMode,
      fixedPriceCents: pricingMode === "fixed_price" && Number.isFinite(rule?.fixedPriceCents)
        ? Math.max(0, Math.trunc(rule!.fixedPriceCents!))
        : null,
      discountPercent: pricingMode === "percentage_discount"
        ? Math.min(100, Math.max(0, Number.isFinite(rule?.discountPercent) ? rule!.discountPercent : 0))
        : 0,
      freeScope: rule?.freeScope === "full_configuration" ? "full_configuration" : "base_product",
    };
  };
  return {
    days60: normalizeRule(value?.days60 ?? DEFAULT_PRODUCT_PERIOD_PRICING.days60),
    days90: normalizeRule(value?.days90 ?? DEFAULT_PRODUCT_PERIOD_PRICING.days90),
  };
}

function blocksFor(days: number) {
  let remainingDays = days;
  const monthlyBlocks = Math.floor(remainingDays / 30);
  remainingDays %= 30;
  const weeklyBlocks = Math.floor(remainingDays / 7);
  const dailyBlocks = remainingDays % 7;
  return { monthlyBlocks, weeklyBlocks, dailyBlocks };
}

function rateTableUnitCents(rates: RentalRateTable, blocks: ReturnType<typeof blocksFor>): number {
  return (
    blocks.monthlyBlocks * toCents(rates.monthly) +
    blocks.weeklyBlocks * toCents(rates.weekly) +
    blocks.dailyBlocks * toCents(rates.daily)
  );
}

function addRates(rates: RentalRateTable[]): RentalRateTable {
  return rates.reduce<RentalRateTable>((sum, item) => ({
    daily: sum.daily + Math.max(0, item.daily),
    weekly: sum.weekly + Math.max(0, item.weekly),
    monthly: sum.monthly + Math.max(0, item.monthly),
  }), { daily: 0, weekly: 0, monthly: 0 });
}

function activeRule(policy: ProductPeriodPricing, days: number, mode: "rental" | "renewal") {
  if (mode === "renewal") return null;
  if (days === 60) return policy.days60;
  if (days === 90) return policy.days90;
  return null;
}

/**
 * Prévia única do frontend. O backend recalcula a mesma composição com os
 * valores persistidos e ignora qualquer tarifa enviada pelo navegador.
 */
export function calculateRentalPrice(input: RentalPriceInput): RentalPriceBreakdown {
  const days = normalizePositiveInteger(input.days, 1);
  const quantity = normalizePositiveInteger(input.quantity ?? 1, 1);
  const mode = input.mode ?? "rental";
  const baseRates = input.baseRates ?? input.rates ?? { daily: 0, weekly: 0, monthly: 0 };
  const coverRates = addRates(input.coverRates ?? []);
  const reducerRates = addRates(input.reducerRates ?? []);
  const otherComponentRates = addRates(input.componentRates ?? []);
  const blocks = blocksFor(days);
  const composedBaseUnitPriceCents = rateTableUnitCents(baseRates, blocks);
  const coverUnitPriceCents = rateTableUnitCents(coverRates, blocks);
  const reducerUnitPriceCents = rateTableUnitCents(reducerRates, blocks);
  const otherComponentsUnitPriceCents = rateTableUnitCents(otherComponentRates, blocks);
  const policy = normalizeProductPeriodPricing(input.periodPricing);
  const rule = activeRule(policy, days, mode);
  const appliedPeriodDays = rule && (days === 60 || days === 90) ? days : null;
  const baseUnitPriceCents = rule?.pricingMode === "fixed_price" && rule.fixedPriceCents !== null
    ? rule.fixedPriceCents
    : composedBaseUnitPriceCents;
  const baseSubtotalCents = baseUnitPriceCents * quantity;
  const coverSubtotalCents = coverUnitPriceCents * quantity;
  const reducerSubtotalCents = reducerUnitPriceCents * quantity;
  const otherComponentsSubtotalCents = otherComponentsUnitPriceCents * quantity;
  const componentsUnitPriceCents = coverUnitPriceCents + reducerUnitPriceCents + otherComponentsUnitPriceCents;
  const componentsSubtotalCents = coverSubtotalCents + reducerSubtotalCents + otherComponentsSubtotalCents;
  const discountEligibleSubtotalCents = baseSubtotalCents + coverSubtotalCents;
  const subtotalCents = baseSubtotalCents + componentsSubtotalCents;

  const legacyDiscountPercent = mode === "rental" && !rule
    ? Math.min(100, Math.max(0, input.discountPercent ?? 0))
    : 0;
  const discountPercent = rule?.pricingMode === "percentage_discount"
    ? rule.discountPercent
    : legacyDiscountPercent;
  const baseDiscountCents = Math.round(discountEligibleSubtotalCents * (discountPercent / 100));
  const freeBaseCents = rule?.pricingMode === "free" ? baseSubtotalCents : 0;
  const freeComponentsCents = rule?.pricingMode === "free" && rule.freeScope === "full_configuration"
    ? componentsSubtotalCents
    : 0;
  const reducerWaiverCents = mode === "rental"
    && (days === 60 || days === 90)
    && freeComponentsCents === 0
    ? reducerSubtotalCents
    : 0;
  const discountCents = baseDiscountCents + freeBaseCents + freeComponentsCents + reducerWaiverCents;
  const benefitType = rule?.pricingMode === "fixed_price"
    ? "fixed_price"
    : freeComponentsCents > 0
      ? "free_configuration"
      : freeBaseCents > 0
        ? "free_base"
        : baseDiscountCents > 0
          ? "discount"
          : "none";

  return {
    days,
    quantity,
    mode,
    ...blocks,
    baseUnitPriceCents,
    coverUnitPriceCents,
    reducerUnitPriceCents,
    otherComponentsUnitPriceCents,
    componentsUnitPriceCents,
    unitPriceCents: baseUnitPriceCents + componentsUnitPriceCents,
    baseSubtotalCents,
    coverSubtotalCents,
    reducerSubtotalCents,
    otherComponentsSubtotalCents,
    componentsSubtotalCents,
    discountEligibleSubtotalCents,
    subtotalCents,
    discountPercent,
    baseDiscountCents,
    reducerWaiverCents,
    freeBaseCents,
    freeComponentsCents,
    discountCents,
    totalCents: Math.max(0, subtotalCents - discountCents),
    appliedPeriodDays,
    benefitType,
    freeScope: rule?.pricingMode === "free" ? rule.freeScope : null,
  };
}

export function calculateQuotePriceSummary(
  itemPrices: Array<Pick<RentalPriceBreakdown, "subtotalCents" | "discountCents" | "totalCents">>,
  shippingCents = 0,
): QuotePriceSummary {
  const normalizedShipping = Math.max(0, Math.round(shippingCents));

  return itemPrices.reduce<QuotePriceSummary>((summary, item) => ({
    itemsSubtotalCents: summary.itemsSubtotalCents + item.subtotalCents,
    discountCents: summary.discountCents + item.discountCents,
    shippingCents: normalizedShipping,
    totalCents: summary.totalCents + item.totalCents,
  }), {
    itemsSubtotalCents: 0,
    discountCents: 0,
    shippingCents: normalizedShipping,
    totalCents: normalizedShipping,
  });
}
