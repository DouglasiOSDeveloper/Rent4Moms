import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Boxes, Clock3, Edit, History, PackageCheck, Plus, RefreshCw, Search, ShieldAlert, Trash2, X } from "lucide-react";
import { Btn, Input, StatusBadge, cn } from "../../../components/prototype/PrototypeUI";
import type { InventoryItemType, InventoryOverview, InventoryUnit, InventoryUnitInput, InventoryUnitStatus } from "../../../domain/inventory/types";
import { createInventoryUnit, expireInventoryHolds, loadInventoryOverview, retireInventoryUnit, updateInventoryUnit } from "../../../services/inventory/inventoryApi";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";

const STATUSES: InventoryUnitStatus[] = ["available", "held", "reserved", "preparing", "rented", "returned", "inspection", "washing", "maintenance", "unavailable", "retired"];
const STATUS_LABELS: Record<InventoryUnitStatus, string> = { available: "Disponível", held: "Bloqueada", reserved: "Reservada", preparing: "Em preparação", rented: "Em locação", returned: "Devolvida", inspection: "Em inspeção", washing: "Em lavagem", maintenance: "Em manutenção", unavailable: "Indisponível", retired: "Baixada" };
const TYPE_LABELS: Record<InventoryItemType, string> = { chair_model: "Cadeira", cover: "Pano", reducer: "Redutor", ball_set: "Bolinhas" };
const EMPTY: InventoryOverview = { summary: { total: 0, byStatus: {}, byType: {}, activeAllocations: 0, expiringSoon: 0 }, units: [], allocations: [], movements: [], availability: [] };
const dateTime = (value: string | null) => value ? new Date(value).toLocaleString("pt-BR") : "—";

