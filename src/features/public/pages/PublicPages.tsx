import React, { useState } from "react";
import {
  Menu, X, ShoppingBag, Heart, Star, ChevronDown, ChevronRight, ChevronLeft,
  ChevronUp, Search, Filter, MapPin, Calendar, Phone, Mail, Instagram,
  MessageCircle, User, Settings, LogOut, Bell, Package, FileText, Truck,
  Wrench, CheckCircle, Clock, AlertCircle, XCircle, Eye, Edit, Trash2,
  Plus, Download, BarChart2, Users, DollarSign, TrendingUp, ArrowRight,
  Shield, Leaf, Award, Info, Lock, Check, Home, List, Tag, Archive,
  Layers, Droplets, Clipboard, Activity, Hash, RefreshCw, Upload,
  MoreHorizontal, Minus, BookOpen, Globe, Zap
} from "lucide-react";
import type { Page } from "../../../domain/shared/types";
import { FAQ_ITEMS } from "../../../data/mocks";
import { Accordion, Btn, Input, Select, cn } from "../../../components/prototype/PrototypeUI";
import { buildWhatsAppUrl, hasConfiguredValue } from "../../../lib/contact";
import { useSiteContent } from "../../../stores/content/SiteContentProvider";

export function HowItWorksPage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-4">Como funciona</h1>
      <p className="text-muted-foreground text-lg mb-12">Um processo simples, pensado para facilitar a vida das famílias.</p>
      <div className="flex flex-col gap-12">
        {[
          { num: "01", title: "Escolha o produto", desc: "Navegue pelo catálogo e filtre por categoria, faixa etária ou período. Você pode comparar até 3 produtos antes de decidir.", img: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&h=350&fit=crop" },
          { num: "02", title: "Informe o período desejado", desc: "Selecione as datas de início e devolução. O sistema calcula uma estimativa de valor. O preço final é confirmado no orçamento.", img: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&h=350&fit=crop" },
          { num: "03", title: "Envie a solicitação", desc: "Preencha seus dados e envie o orçamento. Nenhuma cobrança é feita nesta etapa. Nossa equipe entrará em contato.", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&h=350&fit=crop" },
          { num: "04", title: "Confirme a reserva", desc: "Após a análise, você recebe o orçamento final, assina o contrato e confirma a reserva. A entrega é agendada conforme combinado.", img: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=500&h=350&fit=crop" },
        ].map((s, i) => (
          <div key={i} className={cn("grid lg:grid-cols-2 gap-8 items-center", i % 2 === 1 && "lg:flex-row-reverse")}>
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                <span className="text-white font-bold">{s.num}</span>
              </div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground mb-3">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
            <img src={s.img} alt={s.title} className={cn("rounded-2xl w-full h-60 object-cover shadow-lg", i % 2 === 1 ? "lg:order-1" : "")} />
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
        <p><strong className="text-foreground">Nota importante:</strong> Os procedimentos descritos são demonstrativos. Os processos reais da Rent4Moms podem variar conforme o tipo de produto. Não garantimos esterilização clínica. O processo tem como objetivo entregar os equipamentos em condições de higiene e conservação adequadas para uso doméstico.</p>
      </div>
    </div>
  );
}

export function AboutPage({ navigate }: { navigate: (page: Page) => void }) {
  const { siteSettings } = useSiteContent();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-6">Sobre a {siteSettings.brand.name}</h1>
      <div className="grid lg:grid-cols-2 gap-10 mb-12">
        <div>
          <p className="text-muted-foreground leading-relaxed mb-4">{siteSettings.brand.description}</p>
          <p className="text-muted-foreground leading-relaxed mb-4">{siteSettings.brand.tagline}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Btn variant="primary" onClick={() => navigate("catalog")}>Ver produtos</Btn>
            <Btn variant="outline" onClick={() => navigate("contact")}>Fale conosco</Btn>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=500&h=380&fit=crop" alt="Família" className="rounded-2xl w-full object-cover shadow-lg" />
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
      <Accordion items={FAQ_ITEMS} />
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
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", assunto: "", mensagem: "" });
  const [sent, setSent] = useState(false);
  const whatsappUrl = buildWhatsAppUrl(siteSettings.contact.whatsapp, siteSettings.whatsapp.defaultMessage);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-10">Fale conosco</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          {sent ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="text-accent mx-auto mb-4" />
              <h2 className="font-semibold text-foreground text-xl mb-2">Mensagem registrada!</h2>
              <p className="text-muted-foreground">O envio automático será conectado ao canal configurado em uma integração futura. Para atendimento imediato, utilize os canais ao lado.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input label="Nome" placeholder="Seu nome" value={form.nome} onChange={(value) => setForm({ ...form, nome: value })} required />
              <Input label="E-mail" type="email" placeholder="seu@email.com" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
              <Input label="Telefone" placeholder="(11) 00000-0000" value={form.telefone} onChange={(value) => setForm({ ...form, telefone: value })} />
              <Select label="Assunto" options={["Selecione...", "Dúvida sobre produto", "Orçamento", "Entrega e retirada", "Suporte", "Outro"]} value={form.assunto} onChange={(value) => setForm({ ...form, assunto: value })} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Mensagem <span className="text-primary">*</span></label>
                <textarea value={form.mensagem} onChange={(event) => setForm({ ...form, mensagem: event.target.value })} placeholder="Escreva sua mensagem..." rows={5} className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <Btn variant="primary" fullWidth onClick={() => setSent(true)} disabled={!form.nome.trim() || !form.email.trim() || !form.mensagem.trim()}>Registrar mensagem</Btn>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="font-semibold text-foreground mb-4">Canais de atendimento</p>
            <div className="flex flex-col gap-4 text-sm">
              {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"><div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><MessageCircle size={16} className="text-green-600" /></div><div><p className="font-medium text-foreground">WhatsApp</p><p>{siteSettings.contact.whatsapp}</p></div></a>}
              <div className="flex items-center gap-3 text-muted-foreground"><div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center"><Phone size={16} /></div><div><p className="font-medium text-foreground">Telefone</p><p>{siteSettings.contact.phone}</p></div></div>
              {hasConfiguredValue(siteSettings.contact.email) ? <a href={`mailto:${siteSettings.contact.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground"><div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center"><Mail size={16} /></div><div><p className="font-medium text-foreground">E-mail</p><p>{siteSettings.contact.email}</p></div></a> : <div className="flex items-center gap-3 text-muted-foreground"><div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center"><Mail size={16} /></div><div><p className="font-medium text-foreground">E-mail</p><p>{siteSettings.contact.email}</p></div></div>}
              {siteSettings.socialLinks.instagram && <a href={siteSettings.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"><div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center"><Instagram size={16} className="text-pink-600" /></div><div><p className="font-medium text-foreground">Instagram</p><p>@rent4moms</p></div></a>}
              <div className="flex items-start gap-3 text-muted-foreground"><div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0"><MapPin size={16} /></div><div><p className="font-medium text-foreground">Região atendida</p><p>{siteSettings.contact.serviceRegion}</p></div></div>
            </div>
          </div>
          <div className="bg-secondary rounded-2xl border border-border p-6">
            <p className="font-semibold text-foreground mb-3">Horários</p>
            <div className="space-y-2 text-sm text-muted-foreground">{siteSettings.businessHours.map((entry) => <p key={entry.id} className="flex justify-between gap-3"><span>{entry.label}</span><span className="font-medium text-foreground">{entry.closed ? "Fechado" : `${entry.startTime}–${entry.endTime}`}</span></p>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
