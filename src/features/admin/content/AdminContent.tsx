import React, { useEffect, useMemo, useState } from "react";
import { Archive, CheckCircle, ExternalLink, FileText, Globe, LoaderCircle, Plus, RefreshCw, Save, Send, Settings2 } from "lucide-react";
import { Btn, Input, Select, cn } from "../../../components/prototype/PrototypeUI";
import { createEmptyIntegrationSettings, createEmptySiteSettings } from "../../../domain/content/emptyContent";
import type { AdminContentSnapshot, IntegrationSettingsDocument, LegalPageAdmin, SiteSettingsDocument } from "../../../domain/content/types";
import { legalPagePath } from "../../../domain/content/types";
import {
  archiveAdminLegalPage,
  createAdminLegalPage,
  loadAdminContent,
  publishAdminLegalPage,
  saveAdminIntegrations,
  saveAdminSiteSettings,
  updateAdminLegalPage,
} from "../../../services/content/contentApi";
import { useSiteContent } from "../../../stores/content/SiteContentProvider";

const tabs = [
  ["institucional", "Institucional"],
  ["legal", "Páginas legais"],
  ["integracoes", "Integrações"],
] as const;

type Tab = (typeof tabs)[number][0];

type LegalForm = { slug: string; title: string; summary: string; content: string };
const emptyLegalForm: LegalForm = { slug: "", title: "", summary: "", content: "" };

function StatusPill({ status }: { status: string }) {
  const classes = status === "published" || status === "ready"
    ? "bg-green-50 text-green-700 border-green-200"
    : status === "archived" || status === "disabled"
      ? "bg-gray-100 text-gray-600 border-gray-200"
      : "bg-amber-50 text-amber-700 border-amber-200";
  const label = ({ published: "Publicado", draft: "Rascunho", archived: "Arquivado", ready: "Pronto", disabled: "Desativado", not_configured: "Não configurado" } as Record<string, string>)[status] ?? status;
  return <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs font-medium", classes)}>{label}</span>;
}

