import type {
  AdminContentSnapshot,
  IntegrationSettingsDocument,
  LegalPageAdmin,
  PublicLegalPage,
  PublicSiteContent,
  SiteSettingsDocument,
} from "../../domain/content/types";
import { apiRequest } from "../api/apiClient";

export async function loadPublicSiteContent(): Promise<PublicSiteContent> {
  return await apiRequest<PublicSiteContent>("/content/site");
}

export async function loadPublicLegalPage(slug: string): Promise<PublicLegalPage> {
  const response = await apiRequest<{ page: PublicLegalPage }>(`/content/legal/${encodeURIComponent(slug)}`);
  return response.page;
}

export async function loadAdminContent(): Promise<AdminContentSnapshot> {
  return await apiRequest<AdminContentSnapshot>("/admin/content");
}

export async function saveAdminSiteSettings(settings: SiteSettingsDocument): Promise<SiteSettingsDocument> {
  const response = await apiRequest<{ siteSettings: SiteSettingsDocument }>("/admin/content/site", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
  return response.siteSettings;
}

export async function createAdminLegalPage(input: { slug: string; title: string; summary: string; content: string }): Promise<LegalPageAdmin> {
  const response = await apiRequest<{ page: LegalPageAdmin }>("/admin/content/legal", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.page;
}

export async function updateAdminLegalPage(slug: string, input: Partial<{ title: string; summary: string; content: string }>): Promise<LegalPageAdmin> {
  const response = await apiRequest<{ page: LegalPageAdmin }>(`/admin/content/legal/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return response.page;
}

export async function publishAdminLegalPage(slug: string): Promise<LegalPageAdmin> {
  const response = await apiRequest<{ page: LegalPageAdmin }>(`/admin/content/legal/${encodeURIComponent(slug)}/publish`, {
    method: "POST",
  });
  return response.page;
}

export async function archiveAdminLegalPage(slug: string): Promise<LegalPageAdmin> {
  const response = await apiRequest<{ page: LegalPageAdmin }>(`/admin/content/legal/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  return response.page;
}

export async function saveAdminIntegrations(settings: IntegrationSettingsDocument): Promise<IntegrationSettingsDocument> {
  const response = await apiRequest<{ integrations: IntegrationSettingsDocument }>("/admin/integrations", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
  return response.integrations;
}
