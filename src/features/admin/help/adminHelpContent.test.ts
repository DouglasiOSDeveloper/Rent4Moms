import { describe, expect, it } from "vitest";
import type { Page } from "../../../domain/shared/types";
import { ADMIN_MODULES, MEDIA_LOCATIONS, QUOTE_LIFECYCLE, RUNBOOKS, STATUS_GROUPS, getAdminHelpTopic } from "./adminHelpContent";

describe("operational help content", () => {
  it("documents every administrative route exposed by the sidebar", () => {
    const expected: Page[] = [
      "admin", "admin-products", "admin-configurator", "admin-categories", "admin-quotes", "admin-reservations",
      "admin-inventory", "admin-clients", "admin-calendar", "admin-delivery", "admin-hygiene", "admin-maintenance",
      "admin-customer-experience", "admin-reports", "admin-users", "admin-content", "admin-config", "admin-help",
    ];
    expect(new Set(ADMIN_MODULES.map((item) => item.page))).toEqual(new Set(expected));
    for (const page of expected) expect(getAdminHelpTopic(page).purpose.length).toBeGreaterThan(20);
  });

  it("points every supported media owner to a concrete administrative location", () => {
    expect(MEDIA_LOCATIONS.map((item) => item.owner)).toEqual(expect.arrayContaining(["Produto", "Modelo de cadeira", "Pano", "Redutor", "Bolinhas", "Variante / angulação"]));
    expect(MEDIA_LOCATIONS.every((item) => item.location.startsWith("Admin >"))).toBe(true);
    expect(MEDIA_LOCATIONS.find((item) => item.owner === "Variante / angulação")?.rules.join(" ")).toContain("SUP não é obrigatório");
  });

  it("documents lifecycle and unit effects without trusting the browser", () => {
    expect(QUOTE_LIFECYCLE.find((item) => item.action === "Registrar entrega")?.to).toBe("Em locação");
    expect(QUOTE_LIFECYCLE.find((item) => item.action === "Registrar devolução")?.effect).toContain("inspection");
    const hygiene = STATUS_GROUPS.find((group) => group.id === "higiene");
    expect(hygiene?.statuses.find((item) => item.code === "approved")?.effect).toContain("available");
    const maintenance = STATUS_GROUPS.find((group) => group.id === "manutencao");
    expect(maintenance?.statuses.find((item) => item.code === "unrepairable")?.effect).toContain("unavailable");
  });

  it("contains runbooks for the complete commercial and operational cycle", () => {
    expect(RUNBOOKS.map((item) => item.id)).toEqual(expect.arrayContaining(["publicar-produto", "processar-pedido", "higienizar", "manutencao", "api-offline", "frete"]));
  });
});
