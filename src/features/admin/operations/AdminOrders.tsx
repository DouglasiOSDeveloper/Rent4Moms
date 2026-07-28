import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ImageWithFallback } from "../../../app/components/figma/ImageWithFallback";
import { useNavigate, useParams } from "react-router";
import {
  AlertCircle, Archive, ArrowLeft, Camera, CheckCircle, Clock, CreditCard, Droplets,
  Eye, FileText, Loader2, Package, Plus, RefreshCw, Save, Search, Send, Trash2, Truck,
  Upload, Wrench, XCircle,
} from "lucide-react";
import { Btn, StatusBadge, cn } from "../../../components/prototype/PrototypeUI";
import type { InventoryAllocation } from "../../../domain/inventory/types";
import type {
  AttachmentKind, MaintenanceJob, ManualPayment, OrderOperationDetail, PaymentMethod, PaymentStatus,
} from "../../../domain/operations/types";
import { formatMoneyFromCents } from "../../../lib/money";
import {
  addOrderNote, applyOrderLifecycle, createHygieneJobs, createMaintenanceJobs,
  deleteOperationalAttachment, loadOrderOperation, saveManualPayment, uploadOperationalAttachment,
} from "../../../services/operations/operationsApi";
import { listAdminQuotes, type PersistedQuote } from "../../../services/quotes/quotesApi";
import { listAdminReservations } from "../../../services/admin/adminApi";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";
import { lifecycleActionState, type LifecycleActionId } from "./orderLifecycleUi";

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendente", received: "Recebido", partial: "Parcial", refunded: "Reembolsado",
};
const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix", card: "Cartão", transfer: "Transferência", cash: "Dinheiro", payment_link: "Link de pagamento", other: "Outro",
};
const ROLE_LABELS: Record<InventoryAllocation["componentRole"], string> = {
  chair: "Cadeira", cover: "Pano", reducer: "Redutor", ball_set: "Bolinhas",
};
const ATTACHMENT_LABELS: Record<AttachmentKind, string> = {
  delivery: "Entrega", return: "Devolução", damage: "Avaria", hygiene: "Higienização", maintenance: "Manutenção", document: "Documento",
};

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}
function fulfillmentLabel(value: string): string {
  return value === "delivery" ? "Entrega" : value === "pickup" ? "Retirada" : "Combinar";
}
function addressLine(quote: PersistedQuote): string {
  const address = quote.payload.address;
  return [address.street, address.number, address.complement, address.district, address.city, address.state, address.cep].filter(Boolean).join(", ") || "Não informado";
}
function paymentStatusLabel(payment: ManualPayment | null): string {
  return payment ? PAYMENT_LABELS[payment.status] : "Pendente";
}

