import React from "react";
import { Clock, Globe, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Page } from "../../domain/shared/types";
import { legalPagePath } from "../../domain/content/types";
import { buildWhatsAppUrl, hasConfiguredValue, replaceYearToken } from "../../lib/contact";
import { useSiteContent } from "../../stores/content/SiteContentProvider";
import { BrandLogo } from "./BrandLogo";

export function Footer({ navigate }: { navigate: (page: Page) => void }) {
  const { siteSettings, legalPages } = useSiteContent();
  const whatsappUrl = buildWhatsAppUrl(siteSettings.contact.whatsapp, siteSettings.whatsapp.defaultMessage);
  const legalOrder = [
    "contrato-de-locacao",
    "entrega-e-retirada",
    "politica-de-cancelamento",
    "politica-de-privacidade",
    "preferencias-de-cookies",
    "termos-de-uso",
  ];
  const orderedLegalPages = [...legalPages].sort((left, right) => {
    const leftIndex = legalOrder.indexOf(left.slug);
    const rightIndex = legalOrder.indexOf(right.slug);
    if (leftIndex === -1 && rightIndex === -1) return left.title.localeCompare(right.title, "pt-BR");
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
  const socialLinks = [
    { key: "instagram", label: "Instagram", url: siteSettings.socialLinks.instagram, icon: <Instagram size={16} /> },
    { key: "facebook", label: "Facebook", url: siteSettings.socialLinks.facebook, icon: <Globe size={16} /> },
    { key: "tiktok", label: "TikTok", url: siteSettings.socialLinks.tiktok, icon: <Globe size={16} /> },
    { key: "youtube", label: "YouTube", url: siteSettings.socialLinks.youtube, icon: <Globe size={16} /> },
  ].filter((item) => item.url.trim());

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="mb-4 inline-flex rounded-xl bg-white px-3 py-2 shadow-sm">
              <BrandLogo
                brandName={siteSettings.brand.name || "Rent4Moms"}
                className="h-10 w-auto max-w-[200px]"
              />
            </div>
            {siteSettings.brand.description && <p className="text-sm text-sidebar-foreground/70 leading-relaxed mb-4">{siteSettings.brand.description}</p>}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <a key={item.key} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label} title={item.label}
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                  {item.icon}
                </a>
              ))}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp" title="WhatsApp"
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                  <MessageCircle size={16} />
                </a>
              )}
              {hasConfiguredValue(siteSettings.contact.email) && (
                <a href={`mailto:${siteSettings.contact.email}`} aria-label="E-mail" title="E-mail"
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                  <Mail size={16} />
                </a>
              )}
            </div>
          </div>

          <div>
            <p className="font-semibold text-sidebar-foreground mb-4">Navegação</p>
            <div className="flex flex-col gap-2.5">
              {[["Produtos", "catalog"], ["Como funciona", "how-it-works"], ["Higienização", "hygiene-page"], ["Sobre nós", "about"], ["Dúvidas", "faq"], ["Contato", "contact"]].map(([label, page]) => (
                <button key={page} onClick={() => navigate(page as Page)} className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors text-left">{label}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-sidebar-foreground mb-4">Atendimento</p>
            <div className="flex flex-col gap-2.5 text-sm text-sidebar-foreground/70">
              {hasConfiguredValue(siteSettings.contact.phone) && <p className="flex items-center gap-2"><Phone size={14} />{siteSettings.contact.phone}</p>}
              {hasConfiguredValue(siteSettings.contact.email) && <p className="flex items-center gap-2"><Mail size={14} />{siteSettings.contact.email}</p>}
              {hasConfiguredValue(siteSettings.contact.serviceRegion) && <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" />Área de atendimento: {siteSettings.contact.serviceRegion}</p>}
              {siteSettings.footer.showAddress && hasConfiguredValue(siteSettings.contact.address) && <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" />{siteSettings.contact.address}</p>}
              {siteSettings.businessHours.map((entry) => (
                <p key={entry.id} className="flex items-start gap-2"><Clock size={14} className="mt-0.5 shrink-0" /><span>{entry.label}: {entry.closed ? "Fechado" : `${entry.startTime}–${entry.endTime}`}</span></p>
              ))}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-accent hover:text-sidebar-foreground transition-colors font-medium">
                  <MessageCircle size={14} />Falar no WhatsApp
                </a>
              )}
            </div>
            {siteSettings.footer.showCnpj && hasConfiguredValue(siteSettings.contact.cnpj) && <p className="mt-4 text-xs text-sidebar-foreground/45">CNPJ: {siteSettings.contact.cnpj}</p>}
          </div>

          <div>
            <p className="font-semibold text-sidebar-foreground mb-4">Legal</p>
            <div className="flex flex-col gap-2.5">
              {orderedLegalPages.map((page) => (
                <a key={page.slug} href={legalPagePath(page.slug)} className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">{page.title}</a>
              ))}
              {orderedLegalPages.length === 0 && <span className="text-sm text-sidebar-foreground/45">Conteúdos legais em preparação.</span>}
            </div>
            {siteSettings.footer.copyrightText && <p className="mt-6 text-xs text-sidebar-foreground/45">{replaceYearToken(siteSettings.footer.copyrightText)}</p>}
          </div>
        </div>
        {siteSettings.footer.legalDisclaimer && (
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-sidebar-foreground/45">{siteSettings.footer.legalDisclaimer}</p>
          </div>
        )}
      </div>
    </footer>
  );
}
