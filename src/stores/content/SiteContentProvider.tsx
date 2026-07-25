import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createEmptySiteSettings } from "../../domain/content/emptyContent";
import type { PublicLegalPage, SiteSettingsDocument } from "../../domain/content/types";
import { loadPublicSiteContent } from "../../services/content/contentApi";

interface SiteContentContextValue {
  siteSettings: SiteSettingsDocument;
  legalPages: PublicLegalPage[];
  status: "loading" | "ready" | "empty" | "error";
  refreshSiteContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [siteSettings, setSiteSettings] = useState<SiteSettingsDocument>(() => createEmptySiteSettings());
  const [legalPages, setLegalPages] = useState<PublicLegalPage[]>([]);
  const [status, setStatus] = useState<SiteContentContextValue["status"]>("loading");

  const refreshSiteContent = useCallback(async () => {
    setStatus("loading");
    try {
      const content = await loadPublicSiteContent();
      setSiteSettings(content.siteSettings ?? createEmptySiteSettings());
      setLegalPages(content.legalPages);
      setStatus(content.siteSettings || content.legalPages.length > 0 ? "ready" : "empty");
    } catch {
      setSiteSettings(createEmptySiteSettings());
      setLegalPages([]);
      setStatus("error");
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
