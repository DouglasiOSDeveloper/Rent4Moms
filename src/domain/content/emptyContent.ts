import type { IntegrationSettingsDocument, SiteSettingsDocument } from "./types";

export function createEmptySiteSettings(): SiteSettingsDocument {
  return {
    brand: { name: "", tagline: "", description: "" },
    contact: {
      phone: "",
      whatsapp: "",
      email: "",
      serviceRegion: "",
      address: "",
      cnpj: "",
    },
    socialLinks: { instagram: "", facebook: "", tiktok: "", youtube: "" },
    businessHours: [],
    footer: {
      copyrightText: "",
      legalDisclaimer: "",
      showCnpj: false,
      showAddress: false,
    },
    whatsapp: { defaultMessage: "" },
    institutionalImage: null,
    updatedAt: new Date(0).toISOString(),
  };
}

export function createEmptyIntegrationSettings(): IntegrationSettingsDocument {
  const channel = { enabled: false, provider: "", status: "not_configured" as const };
  return {
    payments: {
      enabled: false,
      mode: "manual",
      provider: "",
      publicLabel: "",
      status: "not_configured",
    },
    notifications: {
      email: { ...channel },
      whatsapp: { ...channel },
      sms: { ...channel },
    },
    updatedAt: new Date(0).toISOString(),
  };
}
