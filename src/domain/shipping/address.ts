import type { ShippingAddress } from "./types";

export function isCompleteShippingAddress(address: ShippingAddress): boolean {
  const cep = address.cep.replace(/\D/g, "");
  return (
    cep.length === 8
    && address.street.trim().length > 0
    && address.number.trim().length > 0
    && address.city.trim().length > 0
    && /^[A-Za-z]{2}$/.test(address.state.trim())
  );
}