export function AdminOrdersList({ reservationsOnly = false }: { reservationsOnly?: boolean }) {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<PersistedQuote[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const statuses = reservationsOnly
    ? ["Todos", "Aprovado", "Em preparação", "Em locação", "Devolvido"]
    : ["Todos", "Em análise", "Aprovado", "Em preparação", "Em locação", "Devolvido", "Expirado", "Cancelado"];

  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try { setQuotes(await (reservationsOnly ? listAdminReservations() : listAdminQuotes())); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar os pedidos."); }
    finally { setLoading(false); }
  }, [reservationsOnly]);
  useEffect(() => { void reload(); }, [reload]);

  const filtered = useMemo(() => quotes.filter((quote) => {
    if (reservationsOnly && !["Aprovado", "Em preparação", "Em locação", "Devolvido"].includes(quote.status)) return false;
    const matchesStatus = status === "Todos" || quote.status === status;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || `${quote.code} ${quote.customerName} ${quote.customerEmail}`.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  }), [quotes, reservationsOnly, search, status]);

  return <div>
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{reservationsOnly ? "Reservas e locações" : "Orçamentos e pedidos"}</h1>
        <p className="text-sm text-muted-foreground mt-1">Abra um pedido para controlar pagamento, entrega, devolução, fotos e unidades.</p>
      </div>
      <Btn variant="outline" size="sm" onClick={() => void reload()}><RefreshCw size={14}/>Atualizar</Btn>
    </div>
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Buscar por código, cliente ou e-mail" className="w-full rounded-xl border border-border bg-input-background pl-9 pr-4 py-2 text-sm"/></div>
        <select value={status} onChange={(event)=>setStatus(event.target.value)} className="rounded-xl border border-border bg-input-background px-3 py-2 text-sm">{statuses.map((item)=><option key={item}>{item}</option>)}</select>
      </div>
      {error&&<div role="alert" className="m-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}
      {loading?<div className="p-12 text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto mb-2"/>Carregando...</div>:<div className="overflow-x-auto"><table className="w-full"><thead className="bg-secondary border-b border-border"><tr>{["Pedido","Cliente","Produto","Período","Valor","Status","Criado em",""] .map((header)=><th key={header} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">{header}</th>)}</tr></thead><tbody className="divide-y divide-border">{filtered.map((quote)=>{const first=quote.payload.items[0];return <tr key={quote.id} className="hover:bg-secondary/50"><td className="px-4 py-3 text-sm font-mono font-medium">{quote.code}</td><td className="px-4 py-3"><p className="text-sm font-medium">{quote.customerName}</p><p className="text-xs text-muted-foreground">{quote.customerEmail}</p></td><td className="px-4 py-3 text-sm text-muted-foreground">{quote.payload.items.map((item)=>item.productSnapshot.name).join(", ")}</td><td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{first?`${first.periodDays} dias`:"—"}</td><td className="px-4 py-3 text-sm font-medium">{formatMoneyFromCents(quote.totalCents)}</td><td className="px-4 py-3"><StatusBadge status={quote.status}/></td><td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(quote.createdAt)}</td><td className="px-4 py-3"><button type="button" onClick={()=>navigate(`/admin/orcamentos/${quote.id}`)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-primary hover:bg-primary/5"><Eye size={14}/>Abrir</button></td></tr>;})}{filtered.length===0&&<tr><td colSpan={8} className="p-12 text-center text-muted-foreground">Nenhum pedido encontrado.</td></tr>}</tbody></table></div>}
    </div>
  </div>;
}

function Panel({ title, icon, children, actions }: { title: string; icon?: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode }) {
  return <section className="bg-white rounded-xl border border-border overflow-hidden"><div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border"><div className="flex items-center gap-2 font-semibold text-foreground">{icon}{title}</div>{actions}</div><div className="p-5">{children}</div></section>;
}

