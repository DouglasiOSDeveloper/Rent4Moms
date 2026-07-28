import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Droplets, Eye, Loader2, Plus, RefreshCw, Search, Truck, Wrench } from "lucide-react";
import { Btn, StatusBadge, cn } from "../../../components/prototype/PrototypeUI";
import type { InventoryUnit } from "../../../domain/inventory/types";
import type { HygieneJob, HygieneJobStatus, MaintenanceJob, MaintenanceJobStatus } from "../../../domain/operations/types";
import { formatMoneyFromCents } from "../../../lib/money";
import { loadInventoryOverview } from "../../../services/inventory/inventoryApi";
import {
  createHygieneJobs, createMaintenanceJobs, listDeliveryOperations, listHygieneJobs,
  listMaintenanceJobs, updateHygieneJob, updateMaintenanceJob,
} from "../../../services/operations/operationsApi";
import type { DeliveryOperationRecord } from "../../../domain/operations/types";

function dateTime(value: string | null | undefined): string { return value ? new Date(value).toLocaleString("pt-BR") : "—"; }
function address(record: DeliveryOperationRecord): string {
  const value = record.quote.payload.address;
  return [value.street, value.number, value.district, value.city, value.state].filter(Boolean).join(", ") || "Retirada/combinar";
}

export function AdminDeliveryOperations() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<DeliveryOperationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const reload = async () => { setLoading(true); setError(""); try { setRecords(await listDeliveryOperations()); } catch(cause){setError(cause instanceof Error?cause.message:"Não foi possível carregar as entregas.");} finally{setLoading(false);} };
  useEffect(()=>{void reload();},[]);
  const filtered = useMemo(()=>records.filter((record)=>`${record.quote.code} ${record.quote.customerName} ${address(record)}`.toLowerCase().includes(search.toLowerCase())),[records,search]);
  return <div><div className="flex flex-wrap items-start justify-between gap-3 mb-6"><div><h1 className="text-xl font-semibold">Entregas e devoluções</h1><p className="text-sm text-muted-foreground mt-1">Agenda derivada dos pedidos reais e do histórico operacional.</p></div><Btn variant="outline" size="sm" onClick={()=>void reload()}><RefreshCw size={14}/>Atualizar</Btn></div><div className="bg-white rounded-xl border border-border overflow-hidden"><div className="p-4 border-b border-border"><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Buscar pedido, cliente ou endereço" className="w-full rounded-xl border border-border bg-input-background pl-9 pr-4 py-2"/></div></div>{error&&<p className="m-4 text-sm text-destructive">{error}</p>}{loading?<div className="p-12 text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto"/></div>:<div className="overflow-x-auto"><table className="w-full"><thead className="bg-secondary border-b border-border"><tr>{["Pedido","Cliente","Endereço","Data prevista","Janela","Pagamento","Entrega","Devolução",""] .map((item)=><th key={item} className="px-4 py-3 text-left text-xs uppercase text-muted-foreground whitespace-nowrap">{item}</th>)}</tr></thead><tbody className="divide-y divide-border">{filtered.map((record)=>{const first=record.quote.payload.items[0];return <tr key={record.quote.id} className="hover:bg-secondary/50"><td className="px-4 py-3 text-sm font-mono font-medium">{record.quote.code}</td><td className="px-4 py-3 text-sm">{record.quote.customerName}</td><td className="px-4 py-3 text-xs text-muted-foreground max-w-56">{address(record)}</td><td className="px-4 py-3 text-sm whitespace-nowrap">{first?.startDate||"—"}</td><td className="px-4 py-3 text-sm whitespace-nowrap">{record.quote.payload.deliverySlot||"A combinar"}</td><td className="px-4 py-3"><StatusBadge status={record.payment?.status==="received"?"Recebido":record.payment?.status==="partial"?"Parcial":"Pendente"}/></td><td className="px-4 py-3 text-xs whitespace-nowrap">{record.deliveryEvent?dateTime(record.deliveryEvent.createdAt):"Pendente"}</td><td className="px-4 py-3 text-xs whitespace-nowrap">{record.returnEvent?dateTime(record.returnEvent.createdAt):"Pendente"}</td><td className="px-4 py-3"><button onClick={()=>navigate(`/admin/orcamentos/${record.quote.id}`)} className="p-2 text-primary hover:bg-primary/5 rounded-lg"><Eye size={15}/></button></td></tr>;})}{!filtered.length&&<tr><td colSpan={9} className="p-10 text-center text-muted-foreground">Nenhum registro encontrado.</td></tr>}</tbody></table></div>}</div></div>;
}

