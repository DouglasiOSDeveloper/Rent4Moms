import type { DeliverySettings, DeliverySlot } from "./types";

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  startTime: "10:00",
  endTime: "18:00",
  slotMinutes: 30,
  timeZone: "America/Sao_Paulo",
};

function timeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesToTime(value: number): string {
  const normalized = ((value % 1_440) + 1_440) % 1_440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function isValidDeliveryTimeRange(settings: DeliverySettings): boolean {
  const start = timeToMinutes(settings.startTime);
  const end = timeToMinutes(settings.endTime);
  return start !== null && end !== null && end - start >= settings.slotMinutes;
}

export function generateDeliverySlots(settings: DeliverySettings): DeliverySlot[] {
  if (!isValidDeliveryTimeRange(settings)) return [];
  const start = timeToMinutes(settings.startTime)!;
  const end = timeToMinutes(settings.endTime)!;
  const slots: DeliverySlot[] = [];

  for (let cursor = start; cursor + settings.slotMinutes <= end; cursor += settings.slotMinutes) {
    const startTime = minutesToTime(cursor);
    const endTime = minutesToTime(cursor + settings.slotMinutes);
    slots.push({
      value: startTime,
      startTime,
      endTime,
      label: `${startTime}–${endTime}`,
    });
  }

  return slots;
}

export function formatDeliverySlotLabel(value: string, settings: DeliverySettings): string {
  return generateDeliverySlots(settings).find((slot) => slot.value === value)?.label ?? value;
}

export function isDeliverySlotAvailable(value: string, settings: DeliverySettings): boolean {
  return generateDeliverySlots(settings).some((slot) => slot.value === value);
}
