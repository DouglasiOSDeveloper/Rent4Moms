import React, { useEffect, useMemo, useState } from "react";
import { CircleCheck, Edit, ImageOff, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { Btn, cn } from "../../../components/prototype/PrototypeUI";
import { EmptyState, ErrorState, LoadingState } from "../../../components/states/DataState";
import { isAssemblyVariantComplete } from "../../../domain/catalog/configurator";
import type {
  AssemblyVariant,
  AssemblyVariantInput,
  BallSet,
  BallSetInput,
  CatalogComponentType,
  CatalogDeleteResolution,
  CatalogImpact,
  ChairModel,
  ChairModelInput,
  ConfigurableComponentInput,
  Cover,
  Reducer,
} from "../../../domain/catalog/types";
import type { MediaAngle, MediaOwnerType } from "../../../domain/media/types";
import { formatMoneyFromCents } from "../../../lib/money";
import { mediaApi } from "../../../services/media/mediaApi";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";
import { AngleManager } from "../media/AngleManager";
import { MediaManager } from "../media/MediaManager";

function numberValue(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function impactText(impact?: CatalogImpact): string {
  return impact?.dependencies.map((item) => `• ${item.label}: ${item.relation}`).join("\n") ?? "";
}

async function resolveDelete(
  label: string,
  remove: (resolution?: CatalogDeleteResolution) => Promise<{ ok: boolean; reason?: string; impact?: CatalogImpact }>,
): Promise<void> {
  if (!window.confirm(`Arquivar ${label}?`)) return;
  const result = await remove();
  if (result.ok) return;
  const details = impactText(result.impact) || result.reason || "Há vínculos ativos.";
  if (result.impact?.dependencies.some((item) => item.resolution === "retire")) {
    window.alert(`${label} possui unidades no estoque físico:\n${details}\n\nBaixe as unidades no módulo Estoque físico antes de arquivar.`);
    return;
  }
  if (window.confirm(`${label} possui vínculos:\n${details}\n\nDeseja desativar/desvincular os dependentes e arquivar?`)) {
    await remove("deactivate_dependents");
  }
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={cn("text-sm font-medium text-foreground", className)}>{label}{children}</label>;
}

function EntityMedia({ ownerType, ownerId, onChanged }: { ownerType: MediaOwnerType; ownerId: string; onChanged: () => Promise<void> }) {
  return <div className="mt-5"><MediaManager ownerType={ownerType} ownerId={ownerId} onChanged={onChanged} /></div>;
}

function ModelEditor({ model, onClose }: { model?: ChairModel; onClose: () => void }) {
  const catalog = useCatalog();
  const [form, setForm] = useState<ChairModelInput>({
    productId: model?.productId ?? null,
    version: model?.version ?? "",
    technicalCode: model?.technicalCode ?? "",
    name: model?.name ?? "",
    description: model?.description ?? "",
    ballSetId: model?.ballSetId ?? "",
    isActive: model?.isActive ?? true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = <K extends keyof ChairModelInput>(key: K, value: ChairModelInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    if (!form.name.trim() || !form.version.trim() || !form.technicalCode.trim()) { setError("Informe nome, versão e código técnico."); return; }
    setSaving(true); setError("");
    try { await catalog.saveChairModel(form, model?.id); onClose(); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o modelo."); }
    finally { setSaving(false); }
  };
  return <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center"><div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-white p-6">
    <div className="flex justify-between gap-3 mb-5"><div><h2 className="text-lg font-semibold">{model ? "Editar modelo" : "Novo modelo"}</h2><p className="text-sm text-muted-foreground">As fotos são enviadas depois que o cadastro existe.</p></div><button onClick={onClose} aria-label="Fechar"><X size={20} /></button></div>
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Nome *"><input value={form.name} onChange={(event) => update("name", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></Field>
      <Field label="Versão *"><input value={form.version} onChange={(event) => update("version", event.target.value)} placeholder="4.0" className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></Field>
      <Field label="Código técnico *"><input value={form.technicalCode} onChange={(event) => update("technicalCode", event.target.value)} placeholder="m40" className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></Field>
      <Field label="Produto comercial"><select value={form.productId ?? ""} onChange={(event) => update("productId", event.target.value || null)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2"><option value="">Sem produto vinculado</option>{catalog.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></Field>
      <Field label="Descrição" className="sm:col-span-2"><textarea rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></Field>
      <div className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm"><p className="font-medium">Estoque disponível</p><p className="text-muted-foreground">{model?.availableQuantity ?? 0} unidade(s) · gerenciado em Estoque físico</p></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => update("isActive", event.target.checked)} className="accent-primary" />Modelo ativo</label>
    </div>
    {model ? <EntityMedia ownerType="chair_model" ownerId={model.id} onChanged={catalog.refreshCatalog} /> : <p className="mt-4 text-sm text-muted-foreground">Salve o modelo e abra-o novamente para adicionar fotos.</p>}
    {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    <div className="flex justify-end gap-3 mt-6"><Btn variant="outline" onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={() => void submit()} disabled={saving}><Save size={14} />{saving ? "Salvando..." : "Salvar modelo"}</Btn></div>
  </div></div>;
}

function ModelsPanel() {
  const catalog = useCatalog();
  const [editing, setEditing] = useState<ChairModel | undefined>();
  const [open, setOpen] = useState(false);
  const remove = async (model: ChairModel) => { try { await resolveDelete(`o modelo “${model.name}”`, (resolution) => catalog.deleteChairModel(model.id, resolution)); } catch (error) { window.alert(error instanceof Error ? error.message : "Não foi possível excluir o modelo."); } };
  return <div><div className="flex justify-between items-center gap-3 mb-4"><p className="text-sm text-muted-foreground">Modelos vinculam produtos, estoque, bolinhas, variantes e fotos.</p><Btn variant="primary" size="sm" onClick={() => { setEditing(undefined); setOpen(true); }}><Plus size={14} />Novo modelo</Btn></div>
    {catalog.chairModels.length === 0 ? <EmptyState title="Nenhum modelo cadastrado" description="Crie o primeiro modelo real." /> : <div className="grid lg:grid-cols-2 gap-4">{catalog.chairModels.map((model) => <div key={model.id} className="rounded-2xl border border-border bg-white p-5"><div className="flex gap-4"><div className="h-20 w-20 shrink-0 rounded-xl border border-border bg-secondary overflow-hidden">{model.defaultImage ? <img src={model.defaultImage} alt={model.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageOff size={20} className="text-muted-foreground" /></div>}</div><div className="flex-1"><div className="flex justify-between gap-3"><div><p className="font-semibold">{model.name}</p><p className="text-xs text-muted-foreground">{model.technicalCode} · versão {model.version}</p></div><span className={cn("h-fit text-xs border rounded-full px-2 py-1", model.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200")}>{model.isActive ? "Ativo" : "Inativo"}</span></div><p className="text-sm text-muted-foreground mt-2">{model.description || "Sem descrição."}</p></div></div><p className="mt-3 text-xs text-muted-foreground">Estoque disponível: <strong className="text-foreground">{model.availableQuantity}</strong></p><div className="flex justify-end gap-1 mt-3"><button onClick={() => { setEditing(model); setOpen(true); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Edit size={14} /></button><button onClick={() => void remove(model)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={14} /></button></div></div>)}</div>}
    {open && <ModelEditor model={editing} onClose={() => setOpen(false)} />}
  </div>;
}

interface ComponentEditorProps { type: CatalogComponentType; component?: Cover | Reducer; onClose: () => void }
function ComponentEditor({ type, component, onClose }: ComponentEditorProps) {
  const catalog = useCatalog();
  const current = catalog.compatibilities.filter((item) => item.componentType === type && item.componentId === component?.id);
  const [form, setForm] = useState<ConfigurableComponentInput>({
    name: component?.name ?? "", code: component?.code ?? "", description: component?.description ?? "",
    priceAdjustment: component?.priceAdjustment ?? { daily: 0, weekly: 0, monthly: 0 }, isActive: component?.isActive ?? true,
    compatibleModelIds: current.map((item) => item.modelId), preferredModelIds: current.filter((item) => item.isPreferred).map((item) => item.modelId),
  });
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  const toggleModel = (modelId: string) => setForm((value) => value.compatibleModelIds.includes(modelId)
    ? { ...value, compatibleModelIds: value.compatibleModelIds.filter((id) => id !== modelId), preferredModelIds: value.preferredModelIds.filter((id) => id !== modelId) }
    : { ...value, compatibleModelIds: [...value.compatibleModelIds, modelId] });
  const submit = async () => {
    if (!form.name.trim() || !form.code.trim()) { setError("Informe nome e código."); return; }
    setSaving(true); setError("");
    try { if (type === "cover") await catalog.saveCover(form, component?.id); else await catalog.saveReducer(form, component?.id); onClose(); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o componente."); }
    finally { setSaving(false); }
  };
  const ownerType: MediaOwnerType = type;
  return <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center"><div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-white p-6">
    <div className="flex justify-between mb-5"><div><h2 className="text-lg font-semibold">{component ? "Editar" : "Novo"} {type === "cover" ? "pano" : "redutor"}</h2><p className="text-sm text-muted-foreground">Compatibilidades podem ficar vazias.</p></div><button onClick={onClose}><X size={20} /></button></div>
    <div className="grid sm:grid-cols-2 gap-4"><Field label="Nome *"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-xl border border-border px-3 py-2" /></Field><Field label="Código *"><input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="mt-1 w-full rounded-xl border border-border px-3 py-2" /></Field><Field label="Descrição" className="sm:col-span-2"><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded-xl border border-border px-3 py-2" /></Field>{(["daily", "weekly", "monthly"] as const).map((key) => <Field key={key} label={key === "daily" ? "Acréscimo diário" : key === "weekly" ? "Acréscimo semanal" : "Acréscimo 30 dias"}><input inputMode="decimal" value={String(form.priceAdjustment[key])} onChange={(event) => setForm({ ...form, priceAdjustment: { ...form.priceAdjustment, [key]: numberValue(event.target.value) } })} className="mt-1 w-full rounded-xl border border-border px-3 py-2" /></Field>)}<label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Ativo</label></div>
    <div className="mt-5"><p className="text-sm font-medium mb-2">Compatibilidade</p><div className="grid sm:grid-cols-2 gap-2">{catalog.chairModels.map((model) => <div key={model.id} className="rounded-xl border border-border p-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.compatibleModelIds.includes(model.id)} onChange={() => toggleModel(model.id)} />{model.name}</label><label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" disabled={!form.compatibleModelIds.includes(model.id)} checked={form.preferredModelIds.includes(model.id)} onChange={(event) => setForm({ ...form, preferredModelIds: event.target.checked ? [...form.preferredModelIds, model.id] : form.preferredModelIds.filter((id) => id !== model.id) })} />Preferencial neste modelo</label></div>)}</div></div>
    {component ? <EntityMedia ownerType={ownerType} ownerId={component.id} onChanged={catalog.refreshCatalog} /> : <p className="mt-4 text-sm text-muted-foreground">Salve e edite novamente para adicionar fotos.</p>}
    {error && <p className="mt-4 text-sm text-red-600">{error}</p>}<div className="flex justify-end gap-3 mt-6"><Btn variant="outline" onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={() => void submit()} disabled={saving}><Save size={14} />Salvar</Btn></div>
  </div></div>;
}

function ComponentTable({ type }: { type: CatalogComponentType }) {
  const catalog = useCatalog(); const components = type === "cover" ? catalog.covers : catalog.reducers;
  const [editing, setEditing] = useState<Cover | Reducer | undefined>(); const [open, setOpen] = useState(false);
  const remove = async (component: Cover | Reducer) => { try { await resolveDelete(`${type === "cover" ? "o pano" : "o redutor"} “${component.name}”`, (resolution) => type === "cover" ? catalog.deleteCover(component.id, resolution) : catalog.deleteReducer(component.id, resolution)); } catch (error) { window.alert(error instanceof Error ? error.message : "Não foi possível excluir o componente."); } };
  return <div><div className="flex justify-between gap-3 items-center mb-4"><p className="text-sm text-muted-foreground">Fotos, preço, compatibilidade e estoque são fontes independentes.</p><Btn variant="primary" size="sm" onClick={() => { setEditing(undefined); setOpen(true); }}><Plus size={14} />Novo {type === "cover" ? "pano" : "redutor"}</Btn></div>
    {components.length === 0 ? <EmptyState title={`Nenhum ${type === "cover" ? "pano" : "redutor"} cadastrado`} /> : <div className="bg-white border border-border rounded-xl overflow-x-auto"><table className="w-full"><thead className="bg-secondary border-b border-border"><tr>{["Componente", "Compatível com", "Acréscimo/30 dias", "Estoque", "Status", ""].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">{heading}</th>)}</tr></thead><tbody className="divide-y divide-border">{components.map((component) => { const modelNames = catalog.compatibilities.filter((item) => item.componentType === type && item.componentId === component.id).map((item) => catalog.chairModels.find((model) => model.id === item.modelId)?.version).filter(Boolean); return <tr key={component.id}><td className="px-4 py-3"><div className="flex items-center gap-3">{component.photo ? <img src={component.photo} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg border border-dashed flex items-center justify-center"><ImageOff size={14} /></div>}<div><p className="font-medium text-sm">{component.name}</p><p className="text-xs text-muted-foreground">{component.code}</p></div></div></td><td className="px-4 py-3 text-sm text-muted-foreground">{modelNames.join(", ") || "Sem compatibilidade"}</td><td className="px-4 py-3 text-sm">{formatMoneyFromCents(Math.round(component.priceAdjustment.monthly * 100))}</td><td className="px-4 py-3 text-sm">{component.availableQuantity}</td><td className="px-4 py-3">{component.isActive ? "Ativo" : "Inativo"}</td><td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => { setEditing(component); setOpen(true); }} className="p-2 text-primary"><Edit size={14} /></button><button onClick={() => void remove(component)} className="p-2 text-destructive"><Trash2 size={14} /></button></div></td></tr>; })}</tbody></table></div>}
    {open && <ComponentEditor type={type} component={editing} onClose={() => setOpen(false)} />}
  </div>;
}

function BallSetEditor({ ballSet, onClose }: { ballSet?: BallSet; onClose: () => void }) {
  const catalog = useCatalog();
  const [form, setForm] = useState<BallSetInput>({ code: ballSet?.code ?? "", name: ballSet?.name ?? "", modelId: ballSet?.modelId ?? catalog.chairModels[0]?.id ?? "", description: ballSet?.description ?? "", isActive: ballSet?.isActive ?? true });
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  const submit = async () => { if (!form.code.trim() || !form.name.trim() || !form.modelId) { setError("Informe código, nome e modelo."); return; } setSaving(true); setError(""); try { const saved = await catalog.saveBallSet(form, ballSet?.id); const model = catalog.chairModels.find((item) => item.id === form.modelId); if (model && model.ballSetId !== saved.id) await catalog.updateChairModel(model.id, { ballSetId: saved.id }); onClose(); } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar as bolinhas."); } finally { setSaving(false); } };
  return <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center"><div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white border border-border p-6"><div className="flex justify-between mb-5"><h2 className="text-lg font-semibold">{ballSet ? "Editar" : "Novo conjunto de"} bolinhas</h2><button onClick={onClose}><X size={20} /></button></div><div className="grid sm:grid-cols-2 gap-4"><Field label="Nome *"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" /></Field><Field label="Código *"><input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" /></Field><Field label="Modelo *"><select value={form.modelId} onChange={(event) => setForm({ ...form, modelId: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2"><option value="">Selecione</option>{catalog.chairModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select></Field><label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Ativo</label><Field label="Descrição" className="sm:col-span-2"><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" /></Field></div>{ballSet ? <EntityMedia ownerType="ball_set" ownerId={ballSet.id} onChanged={catalog.refreshCatalog} /> : <p className="mt-4 text-sm text-muted-foreground">Salve e edite novamente para adicionar fotos.</p>}{error && <p className="mt-4 text-sm text-red-600">{error}</p>}<div className="flex justify-end gap-3 mt-6"><Btn variant="outline" onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={() => void submit()} disabled={saving}>Salvar</Btn></div></div></div>;
}

function BallSetsPanel() {
  const catalog = useCatalog(); const [editing, setEditing] = useState<BallSet | undefined>(); const [open, setOpen] = useState(false);
  const remove = async (item: BallSet) => { try { await resolveDelete(`o conjunto “${item.name}”`, (resolution) => catalog.deleteBallSet(item.id, resolution)); } catch (error) { window.alert(error instanceof Error ? error.message : "Não foi possível excluir as bolinhas."); } };
  return <div><div className="flex justify-between items-center gap-3 mb-4"><p className="text-sm text-muted-foreground">Cada conjunto é exclusivo de um modelo e aceita fotos próprias.</p><Btn variant="primary" size="sm" onClick={() => { setEditing(undefined); setOpen(true); }} disabled={!catalog.chairModels.length}><Plus size={14} />Novas bolinhas</Btn></div>{catalog.ballSets.length === 0 ? <EmptyState title="Nenhum conjunto de bolinhas cadastrado" /> : <div className="grid lg:grid-cols-2 gap-4">{catalog.ballSets.map((item) => <div key={item.id} className="rounded-2xl border bg-white p-5"><div className="flex gap-4">{item.photo ? <img src={item.photo} alt="" className="w-20 h-20 rounded-xl object-cover" /> : <div className="w-20 h-20 rounded-xl border border-dashed flex items-center justify-center"><ImageOff size={18} /></div>}<div className="flex-1"><p className="font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">{item.code} · {catalog.chairModels.find((model) => model.id === item.modelId)?.name ?? "modelo removido"}</p><p className="text-sm text-muted-foreground mt-2">{item.description || "Sem descrição."}</p></div></div><p className="mt-3 text-xs">Estoque: {item.availableQuantity}</p><div className="flex justify-end gap-1"><button onClick={() => { setEditing(item); setOpen(true); }} className="p-2 text-primary"><Edit size={14} /></button><button onClick={() => void remove(item)} className="p-2 text-destructive"><Trash2 size={14} /></button></div></div>)}</div>}{open && <BallSetEditor ballSet={editing} onClose={() => setOpen(false)} />}</div>;
}

function VariantEditor({ variant, angles, onClose }: { variant?: AssemblyVariant; angles: MediaAngle[]; onClose: () => void }) {
  const catalog = useCatalog();
  const currentVariant = variant ? catalog.assemblyVariants.find((item) => item.id === variant.id) ?? variant : undefined;
  const [modelId, setModelId] = useState(variant?.modelId ?? catalog.chairModels.find((model) => model.isActive)?.id ?? "");
  const [coverId, setCoverId] = useState(variant?.coverId ?? "");
  const [reducerId, setReducerId] = useState(variant?.reducerId ?? "");
  const [prefix, setPrefix] = useState(variant?.prefix ?? "");
  const [active, setActive] = useState(variant?.isActive ?? true);
  const [status, setStatus] = useState<AssemblyVariantInput["publicationStatus"]>(variant?.publicationStatus ?? "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const covers = catalog.covers.filter((item) => item.isActive && catalog.compatibilities.some((compatibility) => compatibility.modelId === modelId && compatibility.componentType === "cover" && compatibility.componentId === item.id && compatibility.isActive));
  const reducers = catalog.reducers.filter((item) => item.isActive && catalog.compatibilities.some((compatibility) => compatibility.modelId === modelId && compatibility.componentType === "reducer" && compatibility.componentId === item.id && compatibility.isActive));
  const ballSet = catalog.ballSets.find((item) => item.modelId === modelId && item.isActive);
  const complete = Boolean(currentVariant && isAssemblyVariantComplete(currentVariant));

  const save = async (publicationStatus = status, isActive = active) => {
    if (!modelId || !coverId || !ballSet || !prefix.trim()) {
      setError("Selecione modelo, pano, bolinhas e informe o prefixo.");
      return;
    }
    if (publicationStatus === "published" && !complete) {
      setError("Adicione ao menos uma imagem pública com angulação antes de publicar.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await catalog.saveAssemblyVariant({
        modelId,
        coverId,
        reducerId: reducerId || null,
        ballSetId: ballSet.id,
        prefix: prefix.trim(),
        isActive,
        publicationStatus,
      }, variant?.id);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a variante.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center"><div className="w-full max-w-3xl max-h-[94vh] overflow-y-auto rounded-2xl border bg-white p-6">
    <div className="flex justify-between mb-5"><div><h2 className="text-lg font-semibold">{variant ? "Editar variante" : "Nova variante"}</h2><p className="text-sm text-muted-foreground">Envie a mídia, confirme que ela está visível e publique a composição.</p></div><button onClick={onClose}><X size={20} /></button></div>
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Modelo"><select value={modelId} onChange={(event) => { setModelId(event.target.value); setCoverId(""); setReducerId(""); }} className="mt-1 w-full rounded-xl border px-3 py-2"><option value="">Selecione</option>{catalog.chairModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select></Field>
      <Field label="Pano"><select value={coverId} onChange={(event) => setCoverId(event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"><option value="">Selecione</option>{covers.map((cover) => <option key={cover.id} value={cover.id}>{cover.name}</option>)}</select></Field>
      <Field label="Redutor"><select value={reducerId} onChange={(event) => setReducerId(event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"><option value="">Sem redutor</option>{reducers.map((reducer) => <option key={reducer.id} value={reducer.id}>{reducer.name}</option>)}</select></Field>
      <Field label="Prefixo técnico"><input value={prefix} onChange={(event) => setPrefix(event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></Field>
      <Field label="Publicação"><select value={status} onChange={(event) => setStatus(event.target.value as AssemblyVariantInput["publicationStatus"])} className="mt-1 w-full rounded-xl border px-3 py-2"><option value="draft">Rascunho</option><option value="published">Publicada</option></select></Field>
      <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />Variante ativa</label>
    </div>
    {variant ? <div className="mt-5"><MediaManager ownerType="assembly_variant" ownerId={variant.id} angles={angles} onChanged={catalog.refreshCatalog} /></div> : <p className="mt-4 text-sm text-muted-foreground">Crie a variante como rascunho, abra-a novamente e envie a foto exigida.</p>}
    {variant && <div className={cn("mt-3 rounded-xl border p-3 text-sm", complete ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800")}>{complete ? `${currentVariant?.images.filter((image) => image.isVisible).length ?? 0} angulação(ões) pública(s). A variante já pode ser publicada.` : "Sem imagem pública. A variante ainda não aparece no site institucional."}</div>}
    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    <div className="flex justify-end gap-3 mt-6 flex-wrap">
      <Btn variant="outline" onClick={onClose}>Cancelar</Btn>
      {variant && complete && (currentVariant?.publicationStatus !== "published" || !currentVariant.isActive) && <Btn variant="outline" onClick={() => void save("published", true)} disabled={saving}><CircleCheck size={14} />Publicar agora</Btn>}
      <Btn variant="primary" onClick={() => void save()} disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Salvar variante</Btn>
    </div>
  </div></div>;
}

function VariantsTable({ angles }: { angles: MediaAngle[] }) {
  const catalog = useCatalog();
  const [modelFilter, setModelFilter] = useState("all");
  const [editing, setEditing] = useState<AssemblyVariant | undefined>();
  const [open, setOpen] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const variants = catalog.assemblyVariants.filter((variant) => modelFilter === "all" || variant.modelId === modelFilter);
  const readyToPublish = variants.filter((variant) => isAssemblyVariantComplete(variant) && (variant.publicationStatus !== "published" || !variant.isActive));

  const remove = async (variant: AssemblyVariant) => {
    try {
      await resolveDelete(`a variante “${variant.prefix || variant.id}”`, (resolution) => catalog.deleteAssemblyVariant(variant.id, resolution));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Não foi possível excluir a variante.");
    }
  };

  const publish = async (variant: AssemblyVariant) => {
    if (!isAssemblyVariantComplete(variant)) {
      window.alert("Esta variante ainda não possui imagem pública com angulação.");
      return;
    }
    setPublishingId(variant.id);
    try {
      await catalog.saveAssemblyVariant({
        modelId: variant.modelId,
        coverId: variant.coverId,
        reducerId: variant.reducerId,
        ballSetId: variant.ballSetId,
        prefix: variant.prefix,
        isActive: true,
        publicationStatus: "published",
      }, variant.id);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Não foi possível publicar a variante.");
    } finally {
      setPublishingId(null);
    }
  };

  const publishAllReady = async () => {
    if (!readyToPublish.length || !window.confirm(`Publicar ${readyToPublish.length} variante(s) que já possuem imagem pública?`)) return;
    setPublishingId("all");
    try {
      for (const variant of readyToPublish) {
        await catalog.saveAssemblyVariant({
          modelId: variant.modelId,
          coverId: variant.coverId,
          reducerId: variant.reducerId,
          ballSetId: variant.ballSetId,
          prefix: variant.prefix,
          isActive: true,
          publicationStatus: "published",
        }, variant.id);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "A publicação em lote não foi concluída.");
    } finally {
      setPublishingId(null);
    }
  };

  return <div>
    <div className="flex justify-between gap-3 flex-wrap mb-4">
      <div className="flex items-center gap-3 flex-wrap"><select value={modelFilter} onChange={(event) => setModelFilter(event.target.value)} className="rounded-xl border px-3 py-2 text-sm"><option value="all">Todos os modelos</option>{catalog.chairModels.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select><span className="text-sm text-muted-foreground">{variants.length} variantes</span></div>
      <div className="flex gap-2 flex-wrap">{readyToPublish.length > 0 && <Btn variant="outline" size="sm" onClick={() => void publishAllReady()} disabled={publishingId !== null}>{publishingId === "all" ? <Loader2 size={14} className="animate-spin" /> : <CircleCheck size={14} />}Publicar prontas ({readyToPublish.length})</Btn>}<Btn variant="primary" size="sm" onClick={() => { setEditing(undefined); setOpen(true); }} disabled={!catalog.chairModels.length || !catalog.covers.length || !angles.some((angle) => angle.isActive)}><Plus size={14} />Nova variante</Btn></div>
    </div>
    {angles.length === 0 && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Cadastre ao menos uma angulação antes de criar variantes visuais.</div>}
    {variants.length === 0 ? <EmptyState title="Nenhuma variante visual cadastrada" /> : <div className="bg-white rounded-xl border overflow-x-auto"><table className="w-full"><thead className="bg-secondary"><tr>{["ID", "Composição", "Prefixo", "Imagens", "Publicação", ""].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">{heading}</th>)}</tr></thead><tbody className="divide-y">{variants.map((variant) => {
      const model = catalog.chairModels.find((item) => item.id === variant.modelId);
      const cover = catalog.covers.find((item) => item.id === variant.coverId);
      const reducer = catalog.reducers.find((item) => item.id === variant.reducerId);
      const complete = isAssemblyVariantComplete(variant);
      const published = variant.publicationStatus === "published" && complete && variant.isActive;
      const statusLabel = published ? "Publicada" : !complete ? "Sem imagem pública" : !variant.isActive ? "Inativa" : "Rascunho";
      return <tr key={variant.id}><td className="px-4 py-3 font-mono text-sm">{variant.id}</td><td className="px-4 py-3 text-sm"><p className="font-medium">{model?.version} · {cover?.name}</p><p className="text-xs text-muted-foreground">{reducer?.name ?? "Sem redutor"}</p></td><td className="px-4 py-3 font-mono text-xs">{variant.prefix}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-1">{variant.images.length ? variant.images.map((image) => <span key={image.id} className={cn("text-[10px] border rounded px-1.5 py-0.5", image.isVisible ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200")}>{image.angle}</span>) : <span className="text-xs text-muted-foreground">Nenhuma</span>}</div></td><td className="px-4 py-3"><span className={cn("text-xs border rounded-full px-2 py-1", published ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200")}>{statusLabel}</span></td><td className="px-4 py-3"><div className="flex gap-1 items-center">{complete && !published && <button onClick={() => void publish(variant)} disabled={publishingId !== null} className="px-2 py-1 text-xs rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100">{publishingId === variant.id ? "Publicando..." : "Publicar"}</button>}<button onClick={() => { setEditing(variant); setOpen(true); }} className="p-2 text-primary"><Edit size={14} /></button><button onClick={() => void remove(variant)} className="p-2 text-destructive"><Trash2 size={14} /></button></div></td></tr>;
    })}</tbody></table></div>}
    {open && <VariantEditor variant={editing} angles={angles} onClose={() => setOpen(false)} />}
  </div>;
}

export function AdminConfigurator() {
  const catalog = useCatalog();
  const [tab, setTab] = useState<"models" | "covers" | "reducers" | "balls" | "angles" | "variants">("models");
  const [angles, setAngles] = useState<MediaAngle[]>([]);
  useEffect(() => { void mediaApi.listAngles().then(setAngles).catch(() => setAngles([])); }, []);
  const publishedVariants = useMemo(() => catalog.assemblyVariants.filter((variant) => variant.isActive && variant.publicationStatus === "published" && isAssemblyVariantComplete(variant)), [catalog.assemblyVariants]);
  const tabs = [["models", "Modelos"], ["covers", "Panos"], ["reducers", "Redutores"], ["balls", "Bolinhas"], ["angles", "Angulações"], ["variants", "Variantes visuais"]] as const;
  return <div><div className="flex justify-between gap-4 flex-wrap mb-6"><div><h1 className="text-xl font-semibold">Montagem 4moms</h1><p className="text-sm text-muted-foreground mt-1">Catálogo, mídia e angulações dinâmicas sem placeholders.</p></div><div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl border bg-white px-4 py-2"><p className="text-xl font-bold">{catalog.assemblyVariants.length}</p><p className="text-xs text-muted-foreground">variantes</p></div><div className="rounded-xl border bg-white px-4 py-2"><p className="text-xl font-bold">{publishedVariants.length}</p><p className="text-xs text-muted-foreground">publicadas</p></div><div className="rounded-xl border bg-white px-4 py-2"><p className="text-xl font-bold">{angles.filter((angle) => angle.isActive).length}</p><p className="text-xs text-muted-foreground">angulações</p></div></div></div>
    <div className="flex gap-1 border-b mb-6 overflow-x-auto">{tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={cn("px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px", tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>{label}</button>)}</div>
    {catalog.syncStatus === "loading" && <LoadingState title="Carregando montagem" />}{catalog.syncStatus === "error" && <ErrorState title="Não foi possível carregar a montagem" description="Nenhum dado fictício foi exibido." onRetry={() => void catalog.refreshCatalog()} />}
    {catalog.syncStatus !== "loading" && catalog.syncStatus !== "error" && tab === "models" && <ModelsPanel />}
    {catalog.syncStatus !== "loading" && catalog.syncStatus !== "error" && tab === "covers" && <ComponentTable type="cover" />}
    {catalog.syncStatus !== "loading" && catalog.syncStatus !== "error" && tab === "reducers" && <ComponentTable type="reducer" />}
    {catalog.syncStatus !== "loading" && catalog.syncStatus !== "error" && tab === "balls" && <BallSetsPanel />}
    {catalog.syncStatus !== "loading" && catalog.syncStatus !== "error" && tab === "angles" && <AngleManager onChanged={setAngles} />}
    {catalog.syncStatus !== "loading" && catalog.syncStatus !== "error" && tab === "variants" && <VariantsTable angles={angles} />}
  </div>;
}
