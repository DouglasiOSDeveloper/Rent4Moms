import type { DeliverySettings } from "../../domain/delivery/types";
import type { ShippingSettings } from "../../domain/shipping/types";
import { apiRequest } from "../api/apiClient";

export interface RouteProviderStatus {
  name: string;
  configured: boolean;
}

export interface DeliverySettingsDocument {
  deliverySettings: DeliverySettings;
  shipping: ShippingSettings | null;
  updatedAt: string;
}

export interface DeliverySettingsResponse {
  settings: DeliverySettingsDocument | null;
  routeProvider?: RouteProviderStatus;
}

export async function loadRemoteDeliverySettings(includeAdministrativeShipping = false): Promise<DeliverySettingsResponse> {
  const endpoint = includeAdministrativeShipping ? "/admin/settings/delivery" : "/settings/delivery";
  return await apiRequest<DeliverySettingsResponse>(endpoint);
}

export async function saveRemoteDeliverySettings(settings: DeliverySettingsDocument): Promise<DeliverySettingsResponse> {
  return await apiRequest<DeliverySettingsResponse>("/admin/settings/delivery", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}