export function AdminInventory() {
  const { chairModels, covers, reducers, ballSets, refreshCatalog } = useCatalog();
  const [overview, setOverview] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"units" | "allocations" | "movements">("units");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InventoryUnitStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | InventoryItemType>("all");
  const [editing, setEditing] = useState<InventoryUnit | "new" | null>(null);
  const itemOptions = useMemo(() => ({
    chair_model: chairModels.map((item) => ({ id: item.id, label: `${item.name} (${item.version})` })),
    cover: covers.map((item) => ({ id: item.id, label: item.name })),
    reducer: reducers.map((item) => ({ id: item.id, label: item.name })),
    ball_set: ballSets.map((item) => ({ id: item.id, label: item.name })),
  }), [ballSets, chairModels, covers, reducers]);

  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try { setOverview(await loadInventoryOverview()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar o estoque."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return overview.units.filter((unit) => (statusFilter === "all" || unit.status === statusFilter) && (typeFilter === "all" || unit.itemType === typeFilter) && (!q || `${unit.code} ${unit.label} ${unit.itemId} ${unit.location}`.toLowerCase().includes(q)));
  }, [overview.units, search, statusFilter, typeFilter]);

  const expire = async () => {
    setBusy(true); setError(""); setNotice("");
    try { const count = await expireInventoryHolds(); setNotice(count ? `${count} alocação(ões) vencida(s) foram liberadas.` : "Nenhum bloqueio vencido encontrado."); await Promise.all([reload(), refreshCatalog()]); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível liberar os bloqueios."); }
    finally { setBusy(false); }
  };
  const retire = async (unit: InventoryUnit) => {
    if (!window.confirm(`Baixar a unidade ${unit.code}? Ela continuará no histórico.`)) return;
    setBusy(true); setError("");
    try { await retireInventoryUnit(unit.id); await Promise.all([reload(), refreshCatalog()]); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível baixar a unidade."); }
    finally { setBusy(false); }
  };

  const metrics = [
    ["Unidades ativas", overview.summary.total, <Boxes size={18} />],
    ["Disponíveis", overview.summary.byStatus.available ?? 0, <PackageCheck size={18} />],
    ["Bloqueadas/reservadas", (overview.summary.byStatus.held ?? 0) + (overview.summary.byStatus.reserved ?? 0), <Clock3 size={18} />],
    ["Lavagem/manutenção", (overview.summary.byStatus.washing ?? 0) + (overview.summary.byStatus.maintenance ?? 0), <ShieldAlert size={18} />],
  ] as const;

  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div><h1 className="text-xl font-semibold text-foreground">Estoque físico</h1><p className="text-sm text-muted-foreground mt-1">Controle individual de cadeiras, panos, redutores e bolinhas.</p></div>
      <div className="flex gap-2"><Btn variant="outline" size="sm" onClick={() => void expire()} disabled={busy}><RefreshCw size={14} />Liberar vencidos</Btn><Btn variant="primary" size="sm" onClick={() => setEditing("new")}><Plus size={14} />Nova unidade</Btn></div>
    </div>
    {error && <div role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
    {notice && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">{metrics.map(([label, value, icon]) => <div key={label} className="bg-white border border-border rounded-xl p-4 flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</span><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold">{value}</p></div></div>)}</div>
    <div className="flex gap-1 border-b border-border mb-5">{([['units','Unidades',<Boxes size={14}/>],['allocations',`Alocações (${overview.summary.activeAllocations})`,<Archive size={14}/>],['movements','Movimentações',<History size={14}/>]] as const).map(([id,label,icon]) => <button key={id} onClick={() => setTab(id)} className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px", tab===id?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground")}>{icon}{label}</button>)}</div>

    {tab === "units" && <div className="bg-white rounded-xl border border-border">
      <div className="p-4 border-b border-border flex flex-wrap gap-3"><div className="relative flex-1 min-w-52"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Código, item ou localização..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm"/></div><select value={typeFilter} onChange={(event)=>setTypeFilter(event.target.value as "all"|InventoryItemType)} className="px-3 py-2 rounded-lg border border-border bg-input-background text-sm"><option value="all">Todos os tipos</option>{Object.entries(TYPE_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><select value={statusFilter} onChange={(event)=>setStatusFilter(event.target.value as "all"|InventoryUnitStatus)} className="px-3 py-2 rounded-lg border border-border bg-input-background text-sm"><option value="all">Todos os status</option>{STATUSES.map((status)=><option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></div>
      {loading ? <div className="p-10 text-center text-muted-foreground">Carregando estoque...</div> : <div className="overflow-x-auto"><table className="w-full"><thead className="bg-secondary border-b border-border"><tr>{["Código","Tipo","Item","Status","Condição","Localização","Atualização",""].map((h)=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{filtered.map((unit)=><tr key={unit.id} className="hover:bg-secondary/50"><td className="px-4 py-3 text-xs font-mono font-medium">{unit.code}</td><td className="px-4 py-3 text-sm text-muted-foreground">{TYPE_LABELS[unit.itemType]}</td><td className="px-4 py-3"><p className="text-sm">{unit.label}</p><p className="text-xs text-muted-foreground font-mono">{unit.itemId}</p></td><td className="px-4 py-3"><StatusBadge status={STATUS_LABELS[unit.status]}/></td><td className="px-4 py-3 text-sm text-muted-foreground">{unit.condition}</td><td className="px-4 py-3 text-sm text-muted-foreground">{unit.location}</td><td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{dateTime(unit.updatedAt)}</td><td className="px-4 py-3"><div className="flex gap-1"><button onClick={()=>setEditing(unit)} title="Editar" className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary"><Edit size={14}/></button><button onClick={()=>void retire(unit)} title="Baixar" disabled={busy||unit.status==='retired'} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-destructive disabled:opacity-40"><Trash2 size={14}/></button></div></td></tr>)}{filtered.length===0&&<tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Nenhuma unidade encontrada.</td></tr>}</tbody></table></div>}
      <div className="p-4 border-t border-border text-sm text-muted-foreground">{filtered.length} unidade{filtered.length!==1?"s":""}</div>
    </div>}

    {tab === "allocations" && <div className="bg-white rounded-xl border border-border overflow-x-auto"><table className="w-full"><thead className="bg-secondary border-b border-border"><tr>{["Pedido","Unidade","Componente","Status","Expira","Liberação"].map((h)=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{overview.allocations.map((a)=><tr key={a.id}><td className="px-4 py-3 text-xs font-mono">{a.quoteId.slice(0,8)}…</td><td className="px-4 py-3 text-xs font-mono">{a.unitCode}</td><td className="px-4 py-3 text-sm text-muted-foreground">{TYPE_LABELS[a.itemType]}</td><td className="px-4 py-3"><StatusBadge status={a.status==='active'?"Ativo":a.status==='expired'?"Expirado":"Concluído"}/></td><td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{dateTime(a.expiresAt)}</td><td className="px-4 py-3 text-xs text-muted-foreground">{a.releaseReason??"—"}</td></tr>)}</tbody></table></div>}
    {tab === "movements" && <div className="bg-white rounded-xl border border-border overflow-x-auto"><table className="w-full"><thead className="bg-secondary border-b border-border"><tr>{["Data","Unidade","Origem","Destino","Motivo","Pedido"].map((h)=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{overview.movements.map((m)=><tr key={m.id}><td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{dateTime(m.createdAt)}</td><td className="px-4 py-3 text-xs font-mono">{m.unitCode}</td><td className="px-4 py-3 text-sm text-muted-foreground">{m.fromStatus?STATUS_LABELS[m.fromStatus]:"Entrada"}</td><td className="px-4 py-3"><StatusBadge status={STATUS_LABELS[m.toStatus]}/></td><td className="px-4 py-3 text-sm text-muted-foreground">{m.reason}</td><td className="px-4 py-3 text-xs font-mono text-muted-foreground">{m.quoteId?`${m.quoteId.slice(0,8)}…`:"—"}</td></tr>)}</tbody></table></div>}
    {editing && <UnitModal editing={editing} itemOptions={itemOptions} onClose={()=>setEditing(null)} onSaved={async()=>{setEditing(null);await Promise.all([reload(),refreshCatalog()]);}}/>}
  </div>;
}

function UnitModal({ editing, itemOptions, onClose, onSaved }: { editing: InventoryUnit | "new"; itemOptions: Record<InventoryItemType, Array<{id:string;label:string}>>; onClose:()=>void; onSaved:()=>Promise<void> }) {
  const isNew = editing === "new"; const initialType: InventoryItemType = isNew?"chair_model":editing.itemType; const first = itemOptions[initialType][0];
  const [form,setForm]=useState<InventoryUnitInput>(()=>isNew?{code:"",itemType:initialType,itemId:first?.id??"",label:first?.label??"",status:"available",condition:"Bom",location:"Estoque principal",notes:""}:{code:editing.code,itemType:editing.itemType,itemId:editing.itemId,label:editing.label,status:editing.status,condition:editing.condition,location:editing.location,notes:editing.notes});
  const [saving,setSaving]=useState(false); const [error,setError]=useState("");
  const changeType=(itemType:InventoryItemType)=>{const option=itemOptions[itemType][0];setForm((current)=>({...current,itemType,itemId:option?.id??"",label:option?.label??""}));};
  const save=async()=>{if(!form.code.trim()||!form.itemId||!form.label.trim()){setError("Código, item e nome são obrigatórios.");return;}setSaving(true);setError("");try{if(isNew)await createInventoryUnit(form);else await updateInventoryUnit(editing.id,{code:form.code,label:form.label,status:form.status,condition:form.condition,location:form.location,notes:form.notes});await onSaved();}catch(cause){setError(cause instanceof Error?cause.message:"Não foi possível salvar a unidade.");}finally{setSaving(false);}};
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"><div className="bg-white rounded-2xl border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"><div className="flex items-start justify-between mb-5"><div><h2 className="font-semibold text-lg">{isNew?"Nova unidade":`Editar ${editing.code}`}</h2><p className="text-sm text-muted-foreground">O código identifica a peça física.</p></div><button onClick={onClose}><X size={20}/></button></div>{error&&<div role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}<div className="grid sm:grid-cols-2 gap-4"><Input label="Código patrimonial" value={form.code} onChange={(code)=>setForm((c)=>({...c,code}))} required/><div className="flex flex-col gap-1.5"><label className="text-sm font-medium">Status</label><select value={form.status} onChange={(e)=>setForm((c)=>({...c,status:e.target.value as InventoryUnitStatus}))} className="rounded-xl border border-border bg-input-background px-4 py-2.5">{STATUSES.map((s)=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select></div><div className="flex flex-col gap-1.5"><label className="text-sm font-medium">Tipo</label><select disabled={!isNew} value={form.itemType} onChange={(e)=>changeType(e.target.value as InventoryItemType)} className="rounded-xl border border-border bg-input-background px-4 py-2.5 disabled:opacity-60">{Object.entries(TYPE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div><div className="flex flex-col gap-1.5"><label className="text-sm font-medium">Item do catálogo</label><select disabled={!isNew} value={form.itemId} onChange={(e)=>{const id=e.target.value;const opt=itemOptions[form.itemType].find((i)=>i.id===id);setForm((c)=>({...c,itemId:id,label:opt?.label??c.label}));}} className="rounded-xl border border-border bg-input-background px-4 py-2.5 disabled:opacity-60">{itemOptions[form.itemType].map((i)=><option key={i.id} value={i.id}>{i.label}</option>)}</select></div><Input label="Nome exibido" value={form.label} onChange={(label)=>setForm((c)=>({...c,label}))} required/><Input label="Condição" value={form.condition} onChange={(condition)=>setForm((c)=>({...c,condition}))} required/><Input label="Localização" value={form.location} onChange={(location)=>setForm((c)=>({...c,location}))} required/><div className="sm:col-span-2 flex flex-col gap-1.5"><label className="text-sm font-medium">Observações</label><textarea value={form.notes} onChange={(e)=>setForm((c)=>({...c,notes:e.target.value}))} rows={3} className="rounded-xl border border-border bg-input-background px-4 py-2.5"/></div></div><div className="flex justify-end gap-3 mt-6"><Btn variant="outline" onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={()=>void save()} disabled={saving}>{saving?"Salvando...":"Salvar unidade"}</Btn></div></div></div>;
}
