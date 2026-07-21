import React from "react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "../../lib/contact";
import { useSiteContent } from "../../stores/content/SiteContentProvider";

export function WhatsAppFloat() {
  const { siteSettings } = useSiteContent();
  const url = buildWhatsAppUrl(siteSettings.contact.whatsapp, siteSettings.whatsapp.defaultMessage);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
      style={{ width: 52, height: 52 }}
      title="Falar no WhatsApp"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle size={24} />
    </a>
  );
}
