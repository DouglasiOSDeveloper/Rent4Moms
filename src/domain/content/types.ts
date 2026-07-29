export type LegalPageStatus = "draft" | "published" | "archived";
export type IntegrationStatus = "not_configured" | "ready" | "disabled";

export interface BusinessHoursEntry {
  id: string;
  label: string;
  days: string[];
  startTime: string;
  endTime: string;
  closed: boolean;
}

export interface InstitutionalImageReference {
  assetId: string;
  alt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface SiteSettingsDocument {
  brand: {
    name: string;
    tagline: string;
    description: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    serviceRegion: string;
    address: string;
    cnpj: string;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube: string;
  };
  businessHours: BusinessHoursEntry[];
  faqs: FaqItem[];
  footer: {
    copyrightText: string;
    legalDisclaimer: string;
    showCnpj: boolean;
    showAddress: boolean;
  };
  whatsapp: {
    defaultMessage: string;
  };
  institutionalImage: InstitutionalImageReference | null;
  updatedAt: string;
}

export interface IntegrationChannelSettings {
  enabled: boolean;
  provider: string;
  status: IntegrationStatus;
}

export interface IntegrationSettingsDocument {
  payments: {
    enabled: boolean;
    mode: "manual" | "gateway";
    provider: string;
    publicLabel: string;
    status: IntegrationStatus;
  };
  notifications: {
    email: IntegrationChannelSettings;
    whatsapp: IntegrationChannelSettings;
    sms: IntegrationChannelSettings;
  };
  updatedAt: string;
}

export interface OperationalIntegrationChannel {
  configured: boolean;
  provider: string;
  status: IntegrationStatus;
  source: "server_environment" | "not_implemented";
}

export interface OperationalIntegrationSnapshot {
  notifications: {
    email: OperationalIntegrationChannel;
    whatsapp: OperationalIntegrationChannel;
    sms: OperationalIntegrationChannel;
  };
}

export interface LegalPageVersion {
  id: string;
  legalPageId: string;
  version: number;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  publishedBy: string | null;
}

export interface LegalPageAdmin {
  id: string;
  slug: string;
  title: string;
  summary: string;
  draftContent: string;
  status: LegalPageStatus;
  publishedVersion: number | null;
  publishedContent: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  versions: LegalPageVersion[];
}

export interface PublicLegalPage {
  slug: string;
  title: string;
  summary: string;
  content: string;
  version: number;
  publishedAt: string;
}

export interface PublicSiteContent {
  siteSettings: SiteSettingsDocument | null;
  legalPages: PublicLegalPage[];
}

export interface AdminContentSnapshot {
  siteSettings: SiteSettingsDocument | null;
  legalPages: LegalPageAdmin[];
  integrations: IntegrationSettingsDocument | null;
  operationalIntegrations: OperationalIntegrationSnapshot;
}

export const LEGAL_PATHS: Record<string, string> = {
  "politica-de-privacidade": "/politica-de-privacidade",
  "termos-de-uso": "/termos-de-uso",
  "politica-de-cancelamento": "/politica-de-cancelamento",
  "entrega-e-retirada": "/entrega-e-retirada",
  "contrato-de-locacao": "/contrato-de-locacao",
  "preferencias-de-cookies": "/preferencias-de-cookies",
};

export function legalPagePath(slug: string): string {
  return LEGAL_PATHS[slug] ?? `/legal/${slug}`;
}
