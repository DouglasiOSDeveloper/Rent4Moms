export interface ShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

export interface ShippingSettings {
  enabled: boolean;
  originLabel: string;
  originAddress: ShippingAddress;
  fuelPriceCentsPerLiter: number;
  consumptionKmPerLiter: number;
  multiplier: number;
  minimumFeeCents: number;
  roundTrip: boolean;
  maxDistanceKm: number | null;
}

export interface ShippingEstimate {
  status: "calculated";
  amountCents: number;
  cep: string;
  provider: string;
  formulaVersion: "distance-fuel-v1";
  oneWayDistanceKm: number;
  chargedDistanceKm: number;
  durationSeconds: number | null;
  fuelLiters: number;
  parameters: {
    fuelPriceCentsPerLiter: number;
    consumptionKmPerLiter: number;
    multiplier: number;
    minimumFeeCents: number;
    roundTrip: boolean;
    maxDistanceKm: number | null;
  };
  calculatedAt: string;
}

export const EMPTY_SHIPPING_SETTINGS: ShippingSettings = {
  enabled: false,
  originLabel: "",
  originAddress: {
    cep: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  },
  fuelPriceCentsPerLiter: 0,
  consumptionKmPerLiter: 0,
  multiplier: 0,
  minimumFeeCents: 0,
  roundTrip: true,
  maxDistanceKm: null,
};
