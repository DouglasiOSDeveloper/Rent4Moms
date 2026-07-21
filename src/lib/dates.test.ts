import { getIsoDateInTimeZone, getTomorrowIsoDate, isIsoDateOnOrAfter } from "./dates";

describe("operational dates", () => {
  const now = new Date("2026-07-20T02:00:00.000Z");

  it("calculates today and tomorrow in the configured timezone", () => {
    expect(getIsoDateInTimeZone("America/Sao_Paulo", now)).toBe("2026-07-19");
    expect(getTomorrowIsoDate("America/Sao_Paulo", now)).toBe("2026-07-20");
  });

  it("rejects dates before the minimum", () => {
    expect(isIsoDateOnOrAfter("2026-07-20", "2026-07-21")).toBe(false);
    expect(isIsoDateOnOrAfter("2026-07-21", "2026-07-21")).toBe(true);
  });
});
