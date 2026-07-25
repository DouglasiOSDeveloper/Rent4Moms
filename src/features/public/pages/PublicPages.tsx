import React from "react";
import { Search, MapPin, Phone, Mail, Instagram, MessageCircle, Package, Wrench, CheckCircle, Eye, Shield, Award, Archive, Droplets, Zap } from "lucide-react";
import type { Page } from "../../../domain/shared/types";
import { Btn, cn } from "../../../components/prototype/PrototypeUI";
import { buildWhatsAppUrl, hasConfiguredValue } from "../../../lib/contact";
import { useSiteContent } from "../../../stores/content/SiteContentProvider";
import { EmptyState } from "../../../components/states/DataState";

export function HowItWorksPage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-4">Como funciona</h1>
      <p className="text-muted-foreground text-lg mb-12">Um processo simples, pensado para facilitar a vida das famílias.</p>
      <div className="flex flex-col gap-12">
        {[
          { num: "01", title: "Escolha o produto", desc: "Navegue pelo catálogo e filtre por categoria, faixa etária ou período. Você pode comparar até 3 produtos antes de decidir." },
          { num: "02", title: "Informe o período desejado", desc: "Selecione as datas de início e devolução. O sistema calcula uma estimativa de valor. O preço final é confirmado no orçamento." },
          { num: "03", title: "Envie a solicitação", desc: "Preencha seus dados e envie o orçamento. Nenhuma cobrança é feita nesta etapa. Nossa equipe entrará em contato." },
          { num: "04", title: "Confirme a reserva", desc: "Após a análise, você recebe o orçamento final, assina o contrato e confirma a reserva. A entrega é agendada conforme combinado." },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold">{s.num}</span>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground mb-3">{s.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-16 text-center">
        <Btn variant="primary" size="lg" onClick={() => navigate("catalog")}><Search size={18} />Ver produtos disponíveis</Btn>
      </div>
    </div>
  );
}

export function HygienePage({ navigate }: { navigate: (p: Page) => void }) {
  const steps = [
    { icon: <Eye size={22} className="text-primary" />, title: "Inspeção inicial", desc: "Ao receber a devolução, inspecionamos cada componente do equipamento." },
    { icon: <Archive size={22} className="text-primary" />, title: "Desmontagem", desc: "Quando aplicável, o produto é desmontado para facilitar a limpeza de todas as peças." },
    { icon: <Droplets size={22} className="text-primary" />, title: "Limpeza", desc: "Cada material recebe tratamento adequado: tecidos, plásticos, metais e acolchoamentos." },
    { icon: <Zap size={22} className="text-primary" />, title: "Secagem", desc: "Secagem completa antes de qualquer embalagem ou armazenamento." },
    { icon: <Wrench size={22} className="text-primary" />, title: "Revisão de componentes", desc: "Verificamos cintos, travas, encaixes e todos os mecanismos de segurança." },
    { icon: <Package size={22} className="text-primary" />, title: "Embalagem e preparo", desc: "O produto é preparado e embalado para a próxima locação." },
    { icon: <CheckCircle size={22} className="text-primary" />, title: "Liberação", desc: "Somente após aprovação interna o produto é marcado como disponível para nova locação." },
  ];
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-4">Processo de higienização</h1>
      <p className="text-muted-foreground text-lg mb-12 max-w-2xl">Cada equipamento passa por etapas cuidadosas antes de chegar à sua casa. Você recebe um produto limpo, higienizado e revisado.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {steps.map((s, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">{s.icon}</div>
            <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-secondary rounded-2xl border border-border p-6 text-sm text-muted-foreground leading-relaxed">
        <p><strong className="text-foreground">Nota importante:</strong> O processo aplicado depende do material e do tipo de equipamento. A descrição oficial do procedimento deve ser mantida atualizada no módulo de conteúdo e operação.</p>
      </div>
    </div>
  );
}

export function AboutPage({ navigate }: { navigate: (page: Page) => void }) {
  const { siteSettings } = useSiteContent();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-6">Sobre a {siteSettings.brand.name || "Rent4Moms"}</h1>
      <div className="grid lg:grid-cols-2 gap-10 mb-12">
        <div>
          <p className="text-muted-foreground leading-relaxed mb-4">{siteSettings.brand.description}</p>
          <p className="text-muted-foreground leading-relaxed mb-4">{siteSettings.brand.tagline}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Btn variant="primary" onClick={() => navigate("catalog")}>Ver produtos</Btn>
            <Btn variant="outline" onClick={() => navigate("contact")}>Fale conosco</Btn>
          </div>
        </div>
        <EmptyState title="Imagem institucional não cadastrada" description="A mídia oficial será exibida após o upload no painel administrativo." />
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { icon: <Shield size={28} className="text-primary" />, title: "Segurança", desc: "Produtos revisados e em conformidade com as especificações dos fabricantes" },
          { icon: <Droplets size={28} className="text-primary" />, title: "Higiene", desc: "Processo completo de limpeza e higienização antes de cada entrega" },
          { icon: <Award size={28} className="text-primary" />, title: "Qualidade", desc: "Equipamentos de marcas reconhecidas em bom estado de conservação" },
        ].map((value) => (
          <div key={value.title} className="text-center p-6 bg-secondary rounded-2xl border border-border">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">{value.icon}</div>
            <p className="font-semibold text-foreground mb-2">{value.title}</p>
            <p className="text-sm text-muted-foreground">{value.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FAQPage({ navigate }: { navigate: (page: Page) => void }) {
  const { siteSettings } = useSiteContent();
  const whatsappUrl = buildWhatsAppUrl(siteSettings.contact.whatsapp, siteSettings.whatsapp.defaultMessage);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-4">Dúvidas frequentes</h1>
      <p className="text-muted-foreground mb-10">Encontre aqui as respostas para as perguntas mais comuns. Se não encontrar o que precisa, fale com nossa equipe.</p>
      <EmptyState title="Nenhuma dúvida publicada" description="As perguntas frequentes serão exibidas depois do cadastro no módulo de conteúdo." />
      <div className="mt-10 text-center p-8 bg-secondary rounded-2xl border border-border">
        <p className="font-medium text-foreground mb-2">Ainda tem dúvidas?</p>
        <p className="text-sm text-muted-foreground mb-4">Nossa equipe está aqui para ajudar você a encontrar a melhor opção.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer"><Btn variant="primary"><MessageCircle size={16} />Falar no WhatsApp</Btn></a>}
          <Btn variant="outline" onClick={() => navigate("contact")}>Enviar mensagem</Btn>
        </div>
      </div>
    </div>
  );
}

export function ContactPage({ navigate: _navigate }: { navigate: (page: Page) => void }) {
  const { siteSettings } = useSiteContent();
  const whatsappUrl = buildWhatsAppUrl(siteSettings.contact.whatsapp, siteSettings.whatsapp.defaultMessage);
  const instagramLabel = siteSettings.socialLinks.instagram
    ? siteSettings.socialLinks.instagram.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "";
  const hasChannels = Boolean(whatsappUrl)
    || hasConfiguredValue(siteSettings.contact.phone)
    || hasConfiguredValue(siteSettings.contact.email)
    || Boolean(siteSettings.socialLinks.instagram)
    || hasConfiguredValue(siteSettings.contact.serviceRegion);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-10">Fale conosco</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <EmptyState title="Formulário de contato não configurado" description="Nenhuma mensagem é simulada ou armazenada apenas no navegador. Use um dos canais reais publicados ao lado." />
        <div className="flex flex-col gap-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="font-semibold text-foreground mb-4">Canais de atendimento</p>
            {!hasChannels ? <EmptyState compact title="Nenhum canal publicado" description="Cadastre telefone, WhatsApp, e-mail ou rede social no painel administrativo." /> : <div className="flex flex-col gap-4 text-sm">
              {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"><div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><MessageCircle size={16} className="text-green-600" /></div><div><p className="font-medium text-foreground">WhatsApp</p><p>{siteSettings.contact.whatsapp}</p></div></a>}
              {hasConfiguredValue(siteSettings.contact.phone) && <a href={`tel:${siteSettings.contact.phone.replace(/\D/g, "")}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground"><div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center"><Phone size={16} /></div><div><p className="font-medium text-foreground">Telefone</p><p>{siteSettings.contact.phone}</p></div></a>}
              {hasConfiguredValue(siteSettings.contact.email) && <a href={`mailto:${siteSettings.contact.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground"><div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center"><Mail size={16} /></div><div><p className="font-medium text-foreground">E-mail</p><p>{siteSettings.contact.email}</p></div></a>}
              {siteSettings.socialLinks.instagram && <a href={siteSettings.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"><div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center"><Instagram size={16} className="text-pink-600" /></div><div><p className="font-medium text-foreground">Instagram</p><p>{instagramLabel}</p></div></a>}
              {hasConfiguredValue(siteSettings.contact.serviceRegion) && <div className="flex items-start gap-3 text-muted-foreground"><div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0"><MapPin size={16} /></div><div><p className="font-medium text-foreground">Região atendida</p><p>{siteSettings.contact.serviceRegion}</p></div></div>}
            </div>}
          </div>
          <div className="bg-secondary rounded-2xl border border-border p-6">
            <p className="font-semibold text-foreground mb-3">Horários</p>
            {siteSettings.businessHours.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum horário publicado.</p> : <div className="space-y-2 text-sm text-muted-foreground">{siteSettings.businessHours.map((entry) => <p key={entry.id} className="flex justify-between gap-3"><span>{entry.label}</span><span className="font-medium text-foreground">{entry.closed ? "Fechado" : `${entry.startTime}–${entry.endTime}`}</span></p>)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
