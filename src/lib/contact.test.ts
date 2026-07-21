import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, hasConfiguredValue, replaceYearToken } from "./contact";

describe("contact helpers", () => {
  it("builds a WhatsApp link only for a configured phone", () => {
    expect(buildWhatsAppUrl("(11) 99999-0000", "Olá")).toBe("https://wa.me/11999990000?text=Ol%C3%A1");
    expect(buildWhatsAppUrl("[NUMERO]", "Olá")).toBeNull();
  });

  it("replaces the current-year token and detects placeholders", () => {
    expect(replaceYearToken("© {year}", 2030)).toBe("© 2030");
    expect(hasConfiguredValue("[EMAIL]")).toBe(false);
    expect(hasConfiguredValue("contato@rent4moms.com")).toBe(true);
  });
});
