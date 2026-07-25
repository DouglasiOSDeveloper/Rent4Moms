import type { ShippingAddress, ShippingEstimate } from "../../domain/shipping/types";
import { apiRequest } from "../api/apiClient";

export async function estimateRemoteShipping(address: ShippingAddress): Promise<ShippingEstimate> {
  const response = await apiRequest<{ shippingQuote: ShippingEstimate }>("/shipping/estimate", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
  return response.shippingQuote;
}
