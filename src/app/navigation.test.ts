import { describe, expect, it } from "vitest";
import { pageFromPathname, pagePath } from "./navigation";

describe("administrative operation routes", () => {
  it("maps a real order detail URL to the admin order page", () => {
    expect(pagePath("admin-order", { quoteId: "quote-123" })).toBe("/admin/orcamentos/quote-123");
    expect(pageFromPathname("/admin/orcamentos/quote-123")).toBe("admin-order");
  });

  it("maps a customer order detail URL", () => {
    expect(pagePath("account-order", { quoteId: "quote-123" })).toBe("/minha-conta/pedidos/quote-123");
    expect(pageFromPathname("/minha-conta/pedidos/quote-123")).toBe("account-order");
  });

  it("maps the customer experience module", () => {
    expect(pagePath("admin-customer-experience")).toBe("/admin/experiencia-cliente");
    expect(pageFromPathname("/admin/experiencia-cliente")).toBe("admin-customer-experience");
  });

  it("maps the maintenance module", () => {
    expect(pagePath("admin-maintenance")).toBe("/admin/manutencao");
    expect(pageFromPathname("/admin/manutencao")).toBe("admin-maintenance");
  });
  it("maps the content CMS and legal pages", () => {
    expect(pagePath("admin-content")).toBe("/admin/conteudo");
    expect(pageFromPathname("/admin/conteudo")).toBe("admin-content");
    expect(pagePath("privacy-policy")).toBe("/politica-de-privacidade");
    expect(pageFromPathname("/politica-de-privacidade")).toBe("privacy-policy");
  });

  it("maps the operational help center", () => {
    expect(pagePath("admin-help")).toBe("/admin/ajuda");
    expect(pageFromPathname("/admin/ajuda")).toBe("admin-help");
  });

});
