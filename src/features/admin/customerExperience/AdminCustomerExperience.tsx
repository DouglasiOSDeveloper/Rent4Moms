import React, { useEffect, useState } from "react";
import { Check, Loader2, MessageCircle, RefreshCw, Star, X } from "lucide-react";
import { Btn, StatusBadge, cn } from "../../../components/prototype/PrototypeUI";
import type { CustomerExperienceAdminQueue, ReviewStatus, SupportStatus } from "../../../domain/customerExperience/types";
import { formatMoneyFromCents } from "../../../lib/money";
import {
  decideRenewal, loadCustomerExperienceAdminQueue, moderateReview, updateSupportRequest,
} from "../../../services/customerExperience/customerExperienceApi";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";

function dateTime(value: string): string { return new Date(value).toLocaleString("pt-BR"); }
function date(value: string): string { return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR"); }
const renewalLabels: Record<string, string> = { pending: "Em análise", approved: "Aprovada", rejected: "Recusada", cancelled: "Cancelada" };
const reviewLabels: Record<string, string> = { published: "Publicada", hidden: "Oculta", rejected: "Recusada" };
const supportLabels: Record<string, string> = { open: "Aberto", in_progress: "Em atendimento", closed: "Concluído" };

export function AdminCustomerExperience() {
  const { refreshCatalog } = useCatalog();
  const [queue, setQueue] = useState<CustomerExperienceAdminQueue>({ renewals: [], reviews: [], supportRequests: [] });
  const [tab, setTab] = useState<"renewals" | "reviews" | "support">("renewals");
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(""); const [error, setError] = useState("");
  const reload = async () => { setLoading(true); setError(""); try { setQueue(await loadCustomerExperienceAdminQueue()); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar a fila."); } finally { setLoading(false); } };
  useEffect(() => { void reload(); }, []);
  const renewalDecision = async (id: string, status: "approved" | "rejected") => { setSaving(id); try { await decideRenewal(id, status); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar a renovação."); } finally { setSaving(""); } };
  const reviewDecision = async (id: string, status: ReviewStatus) => { setSaving(id); try { await moderateReview(id, status); await refreshCatalog(); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível moderar a avaliação."); } finally { setSaving(""); } };
  const supportDecision = async (id: string, status: SupportStatus) => { setSaving(id); try { await updateSupportRequest(id, status); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o atendimento."); } finally { setSaving(""); } };
  return <div>
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6"><div><h1 className="text-xl font-semibold">Experiência do cliente</h1><p className="text-sm text-muted-foreground mt-1">Renovações, avaliações e solicitações de suporte.</p></div><Btn variant="outline" size="sm" onClick={() => void reload()}><RefreshCw size={14} />Atualizar</Btn></div>
    {error && <div role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
    <div className="flex gap-1 border-b border-border mb-5">{[["renewals", `Renovações (${queue.renewals.length})`], ["reviews", `Avaliações (${queue.reviews.length})`], ["support", `Suporte (${queue.supportRequests.length})`]].map(([id, label]) => <button key={id} onClick={() => setTab(id as typeof tab)} className={cn("px-4 py-3 text-sm border-b-2 -mb-px", tab === id ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground")}>{label}</button>)}</div>
    {loading ? <div className="p-12 text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto mb-2" />Carregando...</div> : <>
      {tab === "renewals" && <div className="space-y-3">{queue.renewals.map((item) => <article key={item.id} className="bg-white rounded-xl border border-border p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-medium">Pedido {item.quoteId.slice(0, 8)} · nova devolução {date(item.requestedEndDate)}</p><p className="text-sm text-muted-foreground">{item.extensionDays} dias · {formatMoneyFromCents(item.amountCents)} · sem desconto</p>{item.customerNote && <p className="text-sm mt-2">“{item.customerNote}”</p>}</div><StatusBadge status={renewalLabels[item.status]} /></div>{item.status === "pending" && <div className="mt-4 flex justify-end gap-2"><Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void renewalDecision(item.id, "rejected")}><X size={14} />Recusar</Btn><Btn variant="primary" size="sm" disabled={saving === item.id} onClick={() => void renewalDecision(item.id, "approved")}><Check size={14} />Aprovar</Btn></div>}</article>)}{!queue.renewals.length && <Empty text="Nenhuma renovação solicitada." />}</div>}
      {tab === "reviews" && <div className="space-y-3">{queue.reviews.map((item) => <article key={item.id} className="bg-white rounded-xl border border-border p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-medium">{item.productName} · {item.customerDisplayName}</p><div className="flex gap-0.5 text-amber-400 my-2">{[1,2,3,4,5].map((value) => <Star key={value} size={14} fill={value <= item.rating ? "currentColor" : "none"} />)}</div><p className="text-sm text-muted-foreground">“{item.comment}”</p><p className="text-xs text-muted-foreground mt-2">{dateTime(item.createdAt)}</p></div><StatusBadge status={reviewLabels[item.status]} /></div><div className="mt-4 flex justify-end gap-2"><Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void reviewDecision(item.id, "hidden")}>Ocultar</Btn><Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void reviewDecision(item.id, "rejected")}>Recusar</Btn><Btn variant="primary" size="sm" disabled={saving === item.id} onClick={() => void reviewDecision(item.id, "published")}>Publicar</Btn></div></article>)}{!queue.reviews.length && <Empty text="Nenhuma avaliação recebida." />}</div>}
      {tab === "support" && <div className="space-y-3">{queue.supportRequests.map((item) => <article key={item.id} className="bg-white rounded-xl border border-border p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-medium flex items-center gap-2"><MessageCircle size={15} />{item.subject}</p><p className="text-sm text-muted-foreground mt-2">{item.message}</p><p className="text-xs text-muted-foreground mt-2">Pedido {item.quoteId.slice(0, 8)} · {dateTime(item.createdAt)}</p></div><StatusBadge status={supportLabels[item.status]} /></div><div className="mt-4 flex justify-end gap-2"><Btn variant="outline" size="sm" disabled={saving === item.id} onClick={() => void supportDecision(item.id, "in_progress")}>Em atendimento</Btn><Btn variant="primary" size="sm" disabled={saving === item.id} onClick={() => void supportDecision(item.id, "closed")}>Concluir</Btn></div></article>)}{!queue.supportRequests.length && <Empty text="Nenhuma solicitação de suporte." />}</div>}
    </>}
  </div>;
}
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{text}</div>; }
