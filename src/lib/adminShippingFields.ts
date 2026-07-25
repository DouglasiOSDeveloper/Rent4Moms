export interface ShippingNumericDraft {
  fuelPrice: string;
  consumption: string;
  multiplier: string;
  minimumFee: string;
  maxDistance: string;
}

export function formatAdminDecimal(value: number, minimumFractionDigits = 0, maximumFractionDigits = 2): string {
  return value > 0 ? value.toLocaleString("pt-BR", { minimumFractionDigits, maximumFractionDigits }) : "";
}

export function formatAdminMoney(cents: number): string {
  return cents > 0 ? (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
}

export function sanitizeAdminDecimalDraft(value: string, maximumFractionDigits = 2): string {
  const normalized = value.replace(/\./g, ",").replace(/[^\d,]/g, "");
  const [integerPart = "", ...decimalParts] = normalized.split(",");
  const decimals = decimalParts.join("").slice(0, maximumFractionDigits);
  return normalized.includes(",") ? `${integerPart || "0"},${decimals}` : integerPart;
}

export function parseAdminDecimal(value: string): number {
  const parsed = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function parseAdminMultiplier(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  if (!/[,.]/.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length >= 2) return Number(digits) / 10;
  }
  return parseAdminDecimal(trimmed);
}
