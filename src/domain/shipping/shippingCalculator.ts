import type { ShippingZone } from "../shared/types";

export function calculateShippingByCep(cep: string, zones: ShippingZone[]): number | null {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length < 5) return null;

  const prefix = cleanCep.slice(0, 2);
  const zone = zones.find((candidate) => candidate.cepPrefix
    .split(",")
    .map((value) => value.trim())
    .includes(prefix));

  return zone?.rate ?? null;
}
