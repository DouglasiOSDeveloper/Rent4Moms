export function addDays(dateStr: string, days: number): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return "";

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatDateBR(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
}

export function getIsoDateInTimeZone(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getTomorrowIsoDate(timeZone = "America/Sao_Paulo", now = new Date()): string {
  return addDays(getIsoDateInTimeZone(timeZone, now), 1);
}

export function isIsoDateOnOrAfter(date: string, minimumDate: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= minimumDate;
}
