import React, { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, MessageCircle, RefreshCw, Save, Star, X } from "lucide-react";
import { useNavigate } from "react-router";
import { Btn, StatusBadge, cn } from "../../../components/prototype/PrototypeUI";
import type {
  CustomerExperienceAdminQueue, ReviewStatus, SupportRequest, SupportStatus,
} from "../../../domain/customerExperience/types";
import { formatMoneyFromCents } from "../../../lib/money";
import {
  decideRenewal, loadCustomerExperienceAdminQueue, moderateReview, updateSupportRequest,
} from "../../../services/customerExperience/customerExperienceApi";
import { listAdminQuotes } from "../../../services/quotes/quotesApi";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";

function dateTime(value: string): string { return new Date(value).toLocaleString("pt-BR"); }
function date(value: string): string { return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR"); }
const renewalLabels: Record<string, string> = { pending: "Em análise", approved: "Aprovada", rejected: "Recusada", cancelled: "Cancelada" };
const reviewLabels: Record<string, string> = { published: "Publicada", hidden: "Oculta", rejected: "Recusada" };
const supportLabels: Record<string, string> = { open: "Aberto", in_progress: "Em atendimento", closed: "Concluído" };

type CustomerExperienceTab = "support" | "renewals" | "reviews";

export function AdminCustomerExperience() {
  const navigate = useNavigate();
  const { refreshCatalog } = useCatalog();
  const [queue, setQueue] = useState<CustomerExperienceAdminQueue>({ renewals: [], reviews: [], supportRequests: [] });
  const [quoteCodes, setQuoteCodes] = useState<Record<string, string>>({});
  const [supportDrafts, setSupportDrafts] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<CustomerExperienceTab>("support");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextQueue, quotes] = await Promise.all([
        loadCustomerExperienceAdminQueue(),
        listAdminQuotes(),
      ]);
      setQueue(nextQueue);
      setQuoteCodes(Object.fromEntries(quotes.map((quote) => [quote.id, quote.code])));
      setSupportDrafts((current) => Object.fromEntries(nextQueue.supportRequests.map((item) => [
        item.id,
        current[item.id] ?? item.adminNote,
      ])));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar a fila.");
    } finally {
      setLoading(false);
    }
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

  const supportDecision = async (item: SupportRequest, status: SupportStatus, requireResponse = false) => {
    const adminNote = (supportDrafts[item.id] ?? item.adminNote).trim();
    if (requireResponse && adminNote.length < 2) {
      setError("Escreva uma resposta antes de salvar ou concluir o atendimento.");
      return;
    }
    setSaving(item.id);
    setError("");
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
        const quoteCode = quoteCodes[item.quoteId] ?? item.quoteId.slice(0, 8);
        const response = supportDrafts[item.id] ?? item.adminNote;
        return <article key={item.id} className="rounded-xl border border-border bg-white p-4">
          <div className="flex flex-wrap justify-between gap-3">
            <div><p className="flex items-center gap-2 font-medium"><MessageCircle size={15} />{item.subject}</p><p className="mt-2 text-sm text-muted-foreground">{item.message}</p><p className="mt-2 text-xs text-muted-foreground">Pedido {quoteCode} · {dateTime(item.createdAt)}</p></div>
            <StatusBadge status={supportLabels[item.status]} />
          </div>
          <div className="mt-4 rounded-xl bg-secondary/60 p-3">
            <label htmlFor={`support-response-${item.id}`} className="text-sm font-medium">Resposta ao cliente</label>
            <textarea id={`support-response-${item.id}`} value={response} onChange={(event) => setSupportDrafts((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Escreva a orientação que ficará visível na área do cliente." className="mt-1.5 min-h-24 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm" />
            <p className="mt-1 text-xs text-muted-foreground">A resposta salva aparecerá no histórico deste pedido na conta do cliente.</p>
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-2">
            <Btn variant="ghost" size="sm" onClick={() => navigate(`/admin/orcamentos/${item.quoteId}`)}>Abrir pedido <ArrowRight size={14} /></Btn>
            <div className="flex flex-wrap justify-end gap-2">
              {item.status === "closed" && <Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void supportDecision(item, "in_progress")}>Reabrir atendimento</Btn>}
              {item.status === "open" && <Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void supportDecision(item, "in_progress")}>Marcar em atendimento</Btn>}
              <Btn variant="outline" size="sm" disabled={saving === item.id || response.trim().length < 2} onClick={() => void supportDecision(item, item.status === "closed" ? "closed" : "in_progress", true)}><Save size={14} />Salvar resposta</Btn>
              <Btn variant="primary" size="sm" disabled={saving === item.id || response.trim().length < 2} onClick={() => void supportDecision(item, "closed", true)}>{saving === item.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}Responder e concluir</Btn>
            </div>
          </div>
        </article>;
      })}{!queue.supportRequests.length && <Empty text="Nenhuma solicitação de atendimento." />}</div>}
      {tab === "renewals" && <div className="space-y-3">{queue.renewals.map((item) => <article key={item.id} className="rounded-xl border border-border bg-white p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-medium">Pedido {quoteCodes[item.quoteId] ?? item.quoteId.slice(0, 8)} · nova devolução {date(item.requestedEndDate)}</p><p className="text-sm text-muted-foreground">{item.extensionDays} dias · {formatMoneyFromCents(item.amountCents)} · sem desconto</p>{item.customerNote && <p className="mt-2 text-sm">“{item.customerNote}”</p>}</div><StatusBadge status={renewalLabels[item.status]} /></div>{item.status === "pending" && <div className="mt-4 flex justify-end gap-2"><Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void renewalDecision(item.id, "rejected")}><X size={14} />Recusar</Btn><Btn variant="primary" size="sm" disabled={saving === item.id} onClick={() => void renewalDecision(item.id, "approved")}><Check size={14} />Aprovar</Btn></div>}</article>)}{!queue.renewals.length && <Empty text="Nenhuma renovação solicitada." />}</div>}
      {tab === "reviews" && <div className="space-y-3">{queue.reviews.map((item) => <article key={item.id} className="rounded-xl border border-border bg-white p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-medium">{item.productName} · {item.customerDisplayName}</p><div className="my-2 flex gap-0.5 text-amber-400">{[1,2,3,4,5].map((value) => <Star key={value} size={14} fill={value <= item.rating ? "currentColor" : "none"} />)}</div><p className="text-sm text-muted-foreground">“{item.comment}”</p><p className="mt-2 text-xs text-muted-foreground">{dateTime(item.createdAt)}</p></div><StatusBadge status={reviewLabels[item.status]} /></div><div className="mt-4 flex justify-end gap-2"><Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void reviewDecision(item.id, "hidden")}>Ocultar</Btn><Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void reviewDecision(item.id, "rejected")}>Recusar</Btn><Btn variant="primary" size="sm" disabled={saving === item.id} onClick={() => void reviewDecision(item.id, "published")}>Publicar</Btn></div></article>)}{!queue.reviews.length && <Empty text="Nenhuma avaliação recebida." />}</div>}
    </>}
  </div>;
}

function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{text}</div>; }
