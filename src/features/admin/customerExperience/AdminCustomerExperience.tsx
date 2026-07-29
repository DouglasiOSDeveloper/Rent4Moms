import React, { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, MessageCircle, Pencil, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router";
import { RatingStars } from "../../../components/reviews/RatingStars";
import { Btn, StatusBadge, cn } from "../../../components/prototype/PrototypeUI";
import type {
  CustomerExperienceAdminQueue, ManualReviewInput, ProductReview, ReviewStatus, SupportRequest, SupportStatus,
} from "../../../domain/customerExperience/types";
import { formatMoneyFromCents } from "../../../lib/money";
import {
  createManualReview, decideRenewal, deleteManualReview, loadCustomerExperienceAdminQueue, moderateReview,
  setReviewFeatured, updateManualReview, updateSupportRequest,
} from "../../../services/customerExperience/customerExperienceApi";
import { listAdminQuotes } from "../../../services/quotes/quotesApi";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";

function dateTime(value: string): string { return new Date(value).toLocaleString("pt-BR"); }
function date(value: string): string { return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR"); }
function reviewDate(value: string): string { return new Date(value).toLocaleDateString("pt-BR"); }
function today(): string { return new Date().toISOString().slice(0, 10); }
function reviewedAtFromDate(value: string): string { return new Date(`${value}T12:00:00`).toISOString(); }
const renewalLabels: Record<string, string> = { pending: "Em análise", approved: "Aprovada", rejected: "Recusada", cancelled: "Cancelada" };
const reviewLabels: Record<string, string> = { published: "Publicada", hidden: "Oculta", rejected: "Recusada" };
const supportLabels: Record<string, string> = { open: "Aberto", in_progress: "Em atendimento", closed: "Concluído" };

type CustomerExperienceTab = "support" | "renewals" | "reviews";
type ManualReviewDraft = Omit<ManualReviewInput, "reviewedAt"> & { reviewedDate: string };

function emptyReviewDraft(productId = ""): ManualReviewDraft {
  return { productId, customerDisplayName: "", rating: 5, comment: "", status: "published", isFeatured: false, sourceNote: "", reviewedDate: today() };
}

export function AdminCustomerExperience() {
  const navigate = useNavigate();
  const { products, refreshCatalog } = useCatalog();
  const [queue, setQueue] = useState<CustomerExperienceAdminQueue>({ renewals: [], reviews: [], supportRequests: [] });
  const [quoteCodes, setQuoteCodes] = useState<Record<string, string>>({});
  const [supportDrafts, setSupportDrafts] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<CustomerExperienceTab>("support");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [reviewEditorOpen, setReviewEditorOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewDraft, setReviewDraft] = useState<ManualReviewDraft>(() => emptyReviewDraft());

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextQueue, quotes] = await Promise.all([loadCustomerExperienceAdminQueue(), listAdminQuotes()]);
      setQueue(nextQueue);
      setQuoteCodes(Object.fromEntries(quotes.map((quote) => [quote.id, quote.code])));
      setSupportDrafts((current) => Object.fromEntries(nextQueue.supportRequests.map((item) => [item.id, current[item.id] ?? item.adminNote])));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar a fila.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const renewalDecision = async (id: string, status: "approved" | "rejected") => {
    setSaving(id);
    try { await decideRenewal(id, status); await reload(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar a renovação."); }
    finally { setSaving(""); }
  };

  const reviewDecision = async (id: string, status: ReviewStatus) => {
    setSaving(id);
    try { await moderateReview(id, status); await refreshCatalog(); await reload(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível moderar a avaliação."); }
    finally { setSaving(""); }
  };

  const reviewFeaturedDecision = async (id: string, isFeatured: boolean) => {
    setSaving(id); setError("");
    try { await setReviewFeatured(id, isFeatured); await reload(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o destaque da avaliação."); }
    finally { setSaving(""); }
  };

  const openNewReview = () => {
    setEditingReviewId(null);
    setReviewDraft(emptyReviewDraft(products[0]?.id ?? ""));
    setReviewEditorOpen(true);
    setError("");
  };

  const openEditReview = (review: ProductReview) => {
    setEditingReviewId(review.id);
    setReviewDraft({
      productId: review.productId,
      customerDisplayName: review.customerDisplayName,
      rating: review.rating,
      comment: review.comment,
      status: review.status === "published" ? "published" : "hidden",
      isFeatured: review.isFeatured,
      sourceNote: review.sourceNote ?? "",
      reviewedDate: (review.reviewedAt ?? review.createdAt).slice(0, 10),
    });
    setReviewEditorOpen(true);
    setError("");
  };

  const saveExternalReview = async () => {
    if (!reviewDraft.productId || reviewDraft.customerDisplayName.trim().length < 2 || reviewDraft.comment.trim().length < 3 || reviewDraft.sourceNote.trim().length < 2 || !reviewDraft.reviewedDate) {
      setError("Preencha produto, nome, comentário, origem e data do depoimento.");
      return;
    }
    const input: ManualReviewInput = {
      productId: reviewDraft.productId,
      customerDisplayName: reviewDraft.customerDisplayName.trim(),
      rating: reviewDraft.rating,
      comment: reviewDraft.comment.trim(),
      status: reviewDraft.status,
      isFeatured: reviewDraft.status === "published" && reviewDraft.isFeatured,
      sourceNote: reviewDraft.sourceNote.trim(),
      reviewedAt: reviewedAtFromDate(reviewDraft.reviewedDate),
    };
    const key = editingReviewId ?? "new-external-review";
    setSaving(key); setError("");
    try {
      if (editingReviewId) await updateManualReview(editingReviewId, input);
      else await createManualReview(input);
      setReviewEditorOpen(false); setEditingReviewId(null); setReviewDraft(emptyReviewDraft(products[0]?.id ?? ""));
      await refreshCatalog(); await reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar o depoimento."); }
    finally { setSaving(""); }
  };

  const removeExternalReview = async (review: ProductReview) => {
    if (!window.confirm(`Excluir o depoimento externo de ${review.customerDisplayName}?`)) return;
    setSaving(review.id); setError("");
    try { await deleteManualReview(review.id); await refreshCatalog(); await reload(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível excluir o depoimento."); }
    finally { setSaving(""); }
  };

  const supportDecision = async (item: SupportRequest, status: SupportStatus, requireResponse = false) => {
    const adminNote = (supportDrafts[item.id] ?? item.adminNote).trim();
    if (requireResponse && adminNote.length < 2) { setError("Escreva uma resposta antes de salvar ou concluir o atendimento."); return; }
    setSaving(item.id); setError("");
    try { await updateSupportRequest(item.id, status, adminNote); await reload(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o atendimento."); }
    finally { setSaving(""); }
  };

  const tabs: Array<[CustomerExperienceTab, string]> = [
    ["support", `Atendimento (${queue.supportRequests.length})`],
    ["renewals", `Renovações (${queue.renewals.length})`],
    ["reviews", `Avaliações (${queue.reviews.length})`],
  ];

  return <div>
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-xl font-semibold">Atendimento e experiência do cliente</h1><p className="mt-1 text-sm text-muted-foreground">Respostas de suporte, renovações e avaliações recebidas pelo site.</p></div>
      <Btn variant="outline" size="sm" onClick={() => void reload()}><RefreshCw size={14} />Atualizar</Btn>
    </div>
    {error && <div role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">{tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={cn("-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm", tab === id ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground")}>{label}</button>)}</div>
    {loading ? <div className="p-12 text-center text-muted-foreground"><Loader2 className="mx-auto mb-2 animate-spin" />Carregando...</div> : <>
      {tab === "support" && <div className="space-y-3">{queue.supportRequests.map((item) => {
        const quoteCode = quoteCodes[item.quoteId] ?? item.quoteId.slice(0, 8); const response = supportDrafts[item.id] ?? item.adminNote;
        return <article key={item.id} className="rounded-xl border border-border bg-white p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="flex items-center gap-2 font-medium"><MessageCircle size={15} />{item.subject}</p><p className="mt-2 text-sm text-muted-foreground">{item.message}</p><p className="mt-2 text-xs text-muted-foreground">Pedido {quoteCode} · {dateTime(item.createdAt)}</p></div><StatusBadge status={supportLabels[item.status]} /></div><div className="mt-4 rounded-xl bg-secondary/60 p-3"><label htmlFor={`support-response-${item.id}`} className="text-sm font-medium">Resposta ao cliente</label><textarea id={`support-response-${item.id}`} value={response} onChange={(event) => setSupportDrafts((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Escreva a orientação que ficará visível na área do cliente." className="mt-1.5 min-h-24 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm" /><p className="mt-1 text-xs text-muted-foreground">A resposta salva aparecerá no histórico deste pedido na conta do cliente.</p></div><div className="mt-4 flex flex-wrap justify-between gap-2"><Btn variant="ghost" size="sm" onClick={() => navigate(`/admin/orcamentos/${item.quoteId}`)}>Abrir pedido <ArrowRight size={14} /></Btn><div className="flex flex-wrap justify-end gap-2">{item.status === "closed" && <Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void supportDecision(item, "in_progress")}>Reabrir atendimento</Btn>}{item.status === "open" && <Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void supportDecision(item, "in_progress")}>Marcar em atendimento</Btn>}<Btn variant="outline" size="sm" disabled={saving === item.id || response.trim().length < 2} onClick={() => void supportDecision(item, item.status === "closed" ? "closed" : "in_progress", true)}><Save size={14} />Salvar resposta</Btn><Btn variant="primary" size="sm" disabled={saving === item.id || response.trim().length < 2} onClick={() => void supportDecision(item, "closed", true)}>{saving === item.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}Responder e concluir</Btn></div></div></article>;
      })}{!queue.supportRequests.length && <Empty text="Nenhuma solicitação de atendimento." />}</div>}
      {tab === "renewals" && <div className="space-y-3">{queue.renewals.map((item) => <article key={item.id} className="rounded-xl border border-border bg-white p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-medium">Pedido {quoteCodes[item.quoteId] ?? item.quoteId.slice(0, 8)} · nova devolução {date(item.requestedEndDate)}</p><p className="text-sm text-muted-foreground">{item.extensionDays} dias · {formatMoneyFromCents(item.amountCents)} · sem desconto</p>{item.customerNote && <p className="mt-2 text-sm">“{item.customerNote}”</p>}</div><StatusBadge status={renewalLabels[item.status]} /></div>{item.status === "pending" && <div className="mt-4 flex justify-end gap-2"><Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void renewalDecision(item.id, "rejected")}><X size={14} />Recusar</Btn><Btn variant="primary" size="sm" disabled={saving === item.id} onClick={() => void renewalDecision(item.id, "approved")}><Check size={14} />Aprovar</Btn></div>}</article>)}{!queue.renewals.length && <Empty text="Nenhuma renovação solicitada." />}</div>}
      {tab === "reviews" && <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">Avaliações e depoimentos</p><p className="text-sm text-muted-foreground">Avaliações de clientes são verificadas pela locação. Depoimentos externos ficam identificados publicamente.</p></div><Btn variant="primary" size="sm" onClick={openNewReview}><Plus size={14} />Novo depoimento externo</Btn></div>
        {reviewEditorOpen && <ExternalReviewEditor draft={reviewDraft} setDraft={setReviewDraft} products={products} editing={Boolean(editingReviewId)} saving={saving === (editingReviewId ?? "new-external-review")} onCancel={() => { setReviewEditorOpen(false); setEditingReviewId(null); }} onSave={() => void saveExternalReview()} />}
        {queue.reviews.map((item) => <article key={item.id} className="rounded-xl border border-border bg-white p-4"><div className="flex flex-wrap justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{item.productName} · {item.customerDisplayName}</p><span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{item.source === "external_testimonial" ? "Depoimento externo" : "Cliente verificado"}</span></div><RatingStars rating={item.rating} size={14} className="my-2" /><p className="text-sm text-muted-foreground">“{item.comment}”</p>{item.source === "external_testimonial" && <p className="mt-2 text-xs text-muted-foreground">Origem registrada: {item.sourceNote}</p>}<p className="mt-2 text-xs text-muted-foreground">{reviewDate(item.reviewedAt ?? item.createdAt)}{item.quoteId ? ` · Pedido ${quoteCodes[item.quoteId] ?? item.quoteId.slice(0, 8)}` : ""}</p></div><StatusBadge status={reviewLabels[item.status]} /></div><div className="mt-4 flex flex-wrap items-center justify-between gap-2"><label className={`flex items-center gap-2 text-sm ${item.status === "published" ? "text-foreground" : "text-muted-foreground"}`}><input type="checkbox" checked={item.isFeatured} disabled={item.status !== "published" || saving === item.id} onChange={(event) => void reviewFeaturedDecision(item.id, event.target.checked)} className="accent-primary" />Exibir na página inicial</label><div className="flex flex-wrap justify-end gap-2">{item.source === "external_testimonial" && <><Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => openEditReview(item)}><Pencil size={14} />Editar</Btn><Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void removeExternalReview(item)}><Trash2 size={14} />Excluir</Btn></>}<Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void reviewDecision(item.id, "hidden")}>Ocultar</Btn><Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void reviewDecision(item.id, "rejected")}>Recusar</Btn><Btn variant="primary" size="sm" disabled={saving === item.id} onClick={() => void reviewDecision(item.id, "published")}>Publicar</Btn></div></div></article>)}
        {!queue.reviews.length && !reviewEditorOpen && <Empty text="Nenhuma avaliação recebida." />}
      </div>}
    </>}
  </div>;
}

function ExternalReviewEditor({ draft, setDraft, products, editing, saving, onCancel, onSave }: {
  draft: ManualReviewDraft;
  setDraft: React.Dispatch<React.SetStateAction<ManualReviewDraft>>;
  products: Array<{ id: string; name: string }>;
  editing: boolean;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return <section className="rounded-xl border border-primary/30 bg-primary/5 p-5"><div className="mb-4"><h2 className="font-semibold">{editing ? "Editar depoimento externo" : "Cadastrar depoimento externo"}</h2><p className="mt-1 text-xs text-muted-foreground">Cadastre apenas feedback real recebido por outro canal e autorizado para publicação. O site identifica este conteúdo como depoimento externo.</p></div><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium">Produto<select value={draft.productId} onChange={(event) => setDraft((current) => ({ ...current, productId: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5"><option value="">Selecione</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><label className="text-sm font-medium">Nome de exibição<input value={draft.customerDisplayName} onChange={(event) => setDraft((current) => ({ ...current, customerDisplayName: event.target.value }))} placeholder="Ex.: Família S." className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5" /></label><label className="text-sm font-medium">Nota<select value={draft.rating} onChange={(event) => setDraft((current) => ({ ...current, rating: Number(event.target.value) }))} className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5">{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} estrela{rating !== 1 ? "s" : ""}</option>)}</select></label><label className="text-sm font-medium">Data do feedback<input type="date" value={draft.reviewedDate} onChange={(event) => setDraft((current) => ({ ...current, reviewedDate: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5" /></label><label className="text-sm font-medium md:col-span-2">Origem e autorização<input value={draft.sourceNote} onChange={(event) => setDraft((current) => ({ ...current, sourceNote: event.target.value }))} placeholder="Ex.: WhatsApp, com autorização para publicação." className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5" /></label><label className="text-sm font-medium md:col-span-2">Comentário<textarea rows={4} value={draft.comment} onChange={(event) => setDraft((current) => ({ ...current, comment: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5" /></label><label className="text-sm font-medium">Publicação<select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as "published" | "hidden", isFeatured: event.target.value === "published" ? current.isFeatured : false }))} className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5"><option value="published">Publicar no produto</option><option value="hidden">Manter oculto</option></select></label><label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={draft.isFeatured} disabled={draft.status !== "published"} onChange={(event) => setDraft((current) => ({ ...current, isFeatured: event.target.checked }))} className="accent-primary" />Exibir também na página inicial</label></div><div className="mt-5 flex justify-end gap-2"><Btn variant="outline" size="sm" disabled={saving} onClick={onCancel}>Cancelar</Btn><Btn variant="primary" size="sm" disabled={saving} onClick={onSave}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Salvar depoimento</Btn></div></section>;
}

function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{text}</div>; }