function PaymentPanel({ detail, onSaved }: { detail: OrderOperationDetail; onSaved: (payment: ManualPayment) => void }) {
  const [status, setStatus] = useState<PaymentStatus>(detail.payment?.status ?? "pending");
  const [method, setMethod] = useState<PaymentMethod>(detail.payment?.method ?? "pix");
  const [amount, setAmount] = useState(((detail.payment?.amountCents ?? detail.quote.totalCents) / 100).toFixed(2));
  const [receivedAt, setReceivedAt] = useState(detail.payment?.receivedAt?.slice(0,16) ?? "");
  const [note, setNote] = useState(detail.payment?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    setSaving(true); setError("");
    try {
      const payment = await saveManualPayment(detail.quote.id, { status, method, amountCents: Math.max(0, Math.round(Number(amount.replace(",","."))*100)), receivedAt: receivedAt ? new Date(receivedAt).toISOString() : null, note });
      onSaved(payment);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar o pagamento."); }
    finally { setSaving(false); }
  };
  return <Panel title="Pagamento manual" icon={<CreditCard size={17} className="text-primary"/>} actions={<StatusBadge status={paymentStatusLabel(detail.payment)}/>}>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <label className="text-sm font-medium">Status<select value={status} onChange={(event)=>setStatus(event.target.value as PaymentStatus)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5">{Object.entries(PAYMENT_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-sm font-medium">Forma<select value={method} onChange={(event)=>setMethod(event.target.value as PaymentMethod)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5">{Object.entries(PAYMENT_METHOD_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-sm font-medium">Valor recebido<input value={amount} onChange={(event)=>setAmount(event.target.value)} inputMode="decimal" className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5"/></label>
      <label className="text-sm font-medium">Data do recebimento<div className="mt-1.5 flex w-full min-w-0 rounded-xl border border-border bg-input-background px-3 py-2.5"><input type="datetime-local" value={receivedAt} onChange={(event)=>setReceivedAt(event.target.value)} className="block w-full min-w-0 border-0 bg-transparent p-0"/></div></label>
    </div>
    <label className="mt-4 block text-sm font-medium">Observação<textarea value={note} onChange={(event)=>setNote(event.target.value)} rows={2} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5 resize-y"/></label>
    {error&&<p className="mt-3 text-sm text-destructive">{error}</p>}
    <div className="mt-4 flex justify-end"><Btn variant="primary" size="sm" disabled={saving} onClick={()=>void save()}>{saving?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}Salvar pagamento</Btn></div>
  </Panel>;
}

function EvidenceUploader({ detail, onUploaded }: { detail: OrderOperationDetail; onUploaded: () => Promise<void> }) {
  const [kind, setKind] = useState<AttachmentKind>("delivery");
  const [unitId, setUnitId] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const upload = async () => {
    if (!files.length) { setError("Selecione ao menos uma foto."); return; }
    setUploading(true); setError("");
    try {
      for (const file of files) await uploadOperationalAttachment(detail.quote.id, { file, kind, unitId: unitId || undefined, note });
      setFiles([]); setNote(""); await onUploaded();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar as fotos."); }
    finally { setUploading(false); }
  };
  const remove = async (id: string) => {
    try { await deleteOperationalAttachment(id); await onUploaded(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível remover a foto."); }
  };
  return <Panel title="Fotos e evidências" icon={<Camera size={17} className="text-primary"/>}>
    <div className="grid sm:grid-cols-3 gap-3">
      <label className="text-sm font-medium">Tipo<select value={kind} onChange={(event)=>setKind(event.target.value as AttachmentKind)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5">{Object.entries(ATTACHMENT_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-sm font-medium">Unidade relacionada<select value={unitId} onChange={(event)=>setUnitId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5"><option value="">Pedido inteiro</option>{detail.allocations.map((allocation)=><option key={allocation.unitId} value={allocation.unitId}>{allocation.unitCode} · {ROLE_LABELS[allocation.componentRole]}</option>)}</select></label>
      <label className="text-sm font-medium">Fotos<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event)=>setFiles(Array.from(event.target.files ?? []))} className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm"/></label>
    </div>
    <label className="mt-3 block text-sm font-medium">Observação da evidência<input value={note} onChange={(event)=>setNote(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5"/></label>
    {error&&<p className="mt-3 text-sm text-destructive">{error}</p>}
    <div className="mt-4 flex justify-end"><Btn variant="primary" size="sm" disabled={uploading} onClick={()=>void upload()}>{uploading?<Loader2 size={14} className="animate-spin"/>:<Upload size={14}/>}Enviar {files.length||""} foto{files.length===1?"":"s"}</Btn></div>
    <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{detail.attachments.map((attachment)=><article key={attachment.id} className="rounded-xl border border-border overflow-hidden"><ImageWithFallback src={attachment.contentUrl} alt={`${ATTACHMENT_LABELS[attachment.kind]} do pedido ${detail.quote.code}`} className="h-40 w-full object-cover bg-secondary"/><div className="p-3"><div className="flex justify-between gap-2"><div><p className="text-sm font-medium">{ATTACHMENT_LABELS[attachment.kind]}</p><p className="text-xs text-muted-foreground">{formatDateTime(attachment.createdAt)}</p></div><button type="button" onClick={()=>void remove(attachment.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 size={14}/></button></div>{attachment.note&&<p className="mt-2 text-xs text-muted-foreground">{attachment.note}</p>}</div></article>)}{!detail.attachments.length&&<p className="sm:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhuma foto enviada.</p>}</div>
  </Panel>;
}

function OperationsPanel({ detail, onUpdated }: { detail: OrderOperationDetail; onUpdated: (detail: OrderOperationDetail) => void }) {
  const [action, setAction] = useState<LifecycleActionId | null>(null);
  const [note, setNote] = useState("");
  const [responsible, setResponsible] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const execute = async () => {
    if (!action) return;
    setSaving(true); setError("");
    try { onUpdated(await applyOrderLifecycle(detail.quote.id, { action, note, responsible, occurredAt: new Date().toISOString() })); setAction(null); setNote(""); setResponsible(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o pedido."); }
    finally { setSaving(false); }
  };
  const actions: Array<{ id: LifecycleActionId; label: string; icon: React.ReactNode }> = [
    { id:"reserve",label:"Aprovar e reservar",icon:<CheckCircle size={14}/> },
    { id:"prepare",label:"Iniciar preparação",icon:<Package size={14}/> },
    { id:"deliver",label:"Marcar como entregue",icon:<Truck size={14}/> },
    { id:"return",label:"Registrar devolução",icon:<Archive size={14}/> },
    { id:"cancel",label:"Cancelar e liberar",icon:<XCircle size={14}/> },
  ];
  return <Panel title="Ações do pedido" icon={<Truck size={17} className="text-primary"/>} actions={<StatusBadge status={detail.quote.status}/>}>
    <div className="flex flex-wrap gap-2">{actions.map((item)=>{
      const state = lifecycleActionState(detail.quote.status, item.id);
      const selected = action === item.id;
      const disabled = saving || state !== "available";
      const variant = item.id === "cancel"
        ? (selected || state === "current" ? "danger" : state === "available" ? "danger" : "outline")
        : (selected || state === "current" ? "primary" : state === "completed" ? "secondary" : "outline");
      return <Btn
        key={item.id}
        variant={variant}
        size="sm"
        disabled={disabled}
        className={cn(
          state === "current" && "!opacity-100 ring-2 ring-primary/20",
          state === "completed" && "!opacity-100 border-emerald-200 bg-emerald-50 text-emerald-700",
          state === "blocked" && "opacity-45",
          selected && state === "available" && "ring-2 ring-primary/30",
        )}
        onClick={()=>setAction(item.id)}
      >{item.icon}{item.label}</Btn>;
    })}</div>
    <p className="mt-3 text-xs text-muted-foreground">Envie as fotos de entrega ou devolução na seção de evidências antes de registrar a ação correspondente.</p>
    {action&&<div className="mt-5 rounded-xl border border-border bg-secondary/50 p-4"><h3 className="font-medium">Confirmar: {actions.find((item)=>item.id===action)?.label}</h3><div className="mt-3 grid sm:grid-cols-2 gap-3"><label className="text-sm font-medium">Responsável<input value={responsible} onChange={(event)=>setResponsible(event.target.value)} placeholder="Nome da pessoa responsável" className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5"/></label><label className="text-sm font-medium">Observação<input value={note} onChange={(event)=>setNote(event.target.value)} placeholder="Estado, ocorrência ou orientação" className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5"/></label></div>{error&&<p className="mt-3 text-sm text-destructive">{error}</p>}<div className="mt-4 flex justify-end gap-2"><Btn variant="ghost" size="sm" onClick={()=>setAction(null)}>Voltar</Btn><Btn variant="primary" size="sm" disabled={saving} onClick={()=>void execute()}>{saving?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}Confirmar</Btn></div></div>}
  </Panel>;
}

function UnitJobsPanel({ detail, onUpdated }: { detail: OrderOperationDetail; onUpdated: () => Promise<void> }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [responsible, setResponsible] = useState("");
  const [notes, setNotes] = useState("");
  const [problem, setProblem] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const toggle = (id: string) => setSelected((current)=>current.includes(id)?current.filter((item)=>item!==id):[...current,id]);
  const createHygiene = async () => {
    if (!selected.length || responsible.trim().length<2) { setError("Selecione unidades e informe o responsável."); return; }
    setSaving(true); setError(""); try { await createHygieneJobs({ quoteId: detail.quote.id, unitIds:selected, responsible, notes }); setSelected([]); await onUpdated(); } catch(cause){setError(cause instanceof Error?cause.message:"Não foi possível iniciar a higienização.");} finally{setSaving(false);}
  };
  const createMaintenance = async () => {
    if (!selected.length || responsible.trim().length<2 || problem.trim().length<2) { setError("Selecione unidades, informe o responsável e descreva o problema."); return; }
    setSaving(true); setError(""); try { await createMaintenanceJobs({ quoteId: detail.quote.id, unitIds:selected, maintenanceType:"corrective", problem, responsible }); setSelected([]); await onUpdated(); } catch(cause){setError(cause instanceof Error?cause.message:"Não foi possível abrir a manutenção.");} finally{setSaving(false);}
  };
  return <Panel title="Destino das unidades devolvidas" icon={<Droplets size={17} className="text-primary"/>}>
    <div className="grid sm:grid-cols-2 gap-2">{detail.allocations.map((allocation)=><label key={allocation.unitId} className={cn("flex items-center gap-3 rounded-xl border p-3 cursor-pointer",selected.includes(allocation.unitId)?"border-primary bg-primary/5":"border-border")}><input type="checkbox" checked={selected.includes(allocation.unitId)} onChange={()=>toggle(allocation.unitId)}/><div><p className="text-sm font-mono font-medium">{allocation.unitCode}</p><p className="text-xs text-muted-foreground">{ROLE_LABELS[allocation.componentRole]}</p></div></label>)}</div>
    <div className="mt-4 grid sm:grid-cols-2 gap-3"><label className="text-sm font-medium">Responsável<input value={responsible} onChange={(event)=>setResponsible(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5"/></label><label className="text-sm font-medium">Observação da higienização<input value={notes} onChange={(event)=>setNotes(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5"/></label></div>
    <label className="mt-3 block text-sm font-medium">Problema para manutenção<input value={problem} onChange={(event)=>setProblem(event.target.value)} placeholder="Preencha apenas ao encaminhar para manutenção" className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5"/></label>
    {error&&<p className="mt-3 text-sm text-destructive">{error}</p>}
    <div className="mt-4 flex flex-wrap justify-end gap-2"><Btn variant="outline" size="sm" disabled={saving} onClick={()=>void createHygiene()}><Droplets size={14}/>Enviar para higienização</Btn><Btn variant="outline" size="sm" disabled={saving} onClick={()=>void createMaintenance()}><Wrench size={14}/>Enviar para manutenção</Btn></div>
    {(detail.hygieneJobs.length>0||detail.maintenanceJobs.length>0)&&<div className="mt-5 grid sm:grid-cols-2 gap-3">{detail.hygieneJobs.map((job)=><div key={job.id} className="rounded-xl border border-border p-3"><p className="text-sm font-medium">Higienização · {job.unitCode}</p><p className="text-xs text-muted-foreground mt-1">{job.responsible} · {job.status}</p></div>)}{detail.maintenanceJobs.map((job:MaintenanceJob)=><div key={job.id} className="rounded-xl border border-border p-3"><p className="text-sm font-medium">Manutenção · {job.unitCode}</p><p className="text-xs text-muted-foreground mt-1">{job.responsible} · {job.status}</p></div>)}</div>}
  </Panel>;
}

export function AdminOrderDetail() {
  const { quoteId = "" } = useParams();
  const navigate = useNavigate();
  const { refreshCatalog } = useCatalog();
  const [detail, setDetail] = useState<OrderOperationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const reload = async () => {
    setLoading(true); setError("");
    try { setDetail(await loadOrderOperation(quoteId)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar o pedido."); }
    finally { setLoading(false); }
  };
  useEffect(()=>{void reload();},[quoteId]);
  const applyDetail = (next: OrderOperationDetail) => { setDetail(next); void refreshCatalog(); };
  const saveNote = async () => {
    if (!note.trim()) return; setNoteSaving(true); setError("");
    try { await addOrderNote(quoteId,note); setNote(""); await reload(); }
    catch(cause){setError(cause instanceof Error?cause.message:"Não foi possível salvar a observação.");}
    finally{setNoteSaving(false);}
  };
  if (loading) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto mb-2"/>Carregando pedido...</div>;
  if (!detail) return <div><Btn variant="ghost" size="sm" onClick={()=>navigate("/admin/orcamentos")}><ArrowLeft size={14}/>Voltar</Btn><div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-destructive">{error||"Pedido não encontrado."}</div></div>;
  const { quote } = detail;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><button type="button" onClick={()=>navigate("/admin/orcamentos")} className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14}/>Voltar aos pedidos</button><div className="flex flex-wrap items-center gap-3"><h1 className="text-xl font-semibold">{quote.code}</h1><StatusBadge status={quote.status}/></div><p className="text-sm text-muted-foreground mt-1">Criado em {formatDateTime(quote.createdAt)} · atualizado em {formatDateTime(quote.updatedAt)}</p></div><div className="text-right"><p className="text-sm text-muted-foreground">Total do pedido</p><p className="text-2xl font-semibold text-primary">{formatMoneyFromCents(quote.totalCents)}</p></div></div>
    {error&&<div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}
    <div className="grid lg:grid-cols-3 gap-5">
      <Panel title="Cliente" icon={<FileText size={17} className="text-primary"/>}><dl className="space-y-2 text-sm"><div><dt className="text-muted-foreground">Nome</dt><dd className="font-medium">{quote.customerName}</dd></div><div><dt className="text-muted-foreground">E-mail</dt><dd>{quote.customerEmail}</dd></div><div><dt className="text-muted-foreground">CPF</dt><dd>{quote.customerCpfDigits}</dd></div><div><dt className="text-muted-foreground">Telefone</dt><dd>{quote.payload.customerData.phone}</dd></div></dl></Panel>
      <Panel title="Entrega ou retirada" icon={<Truck size={17} className="text-primary"/>}><dl className="space-y-2 text-sm"><div><dt className="text-muted-foreground">Modalidade</dt><dd className="font-medium">{fulfillmentLabel(quote.payload.fulfillment)}</dd></div><div><dt className="text-muted-foreground">Endereço</dt><dd>{addressLine(quote)}</dd></div><div><dt className="text-muted-foreground">Janela</dt><dd>{quote.payload.deliverySlot||"A combinar"}</dd></div></dl></Panel>
      <Panel title="Estoque alocado" icon={<Package size={17} className="text-primary"/>}><div className="space-y-2">{detail.allocations.map((allocation)=><div key={allocation.id} className="flex items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-2"><div><p className="text-xs font-mono font-medium">{allocation.unitCode}</p><p className="text-xs text-muted-foreground">{ROLE_LABELS[allocation.componentRole]}</p></div><StatusBadge status={allocation.status==="active"?"Ativo":allocation.status==="expired"?"Expirado":"Concluído"}/></div>)}</div></Panel>
    </div>
    <Panel title="Itens contratados" icon={<Package size={17} className="text-primary"/>}><div className="space-y-3">{quote.payload.items.map((item)=><article key={item.id} className="flex flex-col sm:flex-row gap-4 rounded-xl border border-border p-4"><ImageWithFallback src={item.productSnapshot.photo} alt={item.productSnapshot.name} className="h-24 w-24 rounded-lg object-cover bg-secondary"/><div className="flex-1"><p className="font-medium">{item.productSnapshot.name}</p><p className="text-sm text-muted-foreground">{item.productSnapshot.assembly?`${item.productSnapshot.assembly.cover.name}${item.productSnapshot.assembly.reducer?` + ${item.productSnapshot.assembly.reducer.name}`:" + sem redutor"}`:item.productSnapshot.description}</p><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground"><span>{item.quantity} unidade(s)</span><span>{item.periodDays} dias</span><span>{item.startDate} até {item.endDate}</span></div></div><p className="font-semibold">{formatMoneyFromCents(item.priceSnapshot.totalCents)}</p></article>)}</div></Panel>
    <PaymentPanel detail={detail} onSaved={(payment)=>setDetail({...detail,payment})}/>
    <OperationsPanel detail={detail} onUpdated={applyDetail}/>
    <EvidenceUploader detail={detail} onUploaded={async()=>{await reload();}}/>
    <UnitJobsPanel detail={detail} onUpdated={async()=>{await reload();await refreshCatalog();}}/>
    <Panel title="Observações e histórico" icon={<Clock size={17} className="text-primary"/>}>
      <div className="flex gap-2"><input value={note} onChange={(event)=>setNote(event.target.value)} placeholder="Adicionar observação interna" className="flex-1 rounded-xl border border-border bg-input-background px-3 py-2.5"/><Btn variant="primary" size="sm" disabled={noteSaving||!note.trim()} onClick={()=>void saveNote()}>{noteSaving?<Loader2 size={14} className="animate-spin"/>:<Send size={14}/>}Registrar</Btn></div>
      <div className="mt-5 space-y-3">{detail.events.map((event)=><article key={event.id} className="flex gap-3"><div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary shrink-0"/><div className="flex-1 border-b border-border pb-3"><div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-medium">{event.title}</p><time className="text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</time></div>{event.note&&<p className="mt-1 text-sm text-muted-foreground">{event.note}</p>}</div></article>)}{!detail.events.length&&<p className="text-sm text-muted-foreground">Nenhum evento operacional registrado.</p>}</div>
    </Panel>
  </div>;
}
