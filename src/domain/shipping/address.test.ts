import { describe, expect, it } from "vitest";
import { isCompleteShippingAddress, isDeliveryAddressSupported } from "./address";

describe("isCompleteShippingAddress", () => {
  it("requires a routable full address", () => {
    expect(isCompleteShippingAddress({
      cep: "71925-180",
      street: "Quadra 206",
      number: "",
      complement: "",
      district: "Sul",
      city: "Brasília",
      state: "DF",
    })).toBe(false);

    expect(isCompleteShippingAddress({
      cep: "71925-180",
      street: "Quadra 206",
      number: "9",
      complement: "",
      district: "Sul",
      city: "Brasília",
      state: "DF",
    })).toBe(true);
  });

  it("accepts only DF for delivery", () => {
    expect(isDeliveryAddressSupported({ state: "df" })).toBe(true);
    expect(isDeliveryAddressSupported({ state: "BA" })).toBe(false);
  });
});
