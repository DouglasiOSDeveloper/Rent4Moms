import type { IntegrationSettingsDocument, OperationalIntegrationSnapshot, PublicLegalPage, SiteSettingsDocument } from "../../domain/content/types";

export const DEFAULT_SITE_SETTINGS: SiteSettingsDocument = {
  brand: {
    name: "Rent4Moms",
    tagline: "Mais praticidade para você. Mais conforto para o seu bebê.",
    description: "Aluguel de equipamentos infantis com cuidado, higiene e segurança. Para cada fase do seu bebê.",
  },
  contact: {
    phone: "[TELEFONE]",
    whatsapp: "[NUMERO]",
    email: "[EMAIL]",
    serviceRegion: "[REGIÃO]",
    address: "[ENDEREÇO]",
    cnpj: "[CNPJ]",
  },
  socialLinks: {
    instagram: "https://www.instagram.com/rent4moms/",
    facebook: "",
    tiktok: "",
    youtube: "",
  },
  businessHours: [
    { id: "weekdays", label: "Segunda a sexta", days: ["MO", "TU", "WE", "TH", "FR"], startTime: "09:00", endTime: "18:00", closed: false },
    { id: "saturday", label: "Sábado", days: ["SA"], startTime: "09:00", endTime: "13:00", closed: false },
    { id: "sunday", label: "Domingo e feriados", days: ["SU"], startTime: "00:00", endTime: "00:00", closed: true },
  ],
  footer: {
    copyrightText: "© {year} Rent4Moms. Todos os direitos reservados.",
    legalDisclaimer: "Os textos legais desta plataforma são demonstrativos e necessitam de revisão jurídica antes de uso comercial.",
    showCnpj: true,
    showAddress: false,
  },
  whatsapp: { defaultMessage: "Olá! Gostaria de saber mais sobre os produtos da Rent4Moms." },
  institutionalImage: null,
  updatedAt: new Date(0).toISOString(),
};

export const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettingsDocument = {
  payments: { enabled: true, mode: "manual", provider: "", publicLabel: "Pagamento confirmado pela equipe Rent4Moms", status: "ready" },
  notifications: {
    email: { enabled: false, provider: "", status: "not_configured" },
    whatsapp: { enabled: false, provider: "", status: "not_configured" },
    sms: { enabled: false, provider: "", status: "not_configured" },
  },
  updatedAt: new Date(0).toISOString(),
};

export const DEFAULT_PUBLIC_LEGAL_PAGES: PublicLegalPage[] = [];

export const DEFAULT_OPERATIONAL_INTEGRATIONS: OperationalIntegrationSnapshot = {
  notifications: {
    email: { configured: true, provider: "Brevo", status: "ready", source: "server_environment" },
    whatsapp: { configured: false, provider: "", status: "not_configured", source: "not_implemented" },
    sms: { configured: false, provider: "", status: "not_configured", source: "not_implemented" },
  },
};