const UNIT_TYPE_LABELS: Record<InventoryUnit["itemType"], string> = {
  chair_model: "Cadeira",
  cover: "Pano",
  reducer: "Redutor",
  ball_set: "Bolinhas",
};
const UNIT_STATUS_LABELS: Record<InventoryUnit["status"], string> = {
  available: "Disponível",
  held: "Bloqueada",
  reserved: "Reservada",
  preparing: "Em preparação",
  rented: "Em locação",
  returned: "Devolvida",
  inspection: "Em inspeção",
  washing: "Em lavagem",
  maintenance: "Em manutenção",
  unavailable: "Indisponível",
  retired: "Baixada",
};

function UnitPicker({ units, selected, onToggle }: { units: InventoryUnit[]; selected: string[]; onToggle: (id:string)=>void }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | InventoryUnit["itemType"]>("all");
  const [status, setStatus] = useState<"all" | InventoryUnit["status"]>("all");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return units.filter((unit) => (
      (type === "all" || unit.itemType === type)
      && (status === "all" || unit.status === status)
      && (!query || `${unit.code} ${unit.label} ${unit.itemId} ${UNIT_TYPE_LABELS[unit.itemType]} ${UNIT_STATUS_LABELS[unit.status]}`.toLowerCase().includes(query))
    ));
  }, [search, status, type, units]);

  const availableTypes = [...new Set(units.map((unit) => unit.itemType))];
  const availableStatuses = [...new Set(units.map((unit) => unit.status))];

  return <div className="rounded-xl border border-border overflow-hidden">
    <div className="p-3 border-b border-border space-y-2">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
        <input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Buscar por código, tipo ou modelo" className="w-full rounded-lg border border-border bg-input-background py-2 pl-9 pr-3 text-sm"/>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <select value={type} onChange={(event)=>setType(event.target.value as typeof type)} className="rounded-lg border border-border bg-input-background px-3 py-2 text-sm">
          <option value="all">Todos os tipos</option>
          {availableTypes.map((value)=><option key={value} value={value}>{UNIT_TYPE_LABELS[value]}</option>)}
        </select>
        <select value={status} onChange={(event)=>setStatus(event.target.value as typeof status)} className="rounded-lg border border-border bg-input-background px-3 py-2 text-sm">
          <option value="all">Todos os status</option>
          {availableStatuses.map((value)=><option key={value} value={value}>{UNIT_STATUS_LABELS[value]}</option>)}
        </select>
      </div>
      <p className="text-xs text-muted-foreground">{selected.length} selecionada(s) · {filtered.length} exibida(s)</p>
    </div>
    <div className="max-h-96 overflow-y-auto divide-y divide-border">
      {filtered.map((unit)=><label key={unit.id} className={cn("flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-secondary/50",selected.includes(unit.id)&&"bg-primary/10 ring-1 ring-inset ring-primary/30")}><input type="checkbox" checked={selected.includes(unit.id)} onChange={()=>onToggle(unit.id)}/><div className="min-w-0"><p className="text-sm font-mono font-medium">{unit.code}</p><p className="text-xs text-muted-foreground truncate">{unit.label} · {UNIT_TYPE_LABELS[unit.itemType]} · {UNIT_STATUS_LABELS[unit.status]}</p></div></label>)}
      {!filtered.length&&<p className="p-6 text-center text-sm text-muted-foreground">Nenhuma unidade encontrada para os filtros.</p>}
    </div>
  </div>;
}

