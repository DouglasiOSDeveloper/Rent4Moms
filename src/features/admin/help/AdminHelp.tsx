import React, { useMemo, useState } from "react";
import { BookOpen, Camera, CheckCircle2, KeyRound, LifeBuoy, Search, Workflow } from "lucide-react";
import { cn } from "../../../components/prototype/PrototypeUI";
import { ADMIN_MODULES, MEDIA_LOCATIONS, PERMISSION_GUIDE, QUOTE_LIFECYCLE, RUNBOOKS, STATUS_GROUPS } from "./adminHelpContent";

const TABS = [
  { id: "modules", label: "Módulos", icon: BookOpen },
  { id: "media", label: "Fotos", icon: Camera },
  { id: "lifecycle", label: "Ciclo", icon: Workflow },
  { id: "statuses", label: "Status", icon: CheckCircle2 },
  { id: "permissions", label: "Permissões", icon: KeyRound },
  { id: "runbooks", label: "Runbooks", icon: LifeBuoy },
] as const;

type TabId = typeof TABS[number]["id"];

function SectionTitle({ title, description }: { title: string; description: string }) {
  return <div className="mb-5"><h2 className="text-xl font-semibold text-foreground">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>;
}

export function AdminHelp() {
  const [tab, setTab] = useState<TabId>("modules");
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();

  const modules = useMemo(() => ADMIN_MODULES.filter((item) => !term || `${item.label} ${item.group} ${item.purpose} ${item.sourceOfTruth}`.toLowerCase().includes(term)), [term]);
  const media = useMemo(() => MEDIA_LOCATIONS.filter((item) => !term || `${item.owner} ${item.location} ${item.publicUse} ${item.rules.join(" ")}`.toLowerCase().includes(term)), [term]);
  const runbooks = useMemo(() => RUNBOOKS.filter((item) => !term || `${item.title} ${item.when} ${item.steps.join(" ")} ${item.expectedResult}`.toLowerCase().includes(term)), [term]);

  return <div className="max-w-6xl mx-auto">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Etapa I</p><h1 className="mt-1 text-2xl font-semibold text-foreground">Central de ajuda operacional</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Mapa dos módulos, local correto de cada foto, efeitos dos status, gatilhos do ciclo e procedimentos seguros. Este conteúdo descreve o comportamento implementado; não cria dados nem regras paralelas.</p></div>
      <label className="relative block w-full sm:w-80"><span className="sr-only">Buscar na ajuda</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar módulo, status ou procedimento" className="w-full rounded-xl border border-border bg-white py-2.5 pl-9 pr-3 text-sm" /></label>
    </div>

    <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-white p-2" role="tablist" aria-label="Seções da ajuda">
      {TABS.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn("inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium", tab === id ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}><Icon size={15} />{label}</button>)}
    </div>

    {tab === "modules" && <section><SectionTitle title="Mapa de módulos" description="Responsabilidade, fonte oficial e efeito de cada área administrativa." />{modules.length === 0 ? <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">Nenhum módulo corresponde à busca.</p> : <div className="grid gap-4 lg:grid-cols-2">{modules.map((item) => <article key={item.page} className="rounded-2xl border border-border bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase text-primary">{item.group}</p><h3 className="mt-1 font-semibold text-foreground">{item.label}</h3></div><code className="max-w-56 break-all rounded bg-secondary px-2 py-1 text-[10px] text-muted-foreground">{item.sourceOfTruth}</code></div><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.purpose}</p><ul className="mt-3 space-y-1 text-xs text-muted-foreground">{item.keyEffects.map((effect) => <li key={effect}>• {effect}</li>)}</ul></article>)}</div>}</section>}

    {tab === "media" && <section><SectionTitle title="Onde cadastrar cada foto" description="A mídia precisa pertencer à entidade ou operação correta para aparecer no lugar esperado." />{media.length === 0 ? <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">Nenhuma mídia corresponde à busca.</p> : <div className="space-y-4">{media.map((item) => <article key={item.owner} className="rounded-2xl border border-border bg-white p-5"><div className="grid gap-4 md:grid-cols-[180px_1fr]"><h3 className="font-semibold text-foreground">{item.owner}</h3><div><p className="rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-foreground">{item.location}</p><p className="mt-3 text-sm text-muted-foreground">{item.publicUse}</p><ul className="mt-2 space-y-1 text-xs text-muted-foreground">{item.rules.map((rule) => <li key={rule}>• {rule}</li>)}</ul></div></div></article>)}</div>}</section>}

    {tab === "lifecycle" && <section><SectionTitle title="Ciclo completo do pedido" description="Cada ação é validada no servidor e altera pedido, alocações, unidades e timeline de forma coordenada." /><div className="space-y-3">{QUOTE_LIFECYCLE.map((step, index) => <article key={step.action} className="rounded-2xl border border-border bg-white p-5"><div className="flex gap-4"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">{index + 1}</div><div><h3 className="font-semibold text-foreground">{step.action}</h3><p className="mt-1 text-xs text-muted-foreground">{step.from} → <strong className="text-foreground">{step.to}</strong></p><p className="mt-2 text-sm text-muted-foreground">{step.effect}</p></div></div></article>)}</div></section>}

    {tab === "statuses" && <section><SectionTitle title="Glossário de status" description="Código persistido, efeito operacional e próximo passo esperado." /><div className="space-y-6">{STATUS_GROUPS.map((group) => <div key={group.id}><h3 className="mb-3 font-semibold text-foreground">{group.title}</h3><div className="overflow-x-auto rounded-2xl border border-border bg-white"><table className="w-full min-w-[760px] text-sm"><thead className="bg-secondary text-left text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Status</th><th className="px-4 py-3">Efeito</th><th className="px-4 py-3">Próximo passo</th></tr></thead><tbody className="divide-y divide-border">{group.statuses.filter((item) => !term || `${group.title} ${item.code} ${item.label} ${item.effect} ${item.next}`.toLowerCase().includes(term)).map((item) => <tr key={item.code}><td className="px-4 py-3"><p className="font-medium text-foreground">{item.label}</p><code className="text-[11px] text-muted-foreground">{item.code}</code></td><td className="px-4 py-3 text-muted-foreground">{item.effect}</td><td className="px-4 py-3 text-muted-foreground">{item.next}</td></tr>)}</tbody></table></div></div>)}</div></section>}

    {tab === "permissions" && <section><SectionTitle title="Papéis e permissões" description="A autorização efetiva é validada no backend. A versão atual possui apenas client e admin como papéis autenticados." /><div className="grid gap-4 md:grid-cols-3">{PERMISSION_GUIDE.map((item) => <article key={item.role} className="rounded-2xl border border-border bg-white p-5"><h3 className="font-semibold text-foreground">{item.role}</h3><p className="mt-3 text-sm text-muted-foreground">{item.access}</p><p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground"><strong>Limites:</strong> {item.restrictions}</p></article>)}</div></section>}

    {tab === "runbooks" && <section><SectionTitle title="Runbooks operacionais" description="Sequências curtas para executar tarefas críticas sem criar atalhos fora da fonte oficial." />{runbooks.length === 0 ? <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">Nenhum runbook corresponde à busca.</p> : <div className="space-y-4">{runbooks.map((item) => <article key={item.id} className="rounded-2xl border border-border bg-white p-5"><h3 className="font-semibold text-foreground">{item.title}</h3><p className="mt-1 text-xs text-muted-foreground"><strong>Quando usar:</strong> {item.when}</p><ol className="mt-4 space-y-2 text-sm text-muted-foreground">{item.steps.map((step, index) => <li key={step} className="flex gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">{index + 1}</span><span>{step}</span></li>)}</ol><p className="mt-4 rounded-xl bg-primary/5 p-3 text-sm text-foreground"><strong>Resultado esperado:</strong> {item.expectedResult}</p></article>)}</div>}</section>}
  </div>;
}
