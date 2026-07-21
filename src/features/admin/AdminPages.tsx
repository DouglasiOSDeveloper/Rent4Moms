import React, { useEffect, useMemo, useState } from "react";
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
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { generateDeliverySlots, isValidDeliveryTimeRange } from "../../domain/delivery/slots";
import type { DeliverySettings } from "../../domain/delivery/types";
import type { Product, ShippingZone } from "../../domain/shared/types";
import { CHART_MONTHLY, CHART_PRODUCTS, CHART_REVENUE, CUSTOMERS, DEFAULT_SHIPPING_ZONES, QUOTES_DATA, RESERVATIONS } from "../../data/mocks";
import { getCategoryNames } from "../../domain/catalog/selectors";
import { useCatalog } from "../../stores/catalog/CatalogProvider";
import { Btn, Input, Select, StatusBadge, cn } from "../../components/prototype/PrototypeUI";
import { formatMoneyFromCents } from "../../lib/money";
import type { InventoryAllocation, QuoteInventoryAction } from "../../domain/inventory/types";
import { applyQuoteInventoryAction, loadQuoteInventory } from "../../services/inventory/inventoryApi";
import { listAdminQuotes, type PersistedQuote } from "../../services/quotes/quotesApi";

export function AdminDashboard() {
  const kpis = [
    { label: "Novos leads", value: "12", change: "+4", icon: <Users size={18} />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Orçamentos em análise", value: "8", change: "+2", icon: <FileText size={18} />, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Reservas confirmadas", value: "15", change: "+3", icon: <CheckCircle size={18} />, color: "text-green-600", bg: "bg-green-50" },
    { label: "Locações ativas", value: "23", change: "=", icon: <Package size={18} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Entregas hoje", value: "4", change: "", icon: <Truck size={18} />, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Devoluções hoje", value: "3", change: "", icon: <ArrowRight size={18} />, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Devoluções atrasadas", value: "1", change: "", icon: <AlertCircle size={18} />, color: "text-red-600", bg: "bg-red-50" },
    { label: "Em higienização", value: "5", change: "", icon: <Droplets size={18} />, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Produtos disponíveis", value: "47", change: "-2", icon: <Archive size={18} />, color: "text-gray-600", bg: "bg-gray-50" },
    { label: "Em manutenção", value: "2", change: "", icon: <Wrench size={18} />, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Receita estimada (jun)", value: "R$ 19.340", change: "+15%", icon: <DollarSign size={18} />, color: "text-green-700", bg: "bg-green-50" },
    { label: "Taxa de conversão", value: "87%", change: "+3pp", icon: <TrendingUp size={18} />, color: "text-primary", bg: "bg-primary/5" },
  ];

  const pendencies = [
    { label: "Orçamento ORC-2024-0041 aguardando análise", urgent: true },
    { label: "Entrega RES-2024-0017 agendada para hoje 14h", urgent: true },
    { label: "Contrato de Fernanda Lima aguardando aceite", urgent: false },
    { label: "Unidade RM-MR40-003 com revisão atrasada", urgent: false },
    { label: "3 orçamentos próximos do vencimento", urgent: false },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <div className="flex gap-2">
          <Select label="" options={["Junho 2024", "Maio 2024", "Abril 2024"]} value="Junho 2024" onChange={() => {}} />
          <Btn variant="outline" size="sm"><Download size={14} />Exportar</Btn>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", kpi.bg, kpi.color)}>{kpi.icon}</div>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{kpi.label}</p>
            {kpi.change && <p className={cn("text-xs font-medium mt-1", kpi.change.startsWith("+") ? "text-green-600" : kpi.change.startsWith("-") ? "text-red-600" : "text-muted-foreground")}>{kpi.change} vs. mês ant.</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold text-foreground mb-4">Solicitações por período</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CHART_MONTHLY} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#8A7B72" }} />
              <YAxis tick={{ fontSize: 12, fill: "#8A7B72" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #EDE8E0" }} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="solicitacoes" name="Solicitações" fill="#C4674A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="locacoes" name="Locações" fill="#7A9E7E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold text-foreground mb-4">Receita estimada vs. meta</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CHART_REVENUE}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4674A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C4674A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#8A7B72" }} />
              <YAxis tick={{ fontSize: 12, fill: "#8A7B72" }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #EDE8E0" }} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="meta" name="Meta" stroke="#EDE8E0" strokeDasharray="5 5" fill="none" />
              <Area type="monotone" dataKey="receita" name="Receita" stroke="#C4674A" fill="url(#colorReceita)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pendencies + Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold text-foreground mb-4">Pendências</p>
          <div className="flex flex-col gap-3">
            {pendencies.map((p, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-none">
                <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", p.urgent ? "bg-red-500" : "bg-amber-400")} />
                <p className="text-sm text-foreground">{p.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold text-foreground mb-4">Atividade recente</p>
          <div className="flex flex-col gap-3">
            {[
              { action: "Orçamento ORC-2024-0041 recebido", time: "Há 12 min", icon: <FileText size={14} className="text-blue-500" /> },
              { action: "Reserva RES-2024-0019 confirmada", time: "Há 1 hora", icon: <CheckCircle size={14} className="text-green-500" /> },
              { action: "Higienização RM-SF01-002 concluída", time: "Há 2 horas", icon: <Droplets size={14} className="text-cyan-500" /> },
              { action: "Cliente Fernanda Lima — novo orçamento", time: "Há 3 horas", icon: <Users size={14} className="text-purple-500" /> },
              { action: "Entrega RES-2024-0018 realizada", time: "Há 4 horas", icon: <Truck size={14} className="text-emerald-500" /> },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-none">
                <div className="w-6 h-6 bg-secondary rounded-lg flex items-center justify-center shrink-0">{a.icon}</div>
                <p className="text-sm text-foreground flex-1">{a.action}</p>
                <p className="text-xs text-muted-foreground shrink-0">{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PRODUCTS ───────────────────────────────────────────────────────────

export function AdminProducts() {
  const { products, categories, updateProductCategories } = useCatalog();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas categorias");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [noticeOpen, setNoticeOpen] = useState(false);

  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
      || product.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "Todas categorias"
      || product.categoryIds.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const statusColors: Record<Product["status"], string> = {
    available: "bg-green-50 text-green-700 border-green-200",
    few_units: "bg-amber-50 text-amber-700 border-amber-200",
    on_demand: "bg-gray-50 text-gray-600 border-gray-200",
    unavailable: "bg-red-50 text-red-700 border-red-200",
  };
  const statusLabels: Record<Product["status"], string> = {
    available: "Disponível", few_units: "Poucas unidades", on_demand: "Sob consulta", unavailable: "Indisponível",
  };

  const openCategoryEditor = (product: Product) => {
    setEditingProduct(product);
    setSelectedCategoryIds(product.categoryIds);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) => current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId]);
  };

  const saveCategories = () => {
    if (!editingProduct) return;
    updateProductCategories(editingProduct.id, selectedCategoryIds);
    setEditingProduct(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">Cada produto pode pertencer a uma ou mais categorias.</p>
        </div>
        <Btn variant="primary" size="sm" onClick={() => setNoticeOpen(true)}><Plus size={14} />Novo produto</Btn>
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-border bg-input-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Todas categorias</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                {["Produto", "Categorias", "Preço/semana", "Status", "Avaliação", ""].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product) => {
                const categoryNames = getCategoryNames(product, categories);
                return (
                  <tr key={product.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.photo} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.brand} · {product.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {categoryNames.length > 0 ? categoryNames.map((name) => (
                          <span key={name} className="text-xs bg-secondary border border-border px-2 py-0.5 rounded-full text-foreground">{name}</span>
                        )) : <span className="text-xs text-amber-700">Sem categoria</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">R$ {product.priceWeekly}</td>
                    <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", statusColors[product.status])}>{statusLabels[product.status]}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs text-foreground">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openCategoryEditor(product)} className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors whitespace-nowrap"><Tag size={14} />Editar categorias</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border text-sm text-muted-foreground">{filtered.length} produto{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-foreground text-lg">Categorias de {editingProduct.name}</h2>
              <button onClick={() => setEditingProduct(null)} aria-label="Fechar"><X size={20} className="text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Selecione todas as categorias em que o produto deve aparecer.</p>
            <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer", selectedCategoryIds.includes(category.id) ? "border-primary bg-primary/5" : "border-border bg-secondary/40")}>
                  <input type="checkbox" checked={selectedCategoryIds.includes(category.id)} onChange={() => toggleCategory(category.id)} className="accent-primary" />
                  <span className="text-xl">{category.icon}</span>
                  <span className="text-sm text-foreground">{category.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Btn variant="outline" onClick={() => setEditingProduct(null)}>Cancelar</Btn>
              <Btn variant="primary" onClick={saveCategories}>Salvar vínculos</Btn>
            </div>
          </div>
        </div>
      )}

      {noticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-md text-center">
            <Package size={36} className="mx-auto text-primary mb-3" />
            <h2 className="font-semibold text-foreground text-lg mb-2">Cadastro de produto será ampliado</h2>
            <p className="text-sm text-muted-foreground mb-5">O catálogo de produtos genéricos continua demonstrativo. Modelos, panos, redutores, bolinhas e variantes da linha 4moms agora são administrados em “Montagem 4moms” no menu lateral.</p>
            <Btn variant="primary" onClick={() => setNoticeOpen(false)}>Entendi</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN QUOTES ─────────────────────────────────────────────────────────────

export function AdminQuotes() {
  const { refreshCatalog } = useCatalog();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [quotes, setQuotes] = useState<PersistedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<{ quote: PersistedQuote; allocations: InventoryAllocation[] } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const statuses = ["Todos", "Em análise", "Aprovado", "Em preparação", "Em locação", "Devolvido", "Recusado", "Expirado", "Cancelado"];

  const reload = async () => {
    setLoading(true); setError("");
    try { setQuotes(await listAdminQuotes()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar os orçamentos."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void reload(); }, []);

  const openDetails = async (quote: PersistedQuote) => {
    setError("");
    try { setSelected(await loadQuoteInventory(quote.id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar a alocação do pedido."); }
  };
  const runAction = async (action: QuoteInventoryAction, reason?: string) => {
    if (!selected) return;
    setActionLoading(true); setError("");
    try { const updated = await applyQuoteInventoryAction(selected.quote.id, action, reason); setSelected(updated); await Promise.all([reload(), refreshCatalog()]); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o estoque do pedido."); }
    finally { setActionLoading(false); }
  };
  const filtered = quotes.filter((quote) => (filterStatus === "Todos" || quote.status === filterStatus) && (search === "" || quote.customerName.toLowerCase().includes(search.toLowerCase()) || quote.code.toLowerCase().includes(search.toLowerCase())));

  return <div>
    <div className="flex items-center justify-between mb-6"><div><h1 className="text-xl font-semibold text-foreground">Orçamentos</h1><p className="text-sm text-muted-foreground mt-1">Montagens 4moms bloqueiam unidades físicas até aprovação, cancelamento ou expiração.</p></div><Btn variant="outline" size="sm" onClick={() => void reload()}><RefreshCw size={14}/>Atualizar</Btn></div>
    <div className="bg-white rounded-xl border border-border">
      <div className="p-4 border-b border-border flex gap-3 flex-wrap"><div className="relative flex-1 min-w-48"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Buscar cliente ou número..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm"/></div><select value={filterStatus} onChange={(event)=>setFilterStatus(event.target.value)} className="px-3 py-2 rounded-lg border border-border bg-input-background text-sm">{statuses.map((status)=><option key={status}>{status}</option>)}</select></div>
      {loading&&<div className="p-10 text-center text-muted-foreground">Carregando orçamentos...</div>}
      {error&&<div role="alert" className="m-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
      {!loading&&<div className="overflow-x-auto"><table className="w-full"><thead className="bg-secondary border-b border-border"><tr>{["Número","Cliente","Produtos","Período","Valor","Status","Bloqueio",""] .map((h)=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{filtered.map((quote)=>{const products=quote.payload.items.map((item)=>item.productSnapshot.name).join(", ");const first=quote.payload.items[0];return <tr key={quote.id} className="hover:bg-secondary/50"><td className="px-4 py-3 text-sm font-mono font-medium">{quote.code}</td><td className="px-4 py-3 text-sm">{quote.customerName}</td><td className="px-4 py-3 text-sm text-muted-foreground max-w-40 truncate">{products}</td><td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{first?`${first.periodDays} dias`:"—"}</td><td className="px-4 py-3 text-sm font-medium">{formatMoneyFromCents(quote.totalCents)}</td><td className="px-4 py-3"><StatusBadge status={quote.status}/></td><td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{quote.holdExpiresAt?new Date(quote.holdExpiresAt).toLocaleString("pt-BR"):"Sem expiração"}</td><td className="px-4 py-3"><button onClick={()=>void openDetails(quote)} title="Ver estoque alocado" className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"><Eye size={14}/></button></td></tr>;})}{filtered.length===0&&<tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Nenhum orçamento encontrado.</td></tr>}</tbody></table></div>}
      <div className="p-4 border-t border-border text-sm text-muted-foreground">{filtered.length} orçamento{filtered.length!==1?"s":""}</div>
    </div>
    {selected&&<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"><div className="bg-white rounded-2xl border border-border p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"><div className="flex items-start justify-between mb-5"><div><h2 className="font-semibold text-lg">{selected.quote.code}</h2><p className="text-sm text-muted-foreground">{selected.quote.customerName} · {selected.quote.customerEmail}</p></div><button onClick={()=>setSelected(null)}><X size={20}/></button></div><div className="grid sm:grid-cols-3 gap-3 mb-5"><div className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">Status</p><div className="mt-1"><StatusBadge status={selected.quote.status}/></div></div><div className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">Total</p><p className="font-semibold mt-1">{formatMoneyFromCents(selected.quote.totalCents)}</p></div><div className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">Bloqueio até</p><p className="text-sm mt-1">{selected.quote.holdExpiresAt?new Date(selected.quote.holdExpiresAt).toLocaleString("pt-BR"):"Sem expiração"}</p></div></div><h3 className="font-medium mb-2">Unidades alocadas</h3><div className="border border-border rounded-xl overflow-hidden mb-5"><div className="divide-y divide-border">{selected.allocations.length?selected.allocations.map((allocation)=><div key={allocation.id} className="flex items-center justify-between gap-3 px-4 py-3"><div><p className="text-sm font-mono font-medium">{allocation.unitCode}</p><p className="text-xs text-muted-foreground">{allocation.componentRole} · {allocation.itemId}</p></div><StatusBadge status={allocation.status==='active'?"Ativo":allocation.status==='expired'?"Expirado":"Concluído"}/></div>):<p className="p-4 text-sm text-muted-foreground">Este orçamento não possui componentes físicos alocados.</p>}</div></div><div className="rounded-xl bg-secondary border border-border p-4 mb-5 text-sm"><strong>Fluxo da Etapa 7:</strong> aprovar transforma o bloqueio em reserva; devolver envia as unidades para inspeção; cancelar libera o estoque.</div><div className="flex flex-wrap gap-2 justify-end"><Btn variant="outline" size="sm" disabled={actionLoading} onClick={()=>void runAction("reserve")}><CheckCircle size={14}/>Aprovar e reservar</Btn><Btn variant="outline" size="sm" disabled={actionLoading} onClick={()=>void runAction("prepare")}><Package size={14}/>Preparar</Btn><Btn variant="outline" size="sm" disabled={actionLoading} onClick={()=>void runAction("rent")}><Activity size={14}/>Iniciar locação</Btn><Btn variant="outline" size="sm" disabled={actionLoading} onClick={()=>void runAction("return","Devolução registrada")}><Archive size={14}/>Registrar devolução</Btn><Btn variant="danger" size="sm" disabled={actionLoading} onClick={()=>void runAction("release","Cancelado")}><XCircle size={14}/>Cancelar e liberar</Btn></div></div></div>}
  </div>;
}

// ─── ADMIN RESERVATIONS ───────────────────────────────────────────────────────

export function AdminReservations() {
  const [tab, setTab] = useState("todas");
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Reservas e Locações</h1>
        <Btn variant="primary" size="sm"><Plus size={14} />Nova reserva</Btn>
      </div>

      <div className="flex gap-1 border-b border-border mb-6">
        {[["todas", "Todas"], ["ativas", "Ativas"], ["entrega-hoje", "Entrega hoje"], ["devolucao", "Devolução próxima"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors", tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          >{label}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              {["Número", "Cliente", "Produto", "Unidade", "Período", "Status", "Pagamento", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {RESERVATIONS.map(r => (
              <tr key={r.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 text-sm font-mono font-medium text-foreground">{r.id}</td>
                <td className="px-4 py-3 text-sm text-foreground">{r.customer}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{r.product}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.unit}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{r.start} – {r.end}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3"><StatusBadge status={r.payment} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Eye size={14} /></button>
                    <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Edit size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN CLIENTS ────────────────────────────────────────────────────────────

export function AdminClients() {
  const [search, setSearch] = useState("");
  const filtered = CUSTOMERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.includes(search));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Clientes</h1>
        <Btn variant="primary" size="sm"><Plus size={14} />Novo cliente</Btn>
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                {["Cliente", "CPF", "E-mail", "Telefone", "Cidade", "Locações", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">{c.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">Desde {c.since}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{c.cpf}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.city}</td>
                  <td className="px-4 py-3 text-sm text-center text-foreground">{c.orders}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Eye size={14} /></button>
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Edit size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN CALENDAR ───────────────────────────────────────────────────────────

export function AdminCalendar() {
  const [viewType, setViewType] = useState("semana");
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const events = [
    { day: 0, title: "Entrega RES-019", time: "09:00", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { day: 0, title: "Entrega RES-018", time: "14:00", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { day: 1, title: "Higienização RM-SF01", time: "10:00", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
    { day: 2, title: "Devolução RES-014", time: "11:00", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { day: 3, title: "Entrega RES-017", time: "13:00", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { day: 4, title: "Manutenção RM-MR40-003", time: "09:30", color: "bg-red-100 text-red-700 border-red-200" },
    { day: 4, title: "Devolução RES-016", time: "15:00", color: "bg-amber-100 text-amber-700 border-amber-200" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Calendário operacional</h1>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border">
            {["dia", "semana", "mes"].map(v => (
              <button key={v} onClick={() => setViewType(v)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors", viewType === v ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
                {v === "mes" ? "Mês" : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {days.map(d => (
            <div key={d} className="text-center py-3 text-xs font-semibold text-muted-foreground border-r border-border last:border-r-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-h-[400px]">
          {days.map((d, i) => {
            const dayEvents = events.filter(e => e.day === i);
            return (
              <div key={d} className="border-r border-border last:border-r-0 p-2 flex flex-col gap-1.5">
                <p className="text-sm font-medium text-muted-foreground text-center py-1">{10 + i}</p>
                {dayEvents.map((ev, j) => (
                  <div key={j} className={cn("rounded-lg px-2 py-1.5 text-xs border cursor-pointer hover:opacity-80 transition-opacity", ev.color)}>
                    <p className="font-medium leading-snug">{ev.title}</p>
                    <p className="opacity-70">{ev.time}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {[["bg-blue-100 text-blue-700 border-blue-200", "Entregas"], ["bg-amber-100 text-amber-700 border-amber-200", "Devoluções"], ["bg-cyan-100 text-cyan-700 border-cyan-200", "Higienização"], ["bg-red-100 text-red-700 border-red-200", "Manutenção"]].map(([cls, label]) => (
          <span key={label} className={cn("text-xs px-3 py-1 rounded-full border font-medium", cls)}>{label}</span>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN DELIVERY ───────────────────────────────────────────────────────────

export function AdminDelivery() {
  const deliveries = [
    { id: "ENT-2024-0021", res: "RES-2024-0019", customer: "Fernanda Lima", address: "R. das Flores, 142 — Campinas, SP", date: "01/07/2024", time: "09:00–12:00", status: "Agendada", driver: "Carlos M." },
    { id: "ENT-2024-0020", res: "RES-2024-0017", customer: "Carla Menezes", address: "R. Copacabana, 55 — Rio de Janeiro, RJ", date: "30/06/2024", time: "13:00–17:00", status: "Em rota", driver: "João S." },
    { id: "ENT-2024-0019", res: "RES-2024-0018", customer: "Ana Clara Ferreira", address: "Av. Paulista, 900 — São Paulo, SP", date: "15/06/2024", time: "10:00–13:00", status: "Entregue", driver: "Carlos M." },
    { id: "DEV-2024-0015", res: "RES-2024-0014", customer: "Beatriz Oliveira", address: "R. Guarulhos, 33 — Guarulhos, SP", date: "02/07/2024", time: "09:00–12:00", status: "A agendar", driver: "—" },
    { id: "DEV-2024-0014", res: "RES-2024-0016", customer: "Gabriela Santos", address: "R. dos Caetés, 780 — Belo Horizonte, MG", date: "24/06/2024", time: "14:00–17:00", status: "Entregue", driver: "Pedro A." },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Entregas e Retiradas</h1>
        <Btn variant="primary" size="sm"><Plus size={14} />Agendar entrega</Btn>
      </div>
      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              {["ID", "Reserva", "Cliente", "Endereço", "Data", "Janela", "Motorista", "Status", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deliveries.map(d => (
              <tr key={d.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{d.id}</td>
                <td className="px-4 py-3 text-xs font-mono text-foreground">{d.res}</td>
                <td className="px-4 py-3 text-sm text-foreground">{d.customer}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-40 truncate">{d.address}</td>
                <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{d.date}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{d.time}</td>
                <td className="px-4 py-3 text-sm text-foreground">{d.driver}</td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-4 py-3">
                  <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN HYGIENE ────────────────────────────────────────────────────────────

export function AdminHygiene() {
  const records = [
    { id: "HIG-2024-0012", unit: "RM-SF01-002", product: "Stages FX", entry: "24/06/2024", responsible: "Equipe Higienização", status: "Aprovada", done: "25/06/2024" },
    { id: "HIG-2024-0011", unit: "RM-MR40-001", product: "MamaRoo 4.0", entry: "10/05/2024", responsible: "Equipe Higienização", status: "Aprovada", done: "11/05/2024" },
    { id: "HIG-2024-0013", unit: "RM-BS01-001", product: "Boutique Swing", entry: "01/07/2024", responsible: "Equipe Higienização", status: "Em andamento", done: "—" },
    { id: "HIG-2024-0014", unit: "RM-P2S-001", product: "Polly 2 Start", entry: "20/06/2024", responsible: "Equipe Higienização", status: "Aguardando secagem", done: "—" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Higienização</h1>
        <Btn variant="primary" size="sm"><Plus size={14} />Novo registro</Btn>
      </div>
      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              {["ID", "Unidade", "Produto", "Entrada", "Responsável", "Status", "Conclusão", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map(r => (
              <tr key={r.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.id}</td>
                <td className="px-4 py-3 text-xs font-mono text-foreground">{r.unit}</td>
                <td className="px-4 py-3 text-sm text-foreground">{r.product}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{r.entry}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{r.responsible}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{r.done}</td>
                <td className="px-4 py-3">
                  <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN REPORTS ────────────────────────────────────────────────────────────

export function AdminReports() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Relatórios</h1>
        <div className="flex gap-2">
          <Btn variant="outline" size="sm"><Download size={14} />Exportar CSV</Btn>
          <Btn variant="outline" size="sm"><Download size={14} />Exportar PDF</Btn>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold text-foreground mb-4">Produtos mais alugados (Jun/2024)</p>
          <div className="flex flex-col gap-3">
            {CHART_PRODUCTS.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1"><span className="text-foreground">{p.name}</span><span className="text-muted-foreground">{p.value} loc.</span></div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(p.value / 34) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold text-foreground mb-4">Receita por mês</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={CHART_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#8A7B72" }} />
              <YAxis tick={{ fontSize: 12, fill: "#8A7B72" }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #EDE8E0" }} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
              <Line type="monotone" dataKey="receita" name="Receita" stroke="#C4674A" strokeWidth={2} dot={{ fill: "#C4674A" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 lg:col-span-2">
          <p className="font-semibold text-foreground mb-4">Resumo do período</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ["Solicitações", "94", "Jun/2024"],
              ["Conversão", "87%", "+3pp"],
              ["Ticket médio", "R$ 238", "+12%"],
              ["Renovações", "14", "+2"],
            ].map(([label, value, sub]) => (
              <div key={label} className="bg-secondary rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
                <p className="text-xs text-accent font-medium mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN GENERIC ────────────────────────────────────────────────────────────

// ─── ADMIN CONFIG ─────────────────────────────────────────────────────────────

export function AdminConfig({ shippingZones, setShippingZones, deliverySettings, updateDeliverySettings }: {
  shippingZones: ShippingZone[];
  setShippingZones: React.Dispatch<React.SetStateAction<ShippingZone[]>>;
  deliverySettings: DeliverySettings;
  updateDeliverySettings: (patch: Partial<DeliverySettings>) => void;
}) {
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [tab, setTab] = useState("frete");
  const [saved, setSaved] = useState(false);
  const [deliveryDraft, setDeliveryDraft] = useState<DeliverySettings>(deliverySettings);
  const [deliveryError, setDeliveryError] = useState("");
  const deliverySlots = useMemo(() => generateDeliverySlots(deliveryDraft), [deliveryDraft]);

  const handleSaveZone = () => {
    if (!editingZone) return;
    setShippingZones(prev =>
      prev.some(z => z.id === editingZone.id)
        ? prev.map(z => z.id === editingZone.id ? editingZone : z)
        : [...prev, editingZone]
    );
    setEditingZone(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteZone = (id: number) => {
    setShippingZones(prev => prev.filter(z => z.id !== id));
  };

  const newZoneId = Math.max(0, ...shippingZones.map(z => z.id)) + 1;

  const handleSaveDeliverySettings = () => {
    if (!isValidDeliveryTimeRange(deliveryDraft)) {
      setDeliveryError("O horário final deve permitir pelo menos uma janela completa de 30 minutos.");
      return;
    }
    updateDeliverySettings(deliveryDraft);
    setDeliveryError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
        {saved && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
            <CheckCircle size={14} />Salvo com sucesso
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b border-border mb-6">
        {[["frete", "Tabela de frete"], ["geral", "Geral"], ["notificacoes", "Notificações"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors", tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "frete" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-foreground">Zonas de frete</p>
              <p className="text-sm text-muted-foreground mt-0.5">Configure as regiões de atendimento e os valores de entrega</p>
            </div>
            <Btn variant="primary" size="sm" onClick={() => setEditingZone({ id: newZoneId, name: "", cepPrefix: "", rate: 0, description: "" })}>
              <Plus size={14} />Nova zona
            </Btn>
          </div>

          <div className="bg-white rounded-xl border border-border overflow-hidden mb-4">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  {["Zona", "Prefixos de CEP (2 dígitos)", "Frete (R$)", "Descrição", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shippingZones.map(zone => (
                  <tr key={zone.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{zone.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {zone.cepPrefix.split(",").slice(0, 8).map(p => (
                          <span key={p.trim()} className="text-xs bg-secondary border border-border px-1.5 py-0.5 rounded font-mono">{p.trim()}</span>
                        ))}
                        {zone.cepPrefix.split(",").length > 8 && (
                          <span className="text-xs text-muted-foreground">+{zone.cepPrefix.split(",").length - 8}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary">R$ {zone.rate.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{zone.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditingZone({ ...zone })} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteZone(zone.id)} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <Info size={14} className="inline mr-1" />
            Os prefixos são os <strong>2 primeiros dígitos do CEP</strong>, separados por vírgula. Ex: "01,02,03" cobre CEPs de 01000-000 a 03999-999. O sistema usa a <strong>primeira zona correspondente</strong> que encontrar.
          </div>

          {/* Edit modal */}
          {editingZone && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
              <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-foreground">{editingZone.name || "Nova zona de frete"}</h2>
                  <button onClick={() => setEditingZone(null)}><X size={20} className="text-muted-foreground" /></button>
                </div>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Nome da zona"
                    placeholder="Ex: São Paulo Capital"
                    value={editingZone.name}
                    onChange={v => setEditingZone({ ...editingZone, name: v })}
                    required
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Prefixos de CEP (2 dígitos) <span className="text-primary">*</span></label>
                    <textarea
                      value={editingZone.cepPrefix}
                      onChange={e => setEditingZone({ ...editingZone, cepPrefix: e.target.value })}
                      placeholder="Ex: 01,02,03,04,05"
                      rows={2}
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Separe os prefixos por vírgula. Cada prefixo = 2 dígitos do início do CEP.</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Valor do frete (R$) <span className="text-primary">*</span></label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={editingZone.rate}
                      onChange={e => setEditingZone({ ...editingZone, rate: Number(e.target.value) })}
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <Input
                    label="Descrição (opcional)"
                    placeholder="Ex: Região metropolitana de SP"
                    value={editingZone.description}
                    onChange={v => setEditingZone({ ...editingZone, description: v })}
                  />
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <Btn variant="outline" onClick={() => setEditingZone(null)}>Cancelar</Btn>
                  <Btn variant="primary" onClick={handleSaveZone}>
                    <Check size={14} />Salvar zona
                  </Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "geral" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="font-semibold text-foreground">Horário de funcionamento para entregas</p>
                <p className="text-sm text-muted-foreground mt-1">O cliente verá janelas fixas de 30 minutos dentro deste intervalo.</p>
              </div>
              <Clock size={20} className="text-primary shrink-0" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Início das entregas"
                type="time"
                value={deliveryDraft.startTime}
                onChange={(startTime) => { setDeliveryDraft((current) => ({ ...current, startTime })); setDeliveryError(""); }}
                required
              />
              <Input
                label="Fim das entregas"
                type="time"
                value={deliveryDraft.endTime}
                onChange={(endTime) => { setDeliveryDraft((current) => ({ ...current, endTime })); setDeliveryError(""); }}
                required
              />
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-border bg-secondary p-4">
                <p className="text-muted-foreground">Intervalo fixo</p>
                <p className="font-semibold text-foreground mt-1">30 minutos</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary p-4">
                <p className="text-muted-foreground">Fuso operacional</p>
                <p className="font-semibold text-foreground mt-1">{deliveryDraft.timeZone}</p>
              </div>
            </div>
            {deliveryError && <p className="mt-4 text-sm text-destructive">{deliveryError}</p>}
            <div className="mt-5 flex justify-end">
              <Btn variant="primary" onClick={handleSaveDeliverySettings}><Check size={14} />Salvar horários</Btn>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <p className="font-semibold text-foreground mb-1">Prévia das janelas disponíveis</p>
            <p className="text-sm text-muted-foreground mb-4">Ao selecionar o primeiro horário, o sistema apresenta automaticamente os 30 minutos seguintes.</p>
            {deliverySlots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {deliverySlots.map((slot) => <span key={slot.value} className="text-xs rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-foreground">{slot.label}</span>)}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">A configuração atual não gera nenhuma janela válida.</div>
            )}
          </div>
        </div>
      )}

      {tab === "notificacoes" && (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted-foreground">
          <Settings size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">Seção em desenvolvimento</p>
          <p className="text-sm mt-1">Esta área estará disponível em breve.</p>
        </div>
      )}
    </div>
  );
}

export function AdminGeneric({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-6">{title}</h1>
      <div className="bg-white rounded-xl border border-border p-12 text-center text-muted-foreground">
        <Archive size={40} className="mx-auto mb-4 opacity-30" />
        <p className="font-medium">Seção em desenvolvimento</p>
        <p className="text-sm mt-1">Esta área estará disponível em breve.</p>
      </div>
    </div>
  );
}