export function AdminContent() {
  const { refreshSiteContent } = useSiteContent();
  const [tab, setTab] = useState<Tab>("institucional");
  const [snapshot, setSnapshot] = useState<AdminContentSnapshot | null>(null);
  const [siteDraft, setSiteDraft] = useState<SiteSettingsDocument>(() => createEmptySiteSettings());
  const [integrationsDraft, setIntegrationsDraft] = useState<IntegrationSettingsDocument>(() => createEmptyIntegrationSettings());
  const [selectedSlug, setSelectedSlug] = useState("");
  const [legalForm, setLegalForm] = useState<LegalForm>(emptyLegalForm);
  const [creatingLegal, setCreatingLegal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedPage = useMemo(() => snapshot?.legalPages.find((page) => page.slug === selectedSlug) ?? null, [selectedSlug, snapshot]);

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await loadAdminContent();
      setSnapshot(data);
      setSiteDraft(structuredClone(data.siteSettings ?? createEmptySiteSettings()));
      setIntegrationsDraft(structuredClone(data.integrations ?? createEmptyIntegrationSettings()));
      const first = data.legalPages.find((page) => page.status !== "archived") ?? data.legalPages[0];
      if (first) {
        setSelectedSlug(first.slug);
        setLegalForm({ slug: first.slug, title: first.title, summary: first.summary, content: first.draftContent });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível carregar o conteúdo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, []);

  const selectLegalPage = (page: LegalPageAdmin) => {
    setCreatingLegal(false);
    setSelectedSlug(page.slug);
    setLegalForm({ slug: page.slug, title: page.title, summary: page.summary, content: page.draftContent });
    setMessage("");
    setError("");
  };

  const runAction = async (action: () => Promise<void>, success: string) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  const saveSite = () => runAction(async () => {
    const saved = await saveAdminSiteSettings(siteDraft);
    setSiteDraft(saved);
    setSnapshot((current) => current ? { ...current, siteSettings: saved } : current);
    await refreshSiteContent();
  }, "Dados institucionais publicados no site.");

  const saveLegalDraft = () => runAction(async () => {
    if (!legalForm.title.trim() || legalForm.content.trim().length < 20) throw new Error("Informe título e conteúdo com pelo menos 20 caracteres.");
    let page: LegalPageAdmin;
    if (creatingLegal) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(legalForm.slug)) throw new Error("Use apenas letras minúsculas, números e hífens no endereço.");
      page = await createAdminLegalPage(legalForm);
      setCreatingLegal(false);
      setSelectedSlug(page.slug);
    } else {
      page = await updateAdminLegalPage(legalForm.slug, { title: legalForm.title, summary: legalForm.summary, content: legalForm.content });
    }
    setSnapshot((current) => current ? { ...current, legalPages: [...current.legalPages.filter((item) => item.slug !== page.slug), page].sort((a, b) => a.title.localeCompare(b.title)) } : current);
    setLegalForm({ slug: page.slug, title: page.title, summary: page.summary, content: page.draftContent });
  }, creatingLegal ? "Página criada como rascunho." : "Rascunho salvo. A versão pública ainda não mudou.");

  const publishLegal = () => runAction(async () => {
    if (creatingLegal) throw new Error("Salve a nova página antes de publicar.");
    const page = await publishAdminLegalPage(legalForm.slug);
    setSnapshot((current) => current ? { ...current, legalPages: current.legalPages.map((item) => item.slug === page.slug ? page : item) } : current);
    await refreshSiteContent();
  }, "Nova versão publicada no site.");

  const archiveLegal = () => runAction(async () => {
    if (creatingLegal) {
      setCreatingLegal(false);
      setLegalForm(emptyLegalForm);
      return;
    }
    const page = await archiveAdminLegalPage(legalForm.slug);
    setSnapshot((current) => current ? { ...current, legalPages: current.legalPages.map((item) => item.slug === page.slug ? page : item) } : current);
    await refreshSiteContent();
  }, creatingLegal ? "Criação cancelada." : "Página arquivada e removida da área pública.");

  const saveIntegrations = () => runAction(async () => {
    const saved = await saveAdminIntegrations(integrationsDraft);
    setIntegrationsDraft(saved);
    setSnapshot((current) => current ? { ...current, integrations: saved } : current);
  }, "Configurações preparatórias salvas.");

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><LoaderCircle className="animate-spin" size={18} />Carregando conteúdo...</div>;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Conteúdo do site</h1>
          <p className="text-sm text-muted-foreground mt-1">Contatos, rodapé, páginas legais e preparação de integrações.</p>
        </div>
        <Btn variant="outline" size="sm" onClick={() => void reload()}><RefreshCw size={14} />Atualizar</Btn>
      </div>

      {(message || error) && (
        <div className={cn("mb-5 rounded-xl border px-4 py-3 text-sm", error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700")}>
          {error || message}
        </div>
      )}

      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px", tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>{label}</button>
        ))}
      </div>

      {tab === "institucional" && (
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Marca e apresentação</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Nome da marca" value={siteDraft.brand.name} onChange={(value) => setSiteDraft({ ...siteDraft, brand: { ...siteDraft.brand, name: value } })} required />
              <Input label="Frase principal" value={siteDraft.brand.tagline} onChange={(value) => setSiteDraft({ ...siteDraft, brand: { ...siteDraft.brand, tagline: value } })} />
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Descrição institucional</label>
                <textarea className="mt-1.5 w-full min-h-28 rounded-xl border border-border bg-input-background px-4 py-3" value={siteDraft.brand.description} onChange={(event) => setSiteDraft({ ...siteDraft, brand: { ...siteDraft.brand, description: event.target.value } })} />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Atendimento e dados legais</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Telefone" value={siteDraft.contact.phone} onChange={(value) => setSiteDraft({ ...siteDraft, contact: { ...siteDraft.contact, phone: value } })} />
              <Input label="WhatsApp" value={siteDraft.contact.whatsapp} onChange={(value) => setSiteDraft({ ...siteDraft, contact: { ...siteDraft.contact, whatsapp: value } })} />
              <Input label="E-mail" value={siteDraft.contact.email} onChange={(value) => setSiteDraft({ ...siteDraft, contact: { ...siteDraft.contact, email: value } })} />
              <Input label="CNPJ" value={siteDraft.contact.cnpj} onChange={(value) => setSiteDraft({ ...siteDraft, contact: { ...siteDraft.contact, cnpj: value } })} />
              <Input label="Região atendida" value={siteDraft.contact.serviceRegion} onChange={(value) => setSiteDraft({ ...siteDraft, contact: { ...siteDraft.contact, serviceRegion: value } })} />
              <Input label="Endereço" value={siteDraft.contact.address} onChange={(value) => setSiteDraft({ ...siteDraft, contact: { ...siteDraft.contact, address: value } })} />
            </div>
          </section>

          <section className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Redes sociais e WhatsApp</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {(["instagram", "facebook", "tiktok", "youtube"] as const).map((network) => (
                <Input key={network} label={network[0].toUpperCase() + network.slice(1)} value={siteDraft.socialLinks[network]} onChange={(value) => setSiteDraft({ ...siteDraft, socialLinks: { ...siteDraft.socialLinks, [network]: value } })} />
              ))}
              <div className="md:col-span-2">
                <Input label="Mensagem padrão do WhatsApp" value={siteDraft.whatsapp.defaultMessage} onChange={(value) => setSiteDraft({ ...siteDraft, whatsapp: { defaultMessage: value } })} />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-foreground">Horários de atendimento</h2><Btn variant="outline" size="sm" onClick={() => setSiteDraft({ ...siteDraft, businessHours: [...siteDraft.businessHours, { id: `hours-${Date.now()}`, label: "Novo horário", days: ["MO"], startTime: "09:00", endTime: "18:00", closed: false }] })}><Plus size={14} />Adicionar</Btn></div>
            <div className="space-y-3">
              {siteDraft.businessHours.map((entry, index) => (
                <div key={entry.id} className="grid md:grid-cols-[1.3fr_150px_150px_100px] gap-3 items-end rounded-xl bg-secondary p-4">
                  <Input label="Rótulo" value={entry.label} onChange={(value) => setSiteDraft({ ...siteDraft, businessHours: siteDraft.businessHours.map((item, itemIndex) => itemIndex === index ? { ...item, label: value } : item) })} />
                  <Input label="Início" type="time" value={entry.startTime} onChange={(value) => setSiteDraft({ ...siteDraft, businessHours: siteDraft.businessHours.map((item, itemIndex) => itemIndex === index ? { ...item, startTime: value } : item) })} />
                  <Input label="Fim" type="time" value={entry.endTime} onChange={(value) => setSiteDraft({ ...siteDraft, businessHours: siteDraft.businessHours.map((item, itemIndex) => itemIndex === index ? { ...item, endTime: value } : item) })} />
                  <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={entry.closed} onChange={(event) => setSiteDraft({ ...siteDraft, businessHours: siteDraft.businessHours.map((item, itemIndex) => itemIndex === index ? { ...item, closed: event.target.checked } : item) })} />Fechado</label>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Rodapé</h2>
            <div className="grid gap-4">
              <Input label="Copyright — use {year} para o ano atual" value={siteDraft.footer.copyrightText} onChange={(value) => setSiteDraft({ ...siteDraft, footer: { ...siteDraft.footer, copyrightText: value } })} />
              <div><label className="text-sm font-medium text-foreground">Aviso legal</label><textarea className="mt-1.5 w-full min-h-24 rounded-xl border border-border bg-input-background px-4 py-3" value={siteDraft.footer.legalDisclaimer} onChange={(event) => setSiteDraft({ ...siteDraft, footer: { ...siteDraft.footer, legalDisclaimer: event.target.value } })} /></div>
              <div className="flex flex-wrap gap-5 text-sm"><label className="flex gap-2"><input type="checkbox" checked={siteDraft.footer.showCnpj} onChange={(event) => setSiteDraft({ ...siteDraft, footer: { ...siteDraft.footer, showCnpj: event.target.checked } })} />Exibir CNPJ</label><label className="flex gap-2"><input type="checkbox" checked={siteDraft.footer.showAddress} onChange={(event) => setSiteDraft({ ...siteDraft, footer: { ...siteDraft.footer, showAddress: event.target.checked } })} />Exibir endereço</label></div>
            </div>
          </section>
          <Btn variant="primary" onClick={() => void saveSite()} disabled={saving}><Save size={15} />Salvar e refletir no site</Btn>
        </div>
      )}

      {tab === "legal" && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="bg-white rounded-xl border border-border p-4 h-fit">
            <Btn variant="primary" fullWidth size="sm" onClick={() => { setCreatingLegal(true); setSelectedSlug(""); setLegalForm(emptyLegalForm); }}><Plus size={14} />Nova página</Btn>
            <div className="mt-4 space-y-2">
              {snapshot?.legalPages.map((page) => (
                <button key={page.slug} onClick={() => selectLegalPage(page)} className={cn("w-full text-left rounded-xl border p-3", selectedSlug === page.slug && !creatingLegal ? "border-primary bg-primary/5" : "border-border hover:bg-secondary")}>
                  <div className="flex items-start justify-between gap-2"><span className="text-sm font-medium text-foreground">{page.title}</span><StatusPill status={page.status} /></div>
                  <p className="text-xs text-muted-foreground mt-1">/{page.slug}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="bg-white rounded-xl border border-border p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-semibold text-foreground">{creatingLegal ? "Nova página legal" : selectedPage?.title ?? "Selecione uma página"}</h2>
                {selectedPage && <p className="text-xs text-muted-foreground mt-1">Versão pública: {selectedPage.publishedVersion ?? "nenhuma"} · {selectedPage.versions.length} versão(ões) preservada(s)</p>}
              </div>
              {!creatingLegal && selectedPage?.status === "published" && <a href={legalPagePath(selectedPage.slug)} target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-1">Abrir no site <ExternalLink size={13} /></a>}
            </div>
            <div className="space-y-4">
              <Input label="Endereço da página" value={legalForm.slug} onChange={(value) => setLegalForm({ ...legalForm, slug: value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} disabled={!creatingLegal} required />
              <Input label="Título" value={legalForm.title} onChange={(value) => setLegalForm({ ...legalForm, title: value })} required />
              <Input label="Resumo" value={legalForm.summary} onChange={(value) => setLegalForm({ ...legalForm, summary: value })} />
              <div><label className="text-sm font-medium text-foreground">Conteúdo do rascunho</label><p className="text-xs text-muted-foreground mb-1.5">Use # para título, ## para subtítulo e - para listas.</p><textarea className="w-full min-h-[360px] rounded-xl border border-border bg-input-background px-4 py-3 font-mono text-sm" value={legalForm.content} onChange={(event) => setLegalForm({ ...legalForm, content: event.target.value })} /></div>
              <div className="flex flex-wrap gap-3">
                <Btn variant="outline" onClick={() => void saveLegalDraft()} disabled={saving}><Save size={14} />Salvar rascunho</Btn>
                {!creatingLegal && <Btn variant="primary" onClick={() => void publishLegal()} disabled={saving}><Send size={14} />Publicar nova versão</Btn>}
                <Btn variant="ghost" onClick={() => void archiveLegal()} disabled={saving}><Archive size={14} />{creatingLegal ? "Cancelar" : "Arquivar"}</Btn>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">Salvar o rascunho não altera o site. A publicação cria uma versão imutável e passa a exibi-la no rodapé e na página pública.</div>
            </div>
          </section>
        </div>
      )}

      {tab === "integracoes" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">Esta tela armazena apenas o modo operacional, o provedor pretendido e o estado da conexão. Chaves, tokens e segredos deverão ficar exclusivamente no backend.</div>
          <section className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4"><Settings2 size={18} className="text-primary" /><h2 className="font-semibold text-foreground">Pagamentos</h2><StatusPill status={integrationsDraft.payments.status} /></div>
            <div className="grid md:grid-cols-2 gap-4">
              <Select label="Modo" options={["manual", "gateway"]} value={integrationsDraft.payments.mode} onChange={(value) => setIntegrationsDraft({ ...integrationsDraft, payments: { ...integrationsDraft.payments, mode: value as "manual" | "gateway" } })} />
              <Input label="Provedor pretendido" value={integrationsDraft.payments.provider} onChange={(value) => setIntegrationsDraft({ ...integrationsDraft, payments: { ...integrationsDraft.payments, provider: value } })} />
              <Input label="Texto público" value={integrationsDraft.payments.publicLabel} onChange={(value) => setIntegrationsDraft({ ...integrationsDraft, payments: { ...integrationsDraft.payments, publicLabel: value } })} />
              <Select label="Estado" options={["not_configured", "ready", "disabled"]} value={integrationsDraft.payments.status} onChange={(value) => setIntegrationsDraft({ ...integrationsDraft, payments: { ...integrationsDraft.payments, status: value as IntegrationSettingsDocument["payments"]["status"] } })} />
            </div>
          </section>
          <section className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4"><Globe size={18} className="text-primary" /><h2 className="font-semibold text-foreground">Notificações</h2></div>
            <div className="grid md:grid-cols-3 gap-4">
              {(["email", "whatsapp", "sms"] as const).map((channel) => {
                const current = integrationsDraft.notifications[channel];
                return <div key={channel} className="rounded-xl border border-border p-4 space-y-3"><div className="flex items-center justify-between"><span className="font-medium text-foreground capitalize">{channel}</span><StatusPill status={current.status} /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={current.enabled} onChange={(event) => setIntegrationsDraft({ ...integrationsDraft, notifications: { ...integrationsDraft.notifications, [channel]: { ...current, enabled: event.target.checked } } })} />Canal habilitado</label><Input label="Provedor" value={current.provider} onChange={(value) => setIntegrationsDraft({ ...integrationsDraft, notifications: { ...integrationsDraft.notifications, [channel]: { ...current, provider: value } } })} /><Select label="Estado" options={["not_configured", "ready", "disabled"]} value={current.status} onChange={(value) => setIntegrationsDraft({ ...integrationsDraft, notifications: { ...integrationsDraft.notifications, [channel]: { ...current, status: value as IntegrationSettingsDocument["notifications"][typeof channel]["status"] } } })} /></div>;
              })}
            </div>
          </section>
          <Btn variant="primary" onClick={() => void saveIntegrations()} disabled={saving}><CheckCircle size={15} />Salvar preparação das integrações</Btn>
        </div>
      )}
    </div>
  );
}
