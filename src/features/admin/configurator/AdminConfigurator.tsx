import React, { useMemo, useState } from "react";
import { Edit, Image, Layers, Package, Plus, Save, Trash2, X } from "lucide-react";
import { Btn, cn } from "../../../components/prototype/PrototypeUI";
import { getAngleLabel, resolveAssemblyImageUrl } from "../../../domain/catalog/assemblyImages";
import { isAssemblyVariantComplete } from "../../../domain/catalog/configurator";
import type {
  AssemblyAngle,
  AssemblyImage,
  AssemblyVariant,
  AssemblyVariantInput,
  BallSet,
  CatalogComponentType,
  ChairModel,
  ConfigurableComponentInput,
  Cover,
  Reducer,
} from "../../../domain/catalog/types";
import { formatMoneyFromCents } from "../../../lib/money";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";

const ANGLES: AssemblyAngle[] = ["FRT", "DIR", "ESQ", "SUP"];

function numberValue(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function ModelCard({ model }: { model: ChairModel }) {
  const { updateChairModel } = useCatalog();
  const [description, setDescription] = useState(model.description);
  const [quantity, setQuantity] = useState(String(model.availableQuantity));
  const [active, setActive] = useState(model.isActive);

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div><p className="font-semibold text-foreground">{model.name}</p><p className="text-xs text-muted-foreground">{model.technicalCode} · produto: {model.productId ?? "a cadastrar"}</p></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="accent-primary" />Ativo</label>
      </div>
      <label className="text-sm font-medium text-foreground">Descrição acumulada da cadeira</label>
      <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2 text-sm" />
      <div className="mt-3 flex items-end gap-3">
        <label className="text-sm font-medium text-foreground flex-1">Quantidade disponível<input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="0" className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
        <Btn variant="primary" size="sm" onClick={() => updateChairModel(model.id, { description, isActive: active, availableQuantity: numberValue(quantity) })}><Save size={14} />Salvar</Btn>
      </div>
    </div>
  );
}

function BallSetCard({ ballSet }: { ballSet: BallSet }) {
  const { updateBallSet, chairModels } = useCatalog();
  const model = chairModels.find((item) => item.id === ballSet.modelId);
  const [description, setDescription] = useState(ballSet.description);
  const [quantity, setQuantity] = useState(String(ballSet.availableQuantity));
  const [active, setActive] = useState(ballSet.isActive);

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div><p className="font-semibold text-foreground">{ballSet.name}</p><p className="text-xs text-muted-foreground">{ballSet.code} · exclusivo de {model?.name ?? ballSet.modelId}</p></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="accent-primary" />Ativo</label>
      </div>
      <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="w-full rounded-xl border border-border bg-input-background px-3 py-2 text-sm" />
      <div className="mt-3 flex items-end gap-3"><label className="text-sm font-medium text-foreground flex-1">Quantidade disponível<input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="0" className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label><Btn variant="primary" size="sm" onClick={() => updateBallSet(ballSet.id, { description, isActive: active, availableQuantity: numberValue(quantity) })}><Save size={14} />Salvar</Btn></div>
    </div>
  );
}

interface ComponentEditorProps {
  type: CatalogComponentType;
  component?: Cover | Reducer;
  onClose: () => void;
}

