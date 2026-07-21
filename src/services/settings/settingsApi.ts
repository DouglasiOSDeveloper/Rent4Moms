import type { DeliverySettings } from "../../domain/delivery/types";
import type { ShippingZone } from "../../domain/shared/types";
import { apiRequest } from "../api/apiClient";

export interface DeliverySettingsDocument {
  deliverySettings: DeliverySettings;
  shippingZones: ShippingZone[];
  updatedAt: string;
}

export async function loadRemoteDeliverySettings(): Promise<DeliverySettingsDocument> {
  const response = await apiRequest<{ settings: DeliverySettingsDocument }>("/settings/delivery");
  return response.settings;
}

export async function saveRemoteDeliverySettings(settings: DeliverySettingsDocument): Promise<DeliverySettingsDocument> {
  const response = await apiRequest<{ settings: DeliverySettingsDocument }>("/admin/settings/delivery", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
  return response.settings;
}
