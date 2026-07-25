import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Package,
  RefreshCw,
  Search,
  Settings,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import { AddressFields } from "../../components/forms/AddressFields";
import { Btn, Input, StatusBadge, cn } from "../../components/prototype/PrototypeUI";
import { EmptyState, ErrorState, LoadingState } from "../../components/states/DataState";
import type {
  AdminCalendarEvent,
  AdminClientSummary,
  AdminDashboardSnapshot,
  AdminReportFilters,
  AdminReportSnapshot,
  AdminUser,
} from "../../domain/admin/types";
import type { DeliverySettings } from "../../domain/delivery/types";
import { EMPTY_SHIPPING_SETTINGS, type ShippingSettings } from "../../domain/shipping/types";
import { formatMoneyFromCents } from "../../lib/money";
import { formatAdminDecimal, formatAdminMoney, parseAdminDecimal, parseAdminMultiplier, sanitizeAdminDecimalDraft } from "../../lib/adminShippingFields";
import {
  adminReportExportUrl,
  listAdminCalendarEvents,
  listAdminClients,
  listAdminUsers,
  loadAdminDashboard,
  loadAdminReport,
} from "../../services/admin/adminApi";

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function formatDate(value: string): string {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

function formatMonth(value: string): string {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function AdminSectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminDashboard() {
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setSnapshot(await loadAdminDashboard());
      setStatus("ready");
    } catch {
      setSnapshot(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (status === "loading") return <LoadingState title="Carregando painel" description="Consultando os indicadores oficiais do backend." />;
  if (status === "error" || !snapshot) return <ErrorState title="Não foi possível carregar o painel" description="Nenhum indicador fictício foi exibido." onRetry={() => void load()} />;

  const { indicators } = snapshot;
  const hasData = indicators.quotesTotal + indicators.inventoryTotal + indicators.hygienePending + indicators.maintenancePending > 0;
  const cards = [
    { label: "Orçamentos", value: indicators.quotesTotal, icon: <Clock size={18} />, detail: `${indicators.quotesInAnalysis} em análise` },
    { label: "Locações ativas", value: indicators.activeRentals, icon: <Activity size={18} />, detail: "Pedidos atualmente em locação" },
    { label: "Unidades disponíveis", value: indicators.inventoryAvailable, icon: <Package size={18} />, detail: `${indicators.inventoryTotal} unidades cadastradas` },
    { label: "Alocações ativas", value: indicators.activeAllocations, icon: <CheckCircle size={18} />, detail: "Bloqueios e reservas do estoque" },
    { label: "Entregas pendentes", value: indicators.deliveriesPending, icon: <Truck size={18} />, detail: "Fila derivada dos pedidos" },
    { label: "Em higienização", value: indicators.hygienePending, icon: <RefreshCw size={18} />, detail: "Processos ainda não encerrados" },
    { label: "Em manutenção", value: indicators.maintenancePending, icon: <Settings size={18} />, detail: "Processos ainda não encerrados" },
    { label: "Valor solicitado", value: formatMoneyFromCents(indicators.totalRequestedCents), icon: <DollarSign size={18} />, detail: "Soma dos pedidos persistidos" },
  ];

  return (
    <div>
      <AdminSectionHeader
        title="Dashboard"
        description="Indicadores calculados no backend somente a partir de registros persistidos."
        action={<Btn variant="outline" size="sm" onClick={() => void load()}><RefreshCw size={14} />Atualizar</Btn>}
      />
      {!hasData ? (
        <EmptyState title="Ainda não há dados operacionais" description="Os indicadores serão preenchidos após os primeiros cadastros e pedidos reais." />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-border bg-card p-5">
                <div className="text-primary mb-4">{card.icon}</div>
                <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                <p className="text-sm font-medium text-foreground mt-1">{card.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-5 border-b border-border"><h2 className="font-semibold text-foreground">Pedidos recentes</h2></div>
            {snapshot.recentQuotes.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">Nenhum pedido registrado.</div>
            ) : (
              <div className="divide-y divide-border">
                {snapshot.recentQuotes.map((quote) => (
                  <div key={quote.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{quote.code}</p>
                      <p className="text-xs text-muted-foreground">{quote.customerName || quote.customerEmail} · {formatDateTime(quote.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={quote.status} />
                      <span className="font-medium text-foreground">{formatMoneyFromCents(quote.totalCents)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export { AdminProducts } from "./products/AdminProducts";

export function AdminClients() {
  const [clients, setClients] = useState<AdminClientSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setClients(await listAdminClients());
      setStatus("ready");
    } catch {
      setClients([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) => `${client.name} ${client.email} ${client.cpfDigits} ${client.phone}`.toLowerCase().includes(term));
  }, [clients, search]);

  return (
    <div>
      <AdminSectionHeader
        title="Clientes"
        description="Contas e compradores anônimos consolidados pelo backend a partir dos registros reais."
        action={<Btn variant="outline" size="sm" onClick={() => void load()}><RefreshCw size={14} />Atualizar</Btn>}
      />
      {status === "loading" ? <LoadingState title="Carregando clientes" /> : status === "error" ? (
        <ErrorState title="Não foi possível carregar clientes" onRetry={() => void load()} />
      ) : clients.length === 0 ? (
        <EmptyState title="Nenhum cliente encontrado" description="Contas e compradores aparecerão após os primeiros cadastros ou pedidos reais." />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border relative">
            <Search size={15} className="absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, e-mail, CPF ou telefone" className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm" />
          </div>
          {filtered.length === 0 ? <div className="p-6"><EmptyState compact title="Nenhum resultado" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Conta</th><th className="px-4 py-3">CPF / telefone</th><th className="px-4 py-3">Pedidos</th><th className="px-4 py-3">Valor solicitado</th><th className="px-4 py-3">Último pedido</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((client) => (
                    <tr key={client.key}>
                      <td className="px-4 py-3"><p className="font-medium text-foreground">{client.name || "Nome não informado"}</p><p className="text-xs text-muted-foreground">{client.email}</p></td>
                      <td className="px-4 py-3"><StatusBadge status={client.hasAccount ? "Conta vinculada" : "Pedido anônimo"} /></td>
                      <td className="px-4 py-3"><p className="font-mono text-xs">{client.cpfDigits || "—"}</p><p className="text-xs text-muted-foreground mt-1">{client.phone || "Telefone não informado"}</p></td>
                      <td className="px-4 py-3">{client.ordersCount}</td>
                      <td className="px-4 py-3 font-medium">{formatMoneyFromCents(client.totalRequestedCents)}</td>
                      <td className="px-4 py-3">{formatDateTime(client.lastOrderAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminCalendar() {
  const [events, setEvents] = useState<AdminCalendarEvent[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setEvents(await listAdminCalendarEvents());
      setStatus("ready");
    } catch {
      setEvents([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <AdminSectionHeader
        title="Calendário"
        description="Inícios e devoluções extraídos dos itens de pedidos persistidos."
        action={<Btn variant="outline" size="sm" onClick={() => void load()}><RefreshCw size={14} />Atualizar</Btn>}
      />
      {status === "loading" ? <LoadingState title="Carregando agenda" /> : status === "error" ? (
        <ErrorState title="Não foi possível carregar a agenda" onRetry={() => void load()} />
      ) : events.length === 0 ? (
        <EmptyState title="Nenhum evento agendado" description="Inícios e devoluções aparecerão quando houver pedidos com datas definidas." />
      ) : (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {events.map((event) => (
            <div key={event.id} className="p-4 flex flex-wrap items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><CalendarDays size={18} /></div>
              <div className="flex-1 min-w-52">
                <p className="font-medium text-foreground">{event.type === "rental_start" ? "Início" : "Devolução"}: {event.label}</p>
                <p className="text-xs text-muted-foreground">{event.quoteCode} · {event.customerName}</p>
              </div>
              <StatusBadge status={event.status} />
              <span className="text-sm font-medium text-foreground">{formatDate(event.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ReportFormFilters {
  from: string;
  to: string;
  status: string;
}

function toAdminReportFilters(filters: ReportFormFilters): AdminReportFilters {
  const result: AdminReportFilters = {};
  if (filters.from) result.from = filters.from;
  if (filters.to) result.to = filters.to;
  if (filters.status) result.status = filters.status;
  return result;
}

export function AdminReports() {
  const [report, setReport] = useState<AdminReportSnapshot | null>(null);
  const [filters, setFilters] = useState<ReportFormFilters>({ from: "", to: "", status: "" });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async (nextFilters: AdminReportFilters) => {
    setStatus("loading");
    try {
      setReport(await loadAdminReport(nextFilters));
      setStatus("ready");
    } catch {
      setReport(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => { void load({}); }, [load]);

  const reset = () => {
    setFilters({ from: "", to: "", status: "" });
    void load({});
  };

  return (
    <div>
      <AdminSectionHeader
        title="Relatórios"
        description="Consultas e exportação calculadas pelo backend sobre pedidos persistidos."
        action={<Btn variant="outline" size="sm" onClick={() => window.location.assign(adminReportExportUrl(toAdminReportFilters(filters)))}><Download size={14} />Exportar CSV</Btn>}
      />
      <div className="rounded-2xl border border-border bg-card p-5 mb-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input label="De" type="date" value={filters.from} onChange={(from) => setFilters((current) => ({ ...current, from }))} />
          <Input label="Até" type="date" value={filters.to} onChange={(to) => setFilters((current) => ({ ...current, to }))} />
          <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Status</span><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-sm"><option value="">Todos</option>{["Em análise", "Aprovado", "Em preparação", "Em locação", "Devolvido", "Expirado", "Cancelado"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="flex gap-2"><Btn variant="primary" size="sm" onClick={() => void load(toAdminReportFilters(filters))}>Aplicar</Btn><Btn variant="ghost" size="sm" onClick={reset}>Limpar</Btn></div>
        </div>
      </div>
      {status === "loading" ? <LoadingState title="Carregando relatórios" /> : status === "error" || !report ? (
        <ErrorState title="Não foi possível carregar relatórios" onRetry={() => void load(toAdminReportFilters(filters))} />
      ) : report.totals.quotes === 0 ? (
        <EmptyState title="Não há dados para este relatório" description="Nenhuma série ou receita fictícia foi apresentada." />
      ) : (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Pedidos</p><p className="text-3xl font-semibold mt-2">{report.totals.quotes}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Clientes</p><p className="text-3xl font-semibold mt-2">{report.totals.customers}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Valor solicitado</p><p className="text-2xl font-semibold text-primary mt-2">{formatMoneyFromCents(report.totals.requestedCents)}</p></div>
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            <section className="rounded-2xl border border-border bg-card overflow-hidden"><div className="p-5 border-b border-border"><h2 className="font-semibold">Por status</h2></div><div className="divide-y divide-border">{report.byStatus.map((row) => <div key={row.status} className="p-4 flex justify-between items-center gap-3"><div><StatusBadge status={row.status} /><p className="text-xs text-muted-foreground mt-1">{formatMoneyFromCents(row.totalCents)}</p></div><strong>{row.count}</strong></div>)}</div></section>
            <section className="rounded-2xl border border-border bg-card overflow-hidden"><div className="p-5 border-b border-border"><h2 className="font-semibold">Por mês</h2></div><div className="divide-y divide-border">{report.byMonth.map((row) => <div key={row.month} className="p-4 flex justify-between items-center gap-3"><div><p className="text-sm font-medium capitalize">{formatMonth(row.month)}</p><p className="text-xs text-muted-foreground">{formatMoneyFromCents(row.totalCents)}</p></div><strong>{row.count}</strong></div>)}</div></section>
            <section className="rounded-2xl border border-border bg-card overflow-hidden"><div className="p-5 border-b border-border"><h2 className="font-semibold">Produtos solicitados</h2></div><div className="divide-y divide-border">{report.byProduct.map((row) => <div key={row.productId || row.name} className="p-4 flex justify-between items-center gap-3"><p className="text-sm font-medium">{row.name}</p><strong>{row.quantity}</strong></div>)}</div></section>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setUsers(await listAdminUsers());
      setStatus("ready");
    } catch {
      setUsers([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? users.filter((user) => `${user.name} ${user.email} ${user.cpfDigits ?? ""} ${user.role}`.toLowerCase().includes(term)) : users;
  }, [search, users]);

  return (
    <div>
      <AdminSectionHeader
        title="Usuários e permissões"
        description="Contas persistidas. Esta etapa exibe os papéis reais sem criar contas ou permissões inexistentes."
        action={<Btn variant="outline" size="sm" onClick={() => void load()}><RefreshCw size={14} />Atualizar</Btn>}
      />
      {status === "loading" ? <LoadingState title="Carregando usuários" /> : status === "error" ? (
        <ErrorState title="Não foi possível carregar usuários" onRetry={() => void load()} />
      ) : users.length === 0 ? (
        <EmptyState title="Nenhum usuário cadastrado" description="Somente contas persistidas serão exibidas neste módulo." />
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4"><UserCheck className="text-primary" /><div><p className="text-2xl font-semibold">{users.filter((user) => user.role === "admin").length}</p><p className="text-sm text-muted-foreground">Administradores</p></div></div>
            <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4"><Users className="text-primary" /><div><p className="text-2xl font-semibold">{users.filter((user) => user.role === "client").length}</p><p className="text-sm text-muted-foreground">Clientes com conta</p></div></div>
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border relative"><Search size={15} className="absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar usuário" className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm" /></div>
            {filtered.length === 0 ? <div className="p-6"><EmptyState compact title="Nenhum resultado" /></div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-secondary text-left text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Usuário</th><th className="px-4 py-3">Papel</th><th className="px-4 py-3">CPF</th><th className="px-4 py-3">Criado em</th></tr></thead><tbody className="divide-y divide-border">{filtered.map((user) => <tr key={user.id}><td className="px-4 py-3"><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></td><td className="px-4 py-3"><StatusBadge status={user.role === "admin" ? "Administrador" : "Cliente"} /></td><td className="px-4 py-3 font-mono text-xs">{user.cpfDigits ?? "—"}</td><td className="px-4 py-3">{formatDateTime(user.createdAt)}</td></tr>)}</tbody></table></div>}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminConfig({ shippingSettings, updateShippingSettings, deliverySettings, updateDeliverySettings, saveDeliverySettingsNow, routeProviderStatus, settingsStatus = "ready", refreshDeliverySettings }: {
  shippingSettings: ShippingSettings | null;
  updateShippingSettings: (settings: ShippingSettings | null) => void;
  deliverySettings: DeliverySettings;
  updateDeliverySettings: (patch: Partial<DeliverySettings>) => void;
  saveDeliverySettingsNow: (override?: { shippingSettings: ShippingSettings | null; deliverySettings: DeliverySettings }) => Promise<void>;
  routeProviderStatus: { name: string; configured: boolean };
  settingsStatus?: "loading" | "ready" | "empty" | "dirty" | "saving" | "error";
  refreshDeliverySettings?: () => Promise<void>;
}) {
  const shippingConfigured = shippingSettings !== null;
  const shipping: ShippingSettings = shippingSettings ?? {
    ...EMPTY_SHIPPING_SETTINGS,
    originAddress: { ...EMPTY_SHIPPING_SETTINGS.originAddress },
  };
  const [numericDraft, setNumericDraft] = useState(() => ({
    fuelPrice: formatAdminMoney(shipping.fuelPriceCentsPerLiter),
    consumption: formatAdminDecimal(shipping.consumptionKmPerLiter),
    multiplier: formatAdminDecimal(shipping.multiplier, 1, 2),
    minimumFee: formatAdminMoney(shipping.minimumFeeCents),
    maxDistance: shipping.maxDistanceKm === null ? "" : formatAdminDecimal(shipping.maxDistanceKm),
  }));

  useEffect(() => {
    setNumericDraft({
      fuelPrice: formatAdminMoney(shipping.fuelPriceCentsPerLiter),
      consumption: formatAdminDecimal(shipping.consumptionKmPerLiter),
      multiplier: formatAdminDecimal(shipping.multiplier, 1, 2),
      minimumFee: formatAdminMoney(shipping.minimumFeeCents),
      maxDistance: shipping.maxDistanceKm === null ? "" : formatAdminDecimal(shipping.maxDistanceKm),
    });
  }, [shipping.fuelPriceCentsPerLiter, shipping.consumptionKmPerLiter, shipping.multiplier, shipping.minimumFeeCents, shipping.maxDistanceKm]);

  const updateShipping = (patch: Partial<ShippingSettings>) => {
    updateShippingSettings({
      ...shipping,
      ...patch,
      originAddress: patch.originAddress ?? shipping.originAddress,
    });
  };
  const shippingFromDraft = (): ShippingSettings => ({
    ...shipping,
    fuelPriceCentsPerLiter: Math.round(parseAdminDecimal(numericDraft.fuelPrice) * 100),
    consumptionKmPerLiter: parseAdminDecimal(numericDraft.consumption),
    multiplier: parseAdminMultiplier(numericDraft.multiplier),
    minimumFeeCents: Math.round(parseAdminDecimal(numericDraft.minimumFee) * 100),
    maxDistanceKm: numericDraft.maxDistance.trim() ? parseAdminDecimal(numericDraft.maxDistance) : null,
  });
  const commitNumericDraft = () => {
    const next = shippingFromDraft();
    updateShippingSettings(next);
    setNumericDraft({
      fuelPrice: formatAdminMoney(next.fuelPriceCentsPerLiter),
      consumption: formatAdminDecimal(next.consumptionKmPerLiter),
      multiplier: formatAdminDecimal(next.multiplier, 1, 2),
      minimumFee: formatAdminMoney(next.minimumFeeCents),
      maxDistance: next.maxDistanceKm === null ? "" : formatAdminDecimal(next.maxDistanceKm),
    });
    return next;
  };
  const saveSettings = async () => {
    const nextShipping = commitNumericDraft();
    await saveDeliverySettingsNow({ shippingSettings: nextShipping, deliverySettings });
  };
  const removeShipping = async () => {
    updateShippingSettings(null);
    await saveDeliverySettingsNow({ shippingSettings: null, deliverySettings });
  };
  const shippingReady = Boolean(
    shipping.originLabel.trim()
    && shipping.originAddress.cep.replace(/\D/g, "").length === 8
    && shipping.originAddress.street.trim()
    && shipping.originAddress.number.trim()
    && shipping.originAddress.city.trim()
    && /^[A-Za-z]{2}$/.test(shipping.originAddress.state.trim())
    && shipping.fuelPriceCentsPerLiter > 0
    && shipping.consumptionKmPerLiter > 0
    && shipping.multiplier > 0
  );

  if (settingsStatus === "loading") return <LoadingState title="Carregando configurações" />;
  if (settingsStatus === "error" && !shippingConfigured) return <ErrorState title="Não foi possível carregar as configurações" description="Nenhum parâmetro fictício foi utilizado." onRetry={refreshDeliverySettings ? () => void refreshDeliverySettings() : undefined} />;

  return (
    <div>
      <AdminSectionHeader title="Configurações" description="Janelas de entrega e fórmula oficial de frete calculada no backend." />
      <div className="rounded-2xl border border-border bg-card p-5 mb-6">
        <h2 className="font-semibold text-foreground mb-4">Janelas de entrega</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Início" type="time" value={deliverySettings.startTime} onChange={(startTime) => updateDeliverySettings({ startTime })} />
          <Input label="Fim" type="time" value={deliverySettings.endTime} onChange={(endTime) => updateDeliverySettings({ endTime })} />
          <Input label="Intervalo em minutos" value="30" readOnly helper="Intervalo fixo da regra atual" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap"><h2 className="font-semibold text-foreground">Frete por distância e combustível</h2><span className={cn("text-xs rounded-full border px-2 py-1", shipping.enabled && shippingReady ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700")}>{shipping.enabled && shippingReady ? "Ativo e preenchido" : shippingConfigured ? "Configuração incompleta ou desativada" : "Ainda não configurado"}</span></div>
            <p className="text-xs text-muted-foreground mt-1">Preencha os valores abaixo e clique em “Salvar configurações”. O backend consulta a rota e calcula o valor final.</p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground"><input type="checkbox" checked={shipping.enabled} onChange={(event) => updateShipping({ enabled: event.target.checked })} className="accent-primary" />Entrega ativa</label>
        </div>
        <div className="p-5 space-y-6">
          {!shippingConfigured && <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground"><p className="font-medium">A configuração está pronta para preenchimento</p><p className="text-muted-foreground mt-1">O primeiro campo alterado cria o registro local. Complete os dados, salve e só então marque “Entrega ativa”.</p></div>}
          <div className={cn("rounded-xl border p-4 text-sm", routeProviderStatus.configured ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800")}>
            <p className="font-medium">Provedor de rotas: {routeProviderStatus.configured ? "configurado" : "não configurado"}</p>
            <p className="mt-1 text-xs">{routeProviderStatus.configured ? `Backend ativo com ${routeProviderStatus.name}.` : "Adicione GOOGLE_MAPS_API_KEY ao .env do backend e reinicie o processo na porta 3000. Os valores comerciais podem ser salvos, mas o frete não será calculado sem o provedor."}</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-4">Ponto de origem</h3>
            <Input label="Nome do ponto de saída" value={shipping.originLabel} onChange={(originLabel) => updateShipping({ originLabel })} placeholder="Ex.: Estoque Rent4Moms" />
            <div className="mt-4"><AddressFields address={shipping.originAddress} onChange={(patch) => updateShipping({ originAddress: { ...shipping.originAddress, ...patch } })} errors={{}} /></div>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-4">Parâmetros da fórmula</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Gasolina por litro (R$)" value={numericDraft.fuelPrice} onChange={(value) => setNumericDraft((current) => ({ ...current, fuelPrice: sanitizeAdminDecimalDraft(value, 2) }))} onBlur={() => void commitNumericDraft()} inputMode="decimal" helper="Aceita ponto ou vírgula. Ex.: 6,19" />
              <Input label="Consumo do veículo (km/l)" value={numericDraft.consumption} onChange={(value) => setNumericDraft((current) => ({ ...current, consumption: sanitizeAdminDecimalDraft(value, 2) }))} onBlur={() => void commitNumericDraft()} inputMode="decimal" helper="Ex.: 10,5" />
              <Input label="Multiplicador" value={numericDraft.multiplier} onChange={(value) => setNumericDraft((current) => ({ ...current, multiplier: sanitizeAdminDecimalDraft(value, 2) }))} onBlur={() => void commitNumericDraft()} inputMode="decimal" helper="Digite 12 para 1,2; 1,2 acrescenta 20%" />
              <Input label="Taxa mínima (R$)" value={numericDraft.minimumFee} onChange={(value) => setNumericDraft((current) => ({ ...current, minimumFee: sanitizeAdminDecimalDraft(value, 2) }))} onBlur={() => void commitNumericDraft()} inputMode="decimal" helper="Aceita ponto ou vírgula" />
              <Input label="Distância máxima (km)" value={numericDraft.maxDistance} onChange={(value) => setNumericDraft((current) => ({ ...current, maxDistance: sanitizeAdminDecimalDraft(value, 2) }))} onBlur={() => void commitNumericDraft()} inputMode="decimal" helper="Opcional; considera somente o trajeto de ida" />
              <label className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-foreground"><input type="checkbox" checked={shipping.roundTrip} onChange={(event) => updateShipping({ roundTrip: event.target.checked })} className="accent-primary" />Cobrar ida e volta</label>
            </div>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground"><p className="font-medium mb-1">Fórmula aplicada</p><p className="text-muted-foreground">máximo(taxa mínima, distância cobrada ÷ consumo × gasolina × multiplicador)</p><p className="text-xs text-muted-foreground mt-2">A distância cobrada será {shipping.roundTrip ? "duas vezes a rota de ida" : "somente a rota de ida"}.</p></div>
          {shipping.enabled && !shippingReady && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">A entrega está marcada como ativa, mas ainda faltam dados obrigatórios. Preencha origem, CEP, rua, número, cidade, UF, combustível, consumo e multiplicador.</div>}
        </div>
        <div className="p-5 border-t border-border flex flex-wrap justify-between items-center gap-4">
          <div>{shippingConfigured && <Btn variant="danger" size="sm" onClick={() => void removeShipping().catch(() => undefined)} disabled={settingsStatus === "saving"}>Remover configuração</Btn>}</div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">{settingsStatus === "saving" ? "Salvando configurações..." : settingsStatus === "error" ? "Erro ao salvar. Revise os campos." : settingsStatus === "dirty" ? "Há alterações não salvas." : shippingConfigured ? "Configurações salvas." : "Comece preenchendo os campos."}</p>
            <Btn variant="primary" onClick={() => void saveSettings().catch(() => undefined)} disabled={settingsStatus === "saving"}>{settingsStatus === "saving" ? "Salvando..." : "Salvar configurações"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

