import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, ArrowRight, Calendar, CheckCircle, ChevronRight, Clipboard, Clock, Edit, Eye,
  FileText, Home, Loader2, LogOut, MessageCircle, Package, Plus, RefreshCw, Send, Star,
  Truck, User,
} from "lucide-react";
import type { Page } from "../../domain/shared/types";
import type { NavigateToPage } from "../../app/navigation";
import { Btn, Input, StatusBadge, cn } from "../../components/prototype/PrototypeUI";
import { ImageWithFallback } from "../../app/components/figma/ImageWithFallback";
import { useAppState } from "../../app/providers";
import type { AccountOrderDetail } from "../../domain/customerExperience/types";
import { calculateRentalPrice } from "../../domain/pricing/pricingEngine";
import { formatMoneyFromCents } from "../../lib/money";
import { listAccountQuotes, type PersistedQuote } from "../../services/quotes/quotesApi";
import {
  createSupportRequest, loadAccountOrder, requestRenewal, submitProductReview,
} from "../../services/customerExperience/customerExperienceApi";
import { useCatalog } from "../../stores/catalog/CatalogProvider";

const ACTIVE_RENTAL_STATUSES = ["Aprovado", "Em preparação", "Em locação", "Devolvido", "Concluído"];
const PAYMENT_LABELS: Record<string, string> = { pending: "Pendente", received: "Recebido", partial: "Parcial", refunded: "Reembolsado" };
const RENEWAL_LABELS: Record<string, string> = { pending: "Em análise", approved: "Aprovada", rejected: "Recusada", cancelled: "Cancelada" };
const SUPPORT_LABELS: Record<string, string> = { open: "Aberto", in_progress: "Em atendimento", closed: "Concluído" };
const COMPONENT_ROLE_LABELS: Record<string, string> = { chair: "Cadeira", cover: "Pano", reducer: "Redutor", ball_set: "Bolinhas" };

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  return date.toLocaleDateString("pt-BR");
}
function formatDateTime(value: string | null | undefined): string { return value ? new Date(value).toLocaleString("pt-BR") : "—"; }
function isoPlusDays(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10);
}
function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  return Math.max(0, Math.round((new Date(`${to}T12:00:00`).getTime() - new Date(`${from}T12:00:00`).getTime()) / 86_400_000));
}
function productNames(quote: PersistedQuote): string { return quote.payload.items.map((item) => item.productSnapshot.name).join(", "); }
function fulfillmentLabel(value: string): string { return value === "delivery" ? "Entrega" : value === "pickup" ? "Retirada" : "Combinar"; }
function addressLine(quote: PersistedQuote): string {
  const a = quote.payload.address; return [a.street, a.number, a.complement, a.district, a.city, a.state, a.cep].filter(Boolean).join(", ") || "Não informado";
}

export function AccountLayout({ currentPage, navigate, children, onLogout, userName }: { currentPage: Page; navigate: NavigateToPage; children: React.ReactNode; onLogout: () => void | Promise<void>; userName: string }) {
  const links: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: "account", label: "Visão geral", icon: <Home size={16} /> },
    { page: "account-quotes", label: "Meus orçamentos", icon: <FileText size={16} /> },
    { page: "account-reservations", label: "Minhas locações", icon: <Package size={16} /> },
    { page: "account-contracts", label: "Contratos", icon: <Clipboard size={16} /> },
    { page: "account-profile", label: "Meus dados", icon: <User size={16} /> },
  ];
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"><div className="flex flex-col lg:flex-row gap-8">
    <aside className="lg:w-56 shrink-0"><div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center gap-3 mb-6 px-2"><div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">{userName.slice(0, 1).toUpperCase()}</div><div><p className="font-medium text-foreground text-sm">{userName}</p><p className="text-xs text-muted-foreground">Conta autenticada</p></div></div>
      <nav className="flex flex-col gap-1">{links.map((link) => {
        const active = currentPage === link.page || (currentPage === "account-order" && ["account-quotes", "account-reservations"].includes(link.page));
        return <button key={link.page} onClick={() => navigate(link.page)} className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left", active ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>{link.icon}{link.label}</button>;
      })}<button onClick={() => void onLogout()} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground mt-2"><LogOut size={16} />Sair</button></nav>
    </div></aside><main id="main-content" tabIndex={-1} className="flex-1 min-w-0">{children}</main>
  </div></div>;
}

