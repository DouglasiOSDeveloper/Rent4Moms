import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_PUBLIC_LEGAL_PAGES, DEFAULT_SITE_SETTINGS } from "../../data/mocks/siteContent";
import type { PublicLegalPage, SiteSettingsDocument } from "../../domain/content/types";
import { loadPublicSiteContent } from "../../services/content/contentApi";

interface SiteContentContextValue {
  siteSettings: SiteSettingsDocument;
  legalPages: PublicLegalPage[];
  status: "loading" | "ready" | "fallback";
  refreshSiteContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [siteSettings, setSiteSettings] = useState<SiteSettingsDocument>(DEFAULT_SITE_SETTINGS);
  const [legalPages, setLegalPages] = useState<PublicLegalPage[]>(DEFAULT_PUBLIC_LEGAL_PAGES);
  const [status, setStatus] = useState<SiteContentContextValue["status"]>("loading");

  const refreshSiteContent = useCallback(async () => {
    try {
      const content = await loadPublicSiteContent();
      setSiteSettings(content.siteSettings);
      setLegalPages(content.legalPages);
      setStatus("ready");
    } catch {
      setStatus("fallback");
    }
  }, []);

  useEffect(() => {
    void refreshSiteContent();
  }, [refreshSiteContent]);

  const value = useMemo<SiteContentContextValue>(() => ({
    siteSettings,
    legalPages,
    status,
    refreshSiteContent,
  }), [siteSettings, legalPages, status, refreshSiteContent]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContentContextValue {
  const value = useContext(SiteContentContext);
  if (!value) throw new Error("useSiteContent must be used within SiteContentProvider");
  return value;
}
