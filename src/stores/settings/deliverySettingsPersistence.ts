import { DEFAULT_DELIVERY_SETTINGS, isValidDeliveryTimeRange } from "../../domain/delivery/slots";
import type { DeliverySettings } from "../../domain/delivery/types";

export const DELIVERY_SETTINGS_STORAGE_KEY = "rent4moms.delivery-settings.v1";

function browserStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

function isDeliverySettings(value: unknown): value is DeliverySettings {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DeliverySettings>;
  return typeof candidate.startTime === "string"
    && typeof candidate.endTime === "string"
    && candidate.slotMinutes === 30
    && typeof candidate.timeZone === "string"
    && isValidDeliveryTimeRange(candidate as DeliverySettings);
}

export function loadDeliverySettings(storage: Pick<Storage, "getItem"> | null = browserStorage()): DeliverySettings {
  if (!storage) return DEFAULT_DELIVERY_SETTINGS;
  try {
    const serialized = storage.getItem(DELIVERY_SETTINGS_STORAGE_KEY);
    if (!serialized) return DEFAULT_DELIVERY_SETTINGS;
    const parsed: unknown = JSON.parse(serialized);
    return isDeliverySettings(parsed) ? parsed : DEFAULT_DELIVERY_SETTINGS;
  } catch {
    return DEFAULT_DELIVERY_SETTINGS;
  }
}

export function saveDeliverySettings(
  settings: DeliverySettings,
  storage: Pick<Storage, "setItem"> | null = browserStorage(),
): void {
  if (!storage) return;
  storage.setItem(DELIVERY_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
