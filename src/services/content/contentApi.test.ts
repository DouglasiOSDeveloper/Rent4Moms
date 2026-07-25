import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadAdminContent, loadPublicLegalPage, loadPublicSiteContent, publishAdminLegalPage, saveAdminSiteSettings } from "./contentApi";
import { DEFAULT_INTEGRATION_SETTINGS, DEFAULT_SITE_SETTINGS } from "../../test/fixtures/contentFixture";

describe("content API", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("loads public site settings and legal content", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/content/legal/")) {
        return new Response(JSON.stringify({ page: { slug: "termos-de-uso", title: "Termos", summary: "", content: "# Termos", version: 2, publishedAt: new Date().toISOString() } }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({ siteSettings: DEFAULT_SITE_SETTINGS, legalPages: [] }), { status: 200, headers: { "content-type": "application/json" } });
    });

    expect((await loadPublicSiteContent()).siteSettings?.brand.name).toBe("Rent4Moms");
    expect((await loadPublicLegalPage("termos-de-uso")).version).toBe(2);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/content/site"), expect.objectContaining({ credentials: "include" }));
  });

  it("uses protected admin endpoints for publishing and institutional settings", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith("/admin/content")) {
        return new Response(JSON.stringify({ siteSettings: DEFAULT_SITE_SETTINGS, legalPages: [], integrations: DEFAULT_INTEGRATION_SETTINGS }), { status: 200, headers: { "content-type": "application/json" } });
      }
      if (url.includes("/publish")) {
        return new Response(JSON.stringify({ page: { slug: "termos-de-uso", publishedVersion: 2, versions: [] } }), { status: 200, headers: { "content-type": "application/json" } });
      }
      expect(init?.method).toBe("PUT");
      return new Response(JSON.stringify({ siteSettings: DEFAULT_SITE_SETTINGS }), { status: 200, headers: { "content-type": "application/json" } });
    });

    expect((await loadAdminContent()).integrations?.payments.mode).toBe("manual");
    await saveAdminSiteSettings(DEFAULT_SITE_SETTINGS);
    expect((await publishAdminLegalPage("termos-de-uso")).publishedVersion).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
