import { DEFAULT_DELIVERY_SETTINGS, formatDeliverySlotLabel, generateDeliverySlots, isValidDeliveryTimeRange } from "./slots";

describe("delivery slots", () => {
  it("generates 30-minute windows inside the configured range", () => {
    const slots = generateDeliverySlots({ ...DEFAULT_DELIVERY_SETTINGS, startTime: "10:00", endTime: "12:00" });
    expect(slots.map((slot) => slot.label)).toEqual([
      "10:00–10:30",
      "10:30–11:00",
      "11:00–11:30",
      "11:30–12:00",
    ]);
    expect(formatDeliverySlotLabel("11:00", { ...DEFAULT_DELIVERY_SETTINGS, startTime: "10:00", endTime: "12:00" })).toBe("11:00–11:30");
  });

  it("rejects ranges shorter than one slot", () => {
    const settings = { ...DEFAULT_DELIVERY_SETTINGS, startTime: "10:00", endTime: "10:15" };
    expect(isValidDeliveryTimeRange(settings)).toBe(false);
    expect(generateDeliverySlots(settings)).toEqual([]);
  });
});