function ComponentEditor({ type, component, onClose }: ComponentEditorProps) {
  const { chairModels, compatibilities, saveCover, saveReducer } = useCatalog();
  const currentCompatibilities = compatibilities.filter((item) => item.componentType === type && item.componentId === component?.id);
  const [name, setName] = useState(component?.name ?? "");
  const [code, setCode] = useState(component?.code ?? "");
  const [description, setDescription] = useState(component?.description ?? "");
  const [quantity, setQuantity] = useState(String(component?.availableQuantity ?? 0));
  const [daily, setDaily] = useState(String(component?.priceAdjustment.daily ?? 0));
  const [weekly, setWeekly] = useState(String(component?.priceAdjustment.weekly ?? 0));
  const [monthly, setMonthly] = useState(String(component?.priceAdjustment.monthly ?? 0));
  const [active, setActive] = useState(component?.isActive ?? true);
  const [modelIds, setModelIds] = useState(currentCompatibilities.map((item) => item.modelId));
  const [preferredModelIds, setPreferredModelIds] = useState(currentCompatibilities.filter((item) => item.isPreferred).map((item) => item.modelId));

  const toggleModel = (modelId: string) => {
    setModelIds((current) => current.includes(modelId) ? current.filter((id) => id !== modelId) : [...current, modelId]);
    if (modelIds.includes(modelId)) setPreferredModelIds((current) => current.filter((id) => id !== modelId));
  };

  const submit = () => {
    if (!name.trim() || !code.trim() || modelIds.length === 0) return;
    const input: ConfigurableComponentInput = {
      name,
      code,
      description,
      availableQuantity: numberValue(quantity),
      isActive: active,
      priceAdjustment: { daily: numberValue(daily), weekly: numberValue(weekly), monthly: numberValue(monthly) },
      compatibleModelIds: modelIds,
      preferredModelIds: preferredModelIds.filter((id) => modelIds.includes(id)),
    };
    if (type === "cover") saveCover(input, component?.id);
    else saveReducer(input, component?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-border p-6">
        <div className="flex justify-between gap-3 mb-5"><div><h2 className="text-lg font-semibold text-foreground">{component ? "Editar" : "Novo"} {type === "cover" ? "pano" : "redutor"}</h2><p className="text-sm text-muted-foreground">As alterações são refletidas imediatamente no configurador público.</p></div><button onClick={onClose} aria-label="Fechar"><X size={20} /></button></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm font-medium">Nome *<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Código *<input value={code} onChange={(event) => setCode(event.target.value)} placeholder={type === "cover" ? "p12" : "r05"} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium sm:col-span-2">Descrição<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Quantidade disponível<input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="0" className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="accent-primary" />Componente ativo</label>
        </div>
        <div className="mt-5"><p className="font-medium text-sm text-foreground mb-2">Acréscimo de preço demonstrativo</p><div className="grid grid-cols-3 gap-3"><label className="text-xs text-muted-foreground">Diária<input value={daily} onChange={(event) => setDaily(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2 text-sm" /></label><label className="text-xs text-muted-foreground">Semanal<input value={weekly} onChange={(event) => setWeekly(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2 text-sm" /></label><label className="text-xs text-muted-foreground">30 dias<input value={monthly} onChange={(event) => setMonthly(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2 text-sm" /></label></div></div>
        <div className="mt-5"><p className="font-medium text-sm text-foreground mb-2">Compatibilidade *</p><div className="grid sm:grid-cols-2 gap-2">{chairModels.map((model) => { const compatible = modelIds.includes(model.id); return <div key={model.id} className={cn("rounded-xl border p-3", compatible ? "border-primary bg-primary/5" : "border-border")}><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={compatible} onChange={() => toggleModel(model.id)} className="accent-primary" />{model.name}</label><label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" disabled={!compatible} checked={preferredModelIds.includes(model.id)} onChange={() => setPreferredModelIds((current) => current.includes(model.id) ? current.filter((id) => id !== model.id) : [...current, model.id])} className="accent-primary" />Preferencial neste modelo</label></div>; })}</div></div>
        <div className="flex justify-end gap-3 mt-6"><Btn variant="outline" onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={submit} disabled={!name.trim() || !code.trim() || modelIds.length === 0}><Save size={14} />Salvar</Btn></div>
      </div>
    </div>
  );
}

function ComponentTable({ type }: { type: CatalogComponentType }) {
  const catalog = useCatalog();
  const components = type === "cover" ? catalog.covers : catalog.reducers;
  const [editing, setEditing] = useState<Cover | Reducer | undefined>();
  const [editorOpen, setEditorOpen] = useState(false);

  const remove = (component: Cover | Reducer) => {
    if (!window.confirm(`Excluir ${component.name}?`)) return;
    const result = type === "cover" ? catalog.deleteCover(component.id) : catalog.deleteReducer(component.id);
    if (!result.ok) window.alert(result.reason);
  };

  return (
    <div>
      <div className="flex justify-between gap-3 items-center mb-4"><p className="text-sm text-muted-foreground">CRUD local e persistente para {type === "cover" ? "panos" : "redutores"}, incluindo compatibilidades, descrição, preço e quantidade.</p><Btn variant="primary" size="sm" onClick={() => { setEditing(undefined); setEditorOpen(true); }}><Plus size={14} />Novo {type === "cover" ? "pano" : "redutor"}</Btn></div>
      <div className="bg-white border border-border rounded-xl overflow-x-auto"><table className="w-full"><thead className="bg-secondary border-b border-border"><tr>{["Componente", "Compatível com", "Acréscimo/30 dias", "Disponível", "Status", ""].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">{heading}</th>)}</tr></thead><tbody className="divide-y divide-border">{components.map((component) => { const modelNames = catalog.compatibilities.filter((item) => item.componentType === type && item.componentId === component.id).map((item) => catalog.chairModels.find((model) => model.id === item.modelId)?.version).filter(Boolean); return <tr key={component.id}><td className="px-4 py-3"><p className="font-medium text-sm text-foreground">{component.name}</p><p className="text-xs text-muted-foreground">{component.code}</p></td><td className="px-4 py-3 text-sm text-muted-foreground">{modelNames.join(", ") || "—"}</td><td className="px-4 py-3 text-sm">{formatMoneyFromCents(Math.round(component.priceAdjustment.monthly * 100))}</td><td className="px-4 py-3 text-sm">{component.availableQuantity}</td><td className="px-4 py-3"><span className={cn("text-xs rounded-full border px-2 py-1", component.isActive ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-600")}>{component.isActive ? "Ativo" : "Inativo"}</span></td><td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => { setEditing(component); setEditorOpen(true); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Edit size={14} /></button><button onClick={() => remove(component)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={14} /></button></div></td></tr>; })}</tbody></table></div>
      {editorOpen && <ComponentEditor type={type} component={editing} onClose={() => setEditorOpen(false)} />}
    </div>
  );
}

function makeImages(prefix: string): AssemblyImage[] {
  return ANGLES.map((angle) => ({ angle, assetKey: `${prefix}_${angle}`, alt: `${prefix} — ${getAngleLabel(angle)}`, isPlaceholder: true }));
}

function VariantEditor({ variant, onClose }: { variant?: AssemblyVariant; onClose: () => void }) {
  const catalog = useCatalog();
  const [modelId, setModelId] = useState(variant?.modelId ?? catalog.chairModels.find((model) => model.isActive)?.id ?? catalog.chairModels[0]?.id ?? "");
  const [coverId, setCoverId] = useState(variant?.coverId ?? catalog.covers[0]?.id ?? "");
  const [reducerId, setReducerId] = useState(variant?.reducerId ?? "");
  const [prefix, setPrefix] = useState(variant?.prefix ?? "");
  const [active, setActive] = useState(variant?.isActive ?? true);
  const [status, setStatus] = useState<AssemblyVariantInput["publicationStatus"]>(variant?.publicationStatus ?? "draft");
  const [images, setImages] = useState<AssemblyImage[]>(variant?.images ?? []);
  const ballSet = catalog.ballSets.find((item) => item.modelId === modelId);
  const compatibleCoverIds = new Set(catalog.compatibilities.filter((item) => item.modelId === modelId && item.componentType === "cover").map((item) => item.componentId));
  const compatibleReducerIds = new Set(catalog.compatibilities.filter((item) => item.modelId === modelId && item.componentType === "reducer").map((item) => item.componentId));
  const covers = catalog.covers.filter((item) => compatibleCoverIds.has(item.id));
  const reducers = catalog.reducers.filter((item) => compatibleReducerIds.has(item.id));

  const ensureImages = () => setImages(makeImages(prefix || "variante"));
  const updateImage = (angle: AssemblyAngle, assetKey: string) => setImages((current) => {
    const existing = current.find((image) => image.angle === angle);
    const next: AssemblyImage = { angle, assetKey, alt: existing?.alt ?? `${prefix} — ${getAngleLabel(angle)}`, isPlaceholder: !/^(https?:|data:|blob:|\/)/.test(assetKey) };
    return existing ? current.map((image) => image.angle === angle ? next : image) : [...current, next];
  });
  const submit = () => {
    if (!modelId || !coverId || !ballSet || !prefix.trim()) return;
    catalog.saveAssemblyVariant({ modelId, coverId, reducerId: reducerId || null, ballSetId: ballSet.id, prefix, isActive: active, publicationStatus: status, images }, variant?.id);
    onClose();
  };

  return <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center"><div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white border border-border p-6"><div className="flex justify-between mb-5"><div><h2 className="font-semibold text-lg">{variant ? `Editar ${variant.id}` : "Nova variante visual"}</h2><p className="text-sm text-muted-foreground">Uma variante publicada precisa de FRT, DIR, ESQ e SUP.</p></div><button onClick={onClose}><X size={20} /></button></div><div className="grid sm:grid-cols-2 gap-4"><label className="text-sm font-medium">Modelo<select value={modelId} onChange={(event) => { setModelId(event.target.value); setCoverId(""); setReducerId(""); }} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2">{catalog.chairModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label><label className="text-sm font-medium">Pano<select value={coverId} onChange={(event) => setCoverId(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2"><option value="">Selecione</option>{covers.map((cover) => <option key={cover.id} value={cover.id}>{cover.name}</option>)}</select></label><label className="text-sm font-medium">Redutor<select value={reducerId} onChange={(event) => setReducerId(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2"><option value="">Sem redutor</option>{reducers.map((reducer) => <option key={reducer.id} value={reducer.id}>{reducer.name}</option>)}</select></label><label className="text-sm font-medium">Prefixo técnico<input value={prefix} onChange={(event) => setPrefix(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label><label className="text-sm font-medium">Publicação<select value={status} onChange={(event) => setStatus(event.target.value as AssemblyVariantInput["publicationStatus"])} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2"><option value="draft">Rascunho</option><option value="published">Publicada</option></select></label><label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="accent-primary" />Variante ativa</label></div><div className="mt-5 flex justify-between items-center"><p className="font-medium text-sm">Imagens por angulação</p><Btn variant="outline" size="sm" onClick={ensureImages}><Image size={14} />Gerar placeholders</Btn></div><div className="mt-3 grid sm:grid-cols-2 gap-3">{ANGLES.map((angle) => { const image = images.find((item) => item.angle === angle); return <label key={angle} className="rounded-xl border border-border p-3 text-xs text-muted-foreground">{angle} · {getAngleLabel(angle)}<input value={image?.assetKey ?? ""} onChange={(event) => updateImage(angle, event.target.value)} placeholder={`${prefix || "prefixo"}_${angle}`} className="mt-1 w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground" />{image && <img src={resolveAssemblyImageUrl(image)} alt={image.alt} className="mt-2 w-full h-28 object-cover rounded-lg border border-border" />}</label>; })}</div><p className={cn("mt-3 text-sm", images.length > 0 && isAssemblyVariantComplete({ ...(variant ?? { id: "preview", modelId, coverId, reducerId: reducerId || null, ballSetId: ballSet?.id ?? "", prefix, isActive: active, publicationStatus: status }), images }) ? "text-green-700" : "text-amber-700")}>{images.length > 0 && ANGLES.every((angle) => images.some((image) => image.angle === angle)) ? "Conjunto completo com quatro angulações." : "Conjunto incompleto: a publicação será mantida como rascunho."}</p><div className="flex justify-end gap-3 mt-6"><Btn variant="outline" onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={submit} disabled={!modelId || !coverId || !ballSet || !prefix.trim()}><Save size={14} />Salvar variante</Btn></div></div></div>;
}

function VariantsTable() {
  const catalog = useCatalog();
  const [modelFilter, setModelFilter] = useState("all");
  const [editing, setEditing] = useState<AssemblyVariant | undefined>();
  const [editorOpen, setEditorOpen] = useState(false);
  const variants = catalog.assemblyVariants.filter((variant) => modelFilter === "all" || variant.modelId === modelFilter);

  return <div><div className="flex justify-between gap-3 flex-wrap mb-4"><div className="flex items-center gap-3"><select value={modelFilter} onChange={(event) => setModelFilter(event.target.value)} className="rounded-xl border border-border bg-input-background px-3 py-2 text-sm"><option value="all">Todos os modelos</option>{catalog.chairModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select><span className="text-sm text-muted-foreground">{variants.length} variantes · {variants.reduce((total, variant) => total + variant.images.length, 0)} imagens cadastradas</span></div><Btn variant="primary" size="sm" onClick={() => { setEditing(undefined); setEditorOpen(true); }}><Plus size={14} />Nova variante</Btn></div><div className="bg-white rounded-xl border border-border overflow-x-auto"><table className="w-full"><thead className="bg-secondary border-b border-border"><tr>{["ID", "Composição", "Prefixo", "Ângulos", "Publicação", ""].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">{heading}</th>)}</tr></thead><tbody className="divide-y divide-border">{variants.map((variant) => { const model = catalog.chairModels.find((item) => item.id === variant.modelId); const cover = catalog.covers.find((item) => item.id === variant.coverId); const reducer = catalog.reducers.find((item) => item.id === variant.reducerId); const complete = isAssemblyVariantComplete(variant); return <tr key={variant.id}><td className="px-4 py-3 font-mono text-sm">{variant.id}</td><td className="px-4 py-3 text-sm"><p className="font-medium">{model?.version} · {cover?.name}</p><p className="text-xs text-muted-foreground">{reducer?.name ?? "Sem redutor"}</p></td><td className="px-4 py-3 font-mono text-xs text-muted-foreground">{variant.prefix}</td><td className="px-4 py-3"><div className="flex gap-1">{ANGLES.map((angle) => <span key={angle} className={cn("text-[10px] border rounded px-1.5 py-0.5", variant.images.some((image) => image.angle === angle) ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200")}>{angle}</span>)}</div></td><td className="px-4 py-3"><span className={cn("text-xs border rounded-full px-2 py-1", variant.publicationStatus === "published" && complete && variant.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200")}>{variant.publicationStatus === "published" && complete && variant.isActive ? "Publicada" : "Rascunho/inativa"}</span></td><td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => { setEditing(variant); setEditorOpen(true); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Edit size={14} /></button><button onClick={() => { if (window.confirm(`Excluir ${variant.id}?`)) catalog.deleteAssemblyVariant(variant.id); }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={14} /></button></div></td></tr>; })}</tbody></table></div>{editorOpen && <VariantEditor variant={editing} onClose={() => setEditorOpen(false)} />}</div>;
}

export function AdminConfigurator() {
  const catalog = useCatalog();
  const [tab, setTab] = useState<"models" | "covers" | "reducers" | "balls" | "variants">("models");
  const publishedVariants = useMemo(() => catalog.assemblyVariants.filter((variant) => variant.isActive && variant.publicationStatus === "published" && isAssemblyVariantComplete(variant)), [catalog.assemblyVariants]);
  const tabs = [
    ["models", "Modelos"], ["covers", "Panos"], ["reducers", "Redutores"], ["balls", "Bolinhas"], ["variants", "Variantes visuais"],
  ] as const;

  return (
    <div>
      <div className="flex justify-between gap-4 flex-wrap mb-6"><div><h1 className="text-xl font-semibold text-foreground">Montagem 4moms</h1><p className="text-sm text-muted-foreground mt-1">Modelos, componentes, compatibilidades e imagens que alimentam o configurador público.</p></div><div className="grid grid-cols-2 gap-2 text-center"><div className="rounded-xl border border-border bg-white px-4 py-2"><p className="text-xl font-bold text-foreground">{catalog.assemblyVariants.length}</p><p className="text-xs text-muted-foreground">variantes</p></div><div className="rounded-xl border border-border bg-white px-4 py-2"><p className="text-xl font-bold text-foreground">{publishedVariants.reduce((total, variant) => total + variant.images.length, 0)}</p><p className="text-xs text-muted-foreground">imagens publicadas</p></div></div></div>
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">{tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={cn("px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px", tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>{label}</button>)}</div>
      {tab === "models" && <div className="grid lg:grid-cols-2 gap-4">{catalog.chairModels.map((model) => <ModelCard key={model.id} model={model} />)}</div>}
      {tab === "covers" && <ComponentTable type="cover" />}
      {tab === "reducers" && <ComponentTable type="reducer" />}
      {tab === "balls" && <div className="grid lg:grid-cols-2 gap-4">{catalog.ballSets.map((ballSet) => <BallSetCard key={ballSet.id} ballSet={ballSet} />)}</div>}
      {tab === "variants" && <VariantsTable />}
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><Layers size={16} className="inline mr-2" />As imagens atuais são placeholders técnicos. Substitua cada assetKey por uma URL autorizada ou upload quando o armazenamento do backend entrar. Uma variante incompleta não é publicada no site.</div>
    </div>
  );
}