function useAccountQuotes() {
  const [quotes, setQuotes] = useState<PersistedQuote[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const reload = async () => { setLoading(true); setError(""); try { setQuotes(await listAccountQuotes()); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar seus pedidos."); } finally { setLoading(false); } };
  useEffect(() => { void reload(); }, []);
  return { quotes, loading, error, reload };
}

export function AccountDashboard({ navigate }: { navigate: NavigateToPage }) {
  const { user } = useAppState(); const { quotes, loading } = useAccountQuotes();
  const active = quotes.filter((quote) => quote.status === "Em locação");
  const open = quotes.filter((quote) => ["Em análise", "Aprovado", "Em preparação"].includes(quote.status));
  const returned = quotes.filter((quote) => ["Devolvido", "Concluído"].includes(quote.status));
  const cards = [
    { label: "Locações ativas", value: loading ? "…" : String(active.length), sub: active[0] ? productNames(active[0]) : "Nenhuma locação ativa", color: "text-emerald-600", icon: <Package size={18} className="text-emerald-600" /> },
    { label: "Pedidos em andamento", value: loading ? "…" : String(open.length), sub: "Orçamentos, reservas e preparação", color: "text-amber-600", icon: <FileText size={18} className="text-amber-600" /> },
    { label: "Locações concluídas", value: loading ? "…" : String(returned.length), sub: "Avalie os produtos utilizados", color: "text-primary", icon: <Star size={18} className="text-primary" /> },
  ];
  return <div><h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground mb-6">Olá, {user?.name ?? "Cliente"}</h1>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">{cards.map((card) => <div key={card.label} className="bg-card rounded-2xl border border-border p-5"><div className="flex items-center gap-2 mb-2">{card.icon}<p className="text-sm text-muted-foreground">{card.label}</p></div><p className={cn("text-xl font-bold", card.color)}>{card.value}</p><p className="text-xs text-muted-foreground mt-1">{card.sub}</p></div>)}</div>
    <div className="bg-card rounded-2xl border border-border p-6"><h2 className="font-semibold text-foreground mb-4">Ações rápidas</h2><div className="grid sm:grid-cols-2 gap-3"><Btn variant="outline" onClick={() => navigate("account-quotes")}>Ver meus orçamentos <ArrowRight size={16} /></Btn><Btn variant="outline" onClick={() => navigate("account-reservations")}>Ver minhas locações <ArrowRight size={16} /></Btn><Btn variant="outline" onClick={() => navigate("catalog")}>Solicitar novo orçamento <ArrowRight size={16} /></Btn><Btn variant="outline" onClick={() => navigate("contact")}><MessageCircle size={16} />Falar com atendimento</Btn></div></div>
  </div>;
}

function QuoteCards({ quotes, navigate }: { quotes: PersistedQuote[]; navigate: NavigateToPage }) {
  return <div className="flex flex-col gap-4">{quotes.map((quote) => {
    const firstItem = quote.payload.items[0];
    return <article key={quote.id} className="bg-card rounded-2xl border border-border p-5"><div className="flex items-start justify-between gap-4 mb-3"><div><p className="font-medium text-foreground">{quote.code}</p><p className="text-sm text-muted-foreground">{productNames(quote)}</p></div><StatusBadge status={quote.status} /></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4"><div><p className="text-muted-foreground text-xs">Período</p><p>{firstItem ? `${firstItem.periodDays} dias` : "—"}</p></div><div><p className="text-muted-foreground text-xs">Início</p><p>{formatDate(firstItem?.startDate)}</p></div><div><p className="text-muted-foreground text-xs">Valor</p><p className="font-medium">{formatMoneyFromCents(quote.totalCents)}</p></div><div><p className="text-muted-foreground text-xs">Criado em</p><p>{formatDate(quote.createdAt)}</p></div></div><Btn variant="outline" size="sm" onClick={() => navigate("account-order", { quoteId: quote.id })}><Eye size={14} />Ver detalhes</Btn></article>;
  })}</div>;
}

export function AccountQuotes({ navigate }: { navigate: NavigateToPage }) {
  const { quotes, loading, error, reload } = useAccountQuotes();
  return <div><div className="flex items-center justify-between gap-3 mb-6"><h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl">Meus orçamentos</h1><div className="flex gap-2"><Btn variant="ghost" size="sm" onClick={() => void reload()}><RefreshCw size={14} /></Btn><Btn variant="primary" size="sm" onClick={() => navigate("catalog")}><Plus size={14} />Novo orçamento</Btn></div></div>
    {loading && <LoadingCard text="Carregando orçamentos..." />}{error && <ErrorCard text={error} />}{!loading && !error && quotes.length === 0 && <EmptyCard title="Nenhum orçamento vinculado à sua conta" text="Novos pedidos aparecerão aqui." />}{!loading && !error && <QuoteCards quotes={quotes} navigate={navigate} />}
  </div>;
}

export function AccountReservations({ navigate }: { navigate: NavigateToPage }) {
  const { quotes, loading, error, reload } = useAccountQuotes(); const rentals = quotes.filter((quote) => ACTIVE_RENTAL_STATUSES.includes(quote.status));
  return <div><div className="flex items-center justify-between mb-6"><h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl">Minhas locações</h1><Btn variant="ghost" size="sm" onClick={() => void reload()}><RefreshCw size={14} />Atualizar</Btn></div>
    {loading && <LoadingCard text="Carregando locações..." />}{error && <ErrorCard text={error} />}{!loading && !error && rentals.length === 0 && <EmptyCard title="Nenhuma locação encontrada" text="Quando um pedido for aprovado, ele aparecerá nesta área." />}{!loading && !error && <QuoteCards quotes={rentals} navigate={navigate} />}
  </div>;
}

function LoadingCard({ text }: { text: string }) { return <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground"><Loader2 size={20} className="animate-spin mx-auto mb-2" />{text}</div>; }
function ErrorCard({ text }: { text: string }) { return <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{text}</div>; }
function EmptyCard({ title, text }: { title: string; text: string }) { return <div className="bg-card rounded-2xl border border-border p-10 text-center"><FileText size={32} className="mx-auto text-muted-foreground mb-3" /><p className="font-medium">{title}</p><p className="text-sm text-muted-foreground mt-1">{text}</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="bg-card rounded-2xl border border-border p-5"><h2 className="font-semibold mb-4">{title}</h2>{children}</section>; }

export function AccountOrderDetail() {
  const { quoteId = "" } = useParams(); const routerNavigate = useNavigate(); const { refreshCatalog } = useCatalog();
  const [detail, setDetail] = useState<AccountOrderDetail | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [renewalDate, setRenewalDate] = useState(""); const [renewalNote, setRenewalNote] = useState(""); const [renewalSaving, setRenewalSaving] = useState(false);
  const [supportSubject, setSupportSubject] = useState(""); const [supportMessage, setSupportMessage] = useState(""); const [supportSaving, setSupportSaving] = useState(false);
  const [reviewDrafts, setReviewDrafts] = useState<Record<number, { rating: number; comment: string }>>({}); const [reviewSaving, setReviewSaving] = useState<number | null>(null);
  const reload = async () => { setLoading(true); setError(""); try { const next = await loadAccountOrder(quoteId); setDetail(next); if (!renewalDate && next.effectiveEndDate) setRenewalDate(isoPlusDays(next.effectiveEndDate, 1)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar o pedido."); } finally { setLoading(false); } };
  useEffect(() => { void reload(); }, [quoteId]);
  const extensionDays = detail ? daysBetween(detail.effectiveEndDate, renewalDate) : 0;
  const renewalEstimate = useMemo(() => detail ? detail.quote.payload.items.reduce((sum, item) => sum + calculateRentalPrice({ rates: item.productSnapshot.rates, days: extensionDays, quantity: item.quantity, mode: "renewal", discountPercent: 100 }).totalCents, 0) : 0, [detail, extensionDays]);
  const submitRenewal = async () => { if (!detail || extensionDays < 1) return; setRenewalSaving(true); setError(""); try { await requestRenewal(detail.quote.id, { requestedEndDate: renewalDate, note: renewalNote }); setRenewalNote(""); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível solicitar a renovação."); } finally { setRenewalSaving(false); } };
  const submitSupport = async () => { if (!detail || supportSubject.trim().length < 3 || supportMessage.trim().length < 5) return; setSupportSaving(true); setError(""); try { await createSupportRequest(detail.quote.id, { subject: supportSubject, message: supportMessage }); setSupportSubject(""); setSupportMessage(""); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar a solicitação."); } finally { setSupportSaving(false); } };
  const submitReview = async (index: number) => { if (!detail) return; const draft = reviewDrafts[index] ?? { rating: 5, comment: "" }; if (draft.comment.trim().length < 3) return; setReviewSaving(index); setError(""); try { await submitProductReview(detail.quote.id, { quoteItemIndex: index, ...draft }); await refreshCatalog(); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar a avaliação."); } finally { setReviewSaving(null); } };
  if (loading) return <LoadingCard text="Carregando detalhes..." />;
  if (!detail) return <div><Btn variant="ghost" size="sm" onClick={() => routerNavigate(-1)}><ArrowLeft size={14} />Voltar</Btn><ErrorCard text={error || "Pedido não encontrado."} /></div>;
  const quote = detail.quote;
  return <div className="space-y-5"><button type="button" onClick={() => routerNavigate(-1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} />Voltar</button>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-3"><h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl">{quote.code}</h1><StatusBadge status={quote.status} /></div><p className="text-sm text-muted-foreground mt-1">Atualizado em {formatDateTime(quote.updatedAt)}</p></div><div className="text-right"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-semibold text-primary">{formatMoneyFromCents(quote.totalCents)}</p></div></div>
    {error && <ErrorCard text={error} />}
    <div className="grid lg:grid-cols-3 gap-4"><Panel title="Período"><p className="text-sm text-muted-foreground">Início</p><p className="font-medium">{formatDate(quote.payload.items[0]?.startDate)}</p><p className="text-sm text-muted-foreground mt-3">Devolução vigente</p><p className="font-medium">{formatDate(detail.effectiveEndDate)}</p></Panel><Panel title="Entrega ou retirada"><p className="font-medium">{fulfillmentLabel(quote.payload.fulfillment)}</p><p className="text-sm text-muted-foreground mt-2">{addressLine(quote)}</p><p className="text-sm mt-2">{quote.payload.deliverySlot || "Horário a combinar"}</p></Panel><Panel title="Pagamento"><StatusBadge status={detail.payment ? PAYMENT_LABELS[detail.payment.status] : "Pendente"} /><p className="text-sm text-muted-foreground mt-3">{detail.payment ? formatMoneyFromCents(detail.payment.amountCents) : "Aguardando registro da equipe"}</p></Panel></div>
    <Panel title="Produtos e unidades"><div className="space-y-4">{quote.payload.items.map((item, index) => <article key={item.id} className="flex flex-col sm:flex-row gap-4 rounded-xl border border-border p-4"><ImageWithFallback src={item.productSnapshot.photo} alt={item.productSnapshot.name} className="w-24 h-24 rounded-xl object-cover bg-secondary" /><div className="flex-1"><p className="font-medium">{item.productSnapshot.name}</p><p className="text-sm text-muted-foreground">{item.productSnapshot.assembly ? `${item.productSnapshot.assembly.cover.name}${item.productSnapshot.assembly.reducer ? ` + ${item.productSnapshot.assembly.reducer.name}` : " + sem redutor"}` : item.productSnapshot.description}</p><p className="text-xs text-muted-foreground mt-2">{item.quantity} unidade(s) · {item.periodDays} dias</p>{detail.reviews.find((review) => review.quoteItemIndex === index) && <p className="mt-2 text-sm text-emerald-700 flex items-center gap-1"><CheckCircle size={14} />Avaliação enviada</p>}</div><p className="font-semibold">{formatMoneyFromCents(item.priceSnapshot.totalCents)}</p></article>)}<div className="grid sm:grid-cols-2 gap-2">{detail.allocations.map((allocation) => <div key={allocation.id} className="rounded-xl bg-secondary px-3 py-2"><p className="font-mono text-xs font-medium">{allocation.unitCode}</p><p className="text-xs text-muted-foreground">{COMPONENT_ROLE_LABELS[allocation.componentRole] ?? allocation.componentRole}</p></div>)}</div></div></Panel>
    {detail.renewalEligible && <Panel title="Solicitar renovação"><p className="text-sm text-muted-foreground mb-4">A renovação usa a tarifa vigente e <strong>não recebe desconto</strong>. A equipe confirma a disponibilidade antes da aprovação.</p><div className="grid sm:grid-cols-2 gap-3"><label className="text-sm font-medium">Nova devolução<input type="date" min={isoPlusDays(detail.effectiveEndDate, 1)} value={renewalDate} onChange={(event) => setRenewalDate(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5" /></label><label className="text-sm font-medium">Observação<input value={renewalNote} onChange={(event) => setRenewalNote(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5" /></label></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">Acréscimo estimado · {extensionDays} dia(s)</p><p className="text-lg font-semibold text-primary">{formatMoneyFromCents(renewalEstimate)}</p><p className="text-xs text-muted-foreground">Desconto da renovação: {formatMoneyFromCents(0)}</p></div><Btn variant="primary" disabled={renewalSaving || extensionDays < 1} onClick={() => void submitRenewal()}>{renewalSaving ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}Solicitar renovação</Btn></div></Panel>}
    {detail.renewals.length > 0 && <Panel title="Renovações"><div className="space-y-3">{detail.renewals.map((renewal) => <div key={renewal.id} className="rounded-xl border border-border p-3 flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">Nova devolução: {formatDate(renewal.requestedEndDate)}</p><p className="text-sm text-muted-foreground">{renewal.extensionDays} dias · {formatMoneyFromCents(renewal.amountCents)} · sem desconto</p>{renewal.adminNote && <p className="text-sm mt-1">{renewal.adminNote}</p>}</div><StatusBadge status={RENEWAL_LABELS[renewal.status]} /></div>)}</div></Panel>}
    {detail.reviewEligibleItemIndexes.length > 0 && <Panel title="Avalie os produtos"><div className="space-y-5">{detail.reviewEligibleItemIndexes.map((index) => { const item = quote.payload.items[index]; const draft = reviewDrafts[index] ?? { rating: 5, comment: "" }; return <div key={index} className="rounded-xl border border-border p-4"><p className="font-medium">{item.productSnapshot.name}</p><div className="flex gap-1 my-3">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`${rating} estrelas`} onClick={() => setReviewDrafts((current) => ({ ...current, [index]: { ...draft, rating } }))} className="text-amber-400"><Star size={22} fill={rating <= draft.rating ? "currentColor" : "none"} /></button>)}</div><textarea value={draft.comment} onChange={(event) => setReviewDrafts((current) => ({ ...current, [index]: { ...draft, comment: event.target.value } }))} placeholder="Conte como foi sua experiência" className="w-full rounded-xl border border-border bg-input-background px-3 py-2.5 min-h-24" /><div className="mt-3 flex justify-end"><Btn variant="primary" size="sm" disabled={reviewSaving === index || draft.comment.trim().length < 3} onClick={() => void submitReview(index)}>{reviewSaving === index ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}Enviar avaliação</Btn></div></div>; })}</div></Panel>}
    <Panel title="Arquivos da operação">{detail.attachments.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{detail.attachments.map((attachment) => attachment.mimeType === "application/pdf" ? <a key={attachment.id} href={attachment.contentUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors"><FileText size={28} className="text-primary mb-3"/><p className="text-sm font-medium break-all">{attachment.originalName}</p><p className="mt-1 text-xs text-muted-foreground">Documento PDF · {formatDateTime(attachment.createdAt)}</p><span className="mt-3 inline-flex items-center gap-1 text-xs text-primary"><Eye size={13}/>Abrir documento</span></a> : <figure key={attachment.id} className="rounded-xl overflow-hidden border border-border"><ImageWithFallback src={attachment.contentUrl} alt={attachment.note || attachment.originalName} className="w-full h-40 object-cover bg-secondary" /><figcaption className="p-3 text-xs text-muted-foreground">{attachment.kind === "delivery" ? "Entrega" : attachment.kind === "return" ? "Devolução" : "Evidência"} · {formatDateTime(attachment.createdAt)}</figcaption></figure>)}</div> : <p className="text-sm text-muted-foreground">A equipe ainda não publicou documentos ou fotos para este pedido.</p>}</Panel>
    <Panel title="Acompanhamento"><div className="space-y-3">{detail.events.map((event) => <div key={event.id} className="flex gap-3"><div className="mt-1 w-2.5 h-2.5 rounded-full bg-primary shrink-0" /><div className="flex-1 border-b border-border pb-3"><p className="text-sm font-medium">{event.title}</p><p className="text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</p></div></div>)}{!detail.events.length && <p className="text-sm text-muted-foreground">Aguardando a primeira atualização operacional.</p>}</div></Panel>
    <Panel title="Precisa de ajuda?"><div className="grid sm:grid-cols-2 gap-3"><label className="text-sm font-medium">Assunto<input value={supportSubject} onChange={(event) => setSupportSubject(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5" /></label><label className="text-sm font-medium">Mensagem<textarea value={supportMessage} onChange={(event) => setSupportMessage(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 min-h-24" /></label></div><div className="mt-3 flex justify-end"><Btn variant="outline" size="sm" disabled={supportSaving || supportSubject.trim().length < 3 || supportMessage.trim().length < 5} onClick={() => void submitSupport()}>{supportSaving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Enviar para o atendimento</Btn></div>{detail.supportRequests.length > 0 && <div className="mt-4 space-y-2">{detail.supportRequests.map((item) => <div key={item.id} className="rounded-xl bg-secondary p-3"><div className="flex justify-between gap-2"><p className="text-sm font-medium">{item.subject}</p><StatusBadge status={SUPPORT_LABELS[item.status]} /></div><p className="text-sm text-muted-foreground mt-1">{item.message}</p>{item.adminNote && <p className="text-sm mt-2">Resposta da equipe: {item.adminNote}</p>}</div>)}</div>}</Panel>
  </div>;
}

export function AccountProfile() {
  const { user } = useAppState(); const [editing, setEditing] = useState(false);
  const cpf = user?.cpfDigits ? `${user.cpfDigits.slice(0, 3)}.***.***-${user.cpfDigits.slice(-2)}` : "Não informado";
  return <div><h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl mb-6">Meus dados</h1><div className="bg-card rounded-2xl border border-border p-6 mb-4"><div className="flex items-center justify-between mb-6"><p className="font-semibold">Dados pessoais</p><Btn variant="ghost" size="sm" onClick={() => setEditing(!editing)}><Edit size={14} />{editing ? "Fechar" : "Visualizar"}</Btn></div><div className="grid sm:grid-cols-2 gap-4">{[["Nome completo", user?.name ?? "—"], ["E-mail", user?.email ?? "—"], ["CPF", cpf], ["Telefone", user?.phone ?? "Não informado"]].map(([key, value]) => <div key={key}><p className="text-xs text-muted-foreground">{key}</p><p>{value}</p></div>)}</div>{editing && <p className="mt-4 text-sm text-muted-foreground">A edição cadastral será disponibilizada junto ao módulo de privacidade e conteúdo.</p>}</div><div className="bg-card rounded-2xl border border-border p-6"><p className="font-semibold mb-4">Privacidade e dados</p>{["Exportar meus dados", "Solicitar correção", "Consultar políticas aceitas", "Solicitar exclusão da conta"].map((action) => <button key={action} className="flex items-center justify-between py-2 w-full text-sm text-muted-foreground hover:text-foreground border-b border-border last:border-none"><span>{action}</span><ChevronRight size={14} /></button>)}</div></div>;
}
