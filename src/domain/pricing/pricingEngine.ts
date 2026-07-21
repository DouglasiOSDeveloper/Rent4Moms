import type {
  QuotePriceSummary,
  RentalPriceBreakdown,
  RentalPriceInput,
} from "./types";

function toCents(value: number): number {
  return Math.round(value * 100);
}

function normalizePositiveInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.trunc(value));
}

/**
 * Central frontend pricing rule used by product, quote and review screens.
 * The backend will revalidate the same input before a persistent order exists.
 */
export function calculateRentalPrice(input: RentalPriceInput): RentalPriceBreakdown {
  const days = normalizePositiveInteger(input.days, 1);
  const quantity = normalizePositiveInteger(input.quantity ?? 1, 1);
  const mode = input.mode ?? "rental";

  let remainingDays = days;
  const monthlyBlocks = Math.floor(remainingDays / 30);
  remainingDays %= 30;
  const weeklyBlocks = Math.floor(remainingDays / 7);
  const dailyBlocks = remainingDays % 7;

  const unitPriceCents =
    monthlyBlocks * toCents(input.rates.monthly) +
    weeklyBlocks * toCents(input.rates.weekly) +
    dailyBlocks * toCents(input.rates.daily);

  const subtotalCents = unitPriceCents * quantity;
  const eligibleDiscount = mode === "rental"
    ? Math.min(100, Math.max(0, input.discountPercent ?? 0))
    : 0;
  const discountCents = Math.round(subtotalCents * (eligibleDiscount / 100));

  return {
    days,
    quantity,
    mode,
    monthlyBlocks,
    weeklyBlocks,
    dailyBlocks,
    unitPriceCents,
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
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
