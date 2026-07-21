export function contactDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function buildWhatsAppUrl(number: string, message = ""): string | null {
  const digits = contactDigits(number);
  if (digits.length < 10) return null;
  const query = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
  return `https://wa.me/${digits}${query}`;
}

export function replaceYearToken(value: string, year = new Date().getFullYear()): string {
  return value.replaceAll("{year}", String(year));
}

export function hasConfiguredValue(value: string): boolean {
  const normalized = value.trim();
  return normalized.length > 0 && !/^\[[^\]]+\]$/.test(normalized);
}