const HYGIENE_LABELS: Record<HygieneJobStatus,string> = { waiting:"Aguardando",in_progress:"Em andamento",drying:"Secagem",inspection:"Inspeção",approved:"Aprovada",rejected:"Reprovada" };
export function AdminHygieneOperations() {
  const [jobs,setJobs]=useState<HygieneJob[]>([]); const [units,setUnits]=useState<InventoryUnit[]>([]); const [selected,setSelected]=useState<string[]>([]); const [responsible,setResponsible]=useState(""); const [notes,setNotes]=useState(""); const [showCreate,setShowCreate]=useState(false); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const reload=async()=>{setLoading(true);setError("");try{const [nextJobs,overview]=await Promise.all([listHygieneJobs(),loadInventoryOverview()]);setJobs(nextJobs);setUnits(overview.units.filter((unit)=>["inspection","returned","washing","available"].includes(unit.status)));}catch(cause){setError(cause instanceof Error?cause.message:"Não foi possível carregar a higienização.");}finally{setLoading(false);}};
  useEffect(()=>{void reload();},[]); const toggle=(id:string)=>setSelected((current)=>current.includes(id)?current.filter((item)=>item!==id):[...current,id]);
  const create=async()=>{if(!selected.length||responsible.trim().length<2){setError("Selecione unidades e informe o responsável.");return;}try{await createHygieneJobs({unitIds:selected,responsible,notes});setSelected([]);setResponsible("");setNotes("");setShowCreate(false);await reload();}catch(cause){setError(cause instanceof Error?cause.message:"Não foi possível criar o registro.");}};
  const update=async(job:HygieneJob,status:HygieneJobStatus)=>{try{await updateHygieneJob(job.id,{status});await reload();}catch(cause){setError(cause instanceof Error?cause.message:"Não foi possível atualizar o registro.");}};
  return <div><div className="flex items-start justify-between gap-3 mb-6"><div><h1 className="text-xl font-semibold">Higienização</h1><p className="text-sm text-muted-foreground mt-1">Controle por unidade física até a liberação para novo aluguel.</p></div><Btn variant="primary" size="sm" onClick={()=>setShowCreate(!showCreate)}><Plus size={14}/>Novo registro</Btn></div>{error&&<p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}{showCreate&&<div className="mb-5 bg-white rounded-xl border border-border p-5"><div className="grid lg:grid-cols-2 gap-4"><UnitPicker units={units} selected={selected} onToggle={toggle}/><div className="space-y-3"><label className="block text-sm font-medium">Responsável<input value={responsible} onChange={(event)=>setResponsible(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5"/></label><label className="block text-sm font-medium">Observações<textarea value={notes} onChange={(event)=>setNotes(event.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5"/></label><div className="flex justify-end"><Btn size="sm" onClick={()=>void create()}><Droplets size={14}/>Iniciar higienização</Btn></div></div></div></div>}{loading?<div className="p-12 text-center"><Loader2 className="animate-spin mx-auto"/></div>:<div className="grid lg:grid-cols-2 gap-4">{jobs.map((job)=><article key={job.id} className="bg-white rounded-xl border border-border p-5"><div className="flex justify-between gap-3"><div><p className="font-mono text-sm font-medium">{job.unitCode}</p><p className="text-sm text-muted-foreground">{job.unitLabel}</p></div><StatusBadge status={HYGIENE_LABELS[job.status]}/></div><p className="mt-3 text-sm">Responsável: {job.responsible}</p>{job.notes&&<p className="mt-1 text-sm text-muted-foreground">{job.notes}</p>}<div className="mt-4"><label className="text-sm font-medium">Alterar etapa<select value={job.status} onChange={(event)=>void update(job,event.target.value as HygieneJobStatus)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5">{Object.entries(HYGIENE_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div></article>)}{!jobs.length&&<p className="lg:col-span-2 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">Nenhuma higienização registrada.</p>}</div>}</div>;
}

const MAINTENANCE_LABELS: Record<MaintenanceJobStatus,string> = { open:"Aberta",diagnosing:"Diagnóstico",waiting_parts:"Aguardando peças",repairing:"Em reparo",testing:"Em teste",completed:"Concluída",unrepairable:"Sem reparo" };
export function AdminMaintenanceOperations() {
  const [jobs,setJobs]=useState<MaintenanceJob[]>([]); const [units,setUnits]=useState<InventoryUnit[]>([]); const [selected,setSelected]=useState<string[]>([]); const [responsible,setResponsible]=useState(""); const [problem,setProblem]=useState(""); const [type,setType]=useState<"preventive"|"corrective">("corrective"); const [showCreate,setShowCreate]=useState(false); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const reload=async()=>{setLoading(true);setError("");try{const [nextJobs,overview]=await Promise.all([listMaintenanceJobs(),loadInventoryOverview()]);setJobs(nextJobs);const activeUnitIds=new Set(overview.allocations.filter((allocation)=>allocation.status==="active").map((allocation)=>allocation.unitId));const activeMaintenanceUnitIds=new Set(nextJobs.filter((job)=>!["completed","unrepairable"].includes(job.status)).map((job)=>job.unitId));setUnits(overview.units.filter((unit)=>unit.status!=="retired"&&!activeUnitIds.has(unit.id)&&!activeMaintenanceUnitIds.has(unit.id)));}catch(cause){setError(cause instanceof Error?cause.message:"Não foi possível carregar a manutenção.");}finally{setLoading(false);}};
  useEffect(()=>{void reload();},[]); const toggle=(id:string)=>setSelected((current)=>current.includes(id)?current.filter((item)=>item!==id):[...current,id]);
  const create=async()=>{if(!selected.length||responsible.trim().length<2||problem.trim().length<2){setError("Selecione unidades, informe o responsável e descreva o problema.");return;}try{await createMaintenanceJobs({unitIds:selected,maintenanceType:type,problem,responsible});setSelected([]);setResponsible("");setProblem("");setShowCreate(false);await reload();}catch(cause){setError(cause instanceof Error?cause.message:"Não foi possível abrir a manutenção.");}};
  const update=async(job:MaintenanceJob,status:MaintenanceJobStatus)=>{try{await updateMaintenanceJob(job.id,{status});await reload();}catch(cause){setError(cause instanceof Error?cause.message:"Não foi possível atualizar a manutenção.");}};
  return <div><div className="flex items-start justify-between gap-3 mb-6"><div><h1 className="text-xl font-semibold">Manutenção</h1><p className="text-sm text-muted-foreground mt-1">Manutenção preventiva ou corretiva por unidade física.</p></div><Btn variant="primary" size="sm" onClick={()=>setShowCreate(!showCreate)}><Plus size={14}/>Nova manutenção</Btn></div>{error&&<p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}{showCreate&&<div className="mb-5 bg-white rounded-xl border border-border p-5"><div className="grid lg:grid-cols-2 gap-4"><UnitPicker units={units} selected={selected} onToggle={toggle}/><div className="space-y-3"><label className="block text-sm font-medium">Tipo<select value={type} onChange={(event)=>setType(event.target.value as "preventive"|"corrective")} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5"><option value="corrective">Corretiva</option><option value="preventive">Preventiva</option></select></label><label className="block text-sm font-medium">Responsável<input value={responsible} onChange={(event)=>setResponsible(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5"/></label><label className="block text-sm font-medium">Problema<textarea value={problem} onChange={(event)=>setProblem(event.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5"/></label><div className="flex justify-end"><Btn size="sm" onClick={()=>void create()}><Wrench size={14}/>Abrir manutenção</Btn></div></div></div></div>}{loading?<div className="p-12 text-center"><Loader2 className="animate-spin mx-auto"/></div>:<div className="grid lg:grid-cols-2 gap-4">{jobs.map((job)=><article key={job.id} className="bg-white rounded-xl border border-border p-5"><div className="flex justify-between gap-3"><div><p className="font-mono text-sm font-medium">{job.unitCode}</p><p className="text-sm text-muted-foreground">{job.unitLabel}</p></div><StatusBadge status={MAINTENANCE_LABELS[job.status]}/></div><p className="mt-3 text-sm font-medium">{job.problem}</p><p className="mt-1 text-sm text-muted-foreground">{job.responsible} · {job.maintenanceType==="corrective"?"Corretiva":"Preventiva"}</p>{job.costCents>0&&<p className="mt-1 text-sm">Custo: {formatMoneyFromCents(job.costCents)}</p>}<label className="mt-4 block text-sm font-medium">Alterar etapa<select value={job.status} onChange={(event)=>void update(job,event.target.value as MaintenanceJobStatus)} className="mt-1.5 w-full rounded-xl border border-border bg-input-background px-3 py-2.5">{Object.entries(MAINTENANCE_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></article>)}{!jobs.length&&<p className="lg:col-span-2 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">Nenhuma manutenção registrada.</p>}</div>}</div>;
}
