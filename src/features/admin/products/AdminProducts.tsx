import React, { useMemo, useState } from "react";
import { Edit, Package, Plus, Search, Trash2, X } from "lucide-react";
import { AvailabilityBadge, Btn } from "../../../components/prototype/PrototypeUI";
import { EmptyState, ErrorState, LoadingState } from "../../../components/states/DataState";
import type { Product, ProductInput } from "../../../domain/catalog/types";
import { DEFAULT_PRODUCT_PERIOD_PRICING } from "../../../domain/pricing/types";
import { formatMoneyFromCents } from "../../../lib/money";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";
import { MediaManager } from "../media/MediaManager";

const EMPTY_PRODUCT: ProductInput = {
  name: "",
  brand: "",
  model: "",
  categoryIds: [],
  ageMin: "",
  ageMax: "",
  weightMax: "",
  priceDaily: 0,
  priceWeekly: 0,
  priceMonthly: 0,
  periodPricing: structuredClone(DEFAULT_PRODUCT_PERIOD_PRICING),
  status: "available",
  description: "",
  featured: false,
  conservation: "",
  tags: [],
  minDays: 1,
  specs: { dimensions: "", productWeight: "", material: "", color: "", electric: "", includes: [] },
  isActive: true,
  publicationStatus: "draft",
};

function inputFromProduct(product: Product): ProductInput {
  return {
    name: product.name,
    brand: product.brand,
    model: product.model,
    categoryIds: product.categoryIds,
    ageMin: product.ageMin,
    ageMax: product.ageMax,
    weightMax: product.weightMax,
    priceDaily: product.priceDaily,
    priceWeekly: product.priceWeekly,
    priceMonthly: product.priceMonthly,
    periodPricing: product.periodPricing ?? structuredClone(DEFAULT_PRODUCT_PERIOD_PRICING),
    status: product.status,
    description: product.description,
    featured: product.featured,
    conservation: product.conservation,
    tags: product.tags,
    minDays: product.minDays,
    specs: product.specs,
    isActive: product.isActive,
    publicationStatus: product.publicationStatus,
  };
}

function numberValue(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function ProductEditor({ product, onClose }: { product?: Product; onClose: () => void }) {
  const catalog = useCatalog();
  const [form, setForm] = useState<ProductInput>(product ? inputFromProduct(product) : EMPTY_PRODUCT);
  const [tags, setTags] = useState(form.tags.join(", "));
  const [includes, setIncludes] = useState(form.specs.includes.join(", "));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const updateSpec = <K extends keyof ProductInput["specs"]>(key: K, value: ProductInput["specs"][K]) => setForm((current) => ({ ...current, specs: { ...current.specs, [key]: value } }));
  const updatePeriodRule = (
    key: "days60" | "days90",
    patch: Partial<ProductInput["periodPricing"]["days60"]>,
  ) => setForm((current) => ({
    ...current,
    periodPricing: {
      ...current.periodPricing,
      [key]: { ...current.periodPricing[key], ...patch },
    },
  }));

  const submit = async () => {
    if (!form.name.trim()) {
      setError("Informe o nome do produto.");
      return;
    }
    setSaving(true);
    setError("");
    const payload: ProductInput = {
      ...form,
      name: form.name.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      description: form.description.trim(),
      conservation: form.conservation.trim(),
      tags: tags.split(",").map((item) => item.trim()).filter(Boolean),
      specs: { ...form.specs, includes: includes.split(",").map((item) => item.trim()).filter(Boolean) },
    };
    try {
      if (product) await catalog.updateProduct(product.id, payload);
      else await catalog.createProduct(payload);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-white p-6">
        <div className="flex justify-between gap-4 mb-6"><div><h2 className="text-lg font-semibold">{product ? "Editar produto" : "Novo produto"}</h2><p className="text-sm text-muted-foreground">Cadastre somente informações comerciais reais. Publicação e ativação são controles independentes.</p></div><button onClick={onClose} aria-label="Fechar"><X size={20} /></button></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="text-sm font-medium lg:col-span-2">Nome *<input value={form.name} onChange={(event) => update("name", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Marca<input value={form.brand} onChange={(event) => update("brand", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Modelo<input value={form.model} onChange={(event) => update("model", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Idade mínima<input value={form.ageMin} onChange={(event) => update("ageMin", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Idade máxima<input value={form.ageMax} onChange={(event) => update("ageMax", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Peso máximo<input value={form.weightMax} onChange={(event) => update("weightMax", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Preço diário<input value={String(form.priceDaily)} onChange={(event) => update("priceDaily", numberValue(event.target.value))} inputMode="decimal" className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Preço semanal<input value={String(form.priceWeekly)} onChange={(event) => update("priceWeekly", numberValue(event.target.value))} inputMode="decimal" className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Preço 30 dias<input value={String(form.priceMonthly)} onChange={(event) => update("priceMonthly", numberValue(event.target.value))} inputMode="decimal" className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <div className="lg:col-span-3 rounded-2xl border border-border bg-secondary/40 p-4">
            <div className="mb-3"><p className="font-medium text-foreground">Regras comerciais por período</p><p className="text-xs text-muted-foreground mt-1">Escolha a regra de 60 e 90 dias. A renovação sempre usa a composição normal, sem preço promocional ou gratuidade.</p></div>
            <div className="grid md:grid-cols-2 gap-4">
              {([["days60", "60 dias"], ["days90", "90 dias"]] as const).map(([key, label]) => {
                const rule = form.periodPricing[key];
                return <div key={key} className="rounded-xl border border-border bg-white p-4 space-y-3">
                  <p className="font-medium text-sm text-foreground">{label}</p>
                  <label className="text-sm font-medium">Tipo de regra<select value={rule.pricingMode} onChange={(event) => updatePeriodRule(key, { pricingMode: event.target.value as typeof rule.pricingMode, discountPercent: 0, fixedPriceCents: null })} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2"><option value="rate_composition">Preço normal pela composição</option><option value="percentage_discount">Desconto percentual</option><option value="fixed_price">Preço-base fixo</option><option value="free">Gratuito</option></select></label>
                  {rule.pricingMode === "percentage_discount" && <label className="text-sm font-medium">Desconto no produto-base (%)<input type="number" min="0" max="100" step="0.01" value={String(rule.discountPercent)} onChange={(event) => updatePeriodRule(key, { discountPercent: Math.min(100, numberValue(event.target.value)) })} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>}
                  {rule.pricingMode === "fixed_price" && <label className="text-sm font-medium">Preço-base fixo (R$)<input type="number" min="0" step="0.01" value={String((rule.fixedPriceCents ?? 0) / 100)} onChange={(event) => updatePeriodRule(key, { fixedPriceCents: Math.round(numberValue(event.target.value) * 100) })} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>}
                  {rule.pricingMode === "free" && <label className="text-sm font-medium">Escopo da gratuidade<select value={rule.freeScope} onChange={(event) => updatePeriodRule(key, { freeScope: event.target.value as typeof rule.freeScope })} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2"><option value="base_product">Somente produto-base</option><option value="full_configuration">Configuração completa</option></select><span className="block mt-1 text-xs text-muted-foreground">O frete nunca é zerado por esta regra.</span></label>}
                </div>;
              })}
            </div>
          </div>
          <label className="text-sm font-medium">Mínimo de dias<input value={String(form.minDays)} onChange={(event) => update("minDays", Math.max(1, Math.trunc(numberValue(event.target.value))))} type="number" min="1" className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Disponibilidade<select value={form.status} onChange={(event) => update("status", event.target.value as ProductInput["status"])} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2"><option value="available">Disponível</option><option value="few_units">Poucas unidades</option><option value="on_demand">Sob consulta</option><option value="unavailable">Indisponível</option></select></label>
          <label className="text-sm font-medium">Publicação<select value={form.publicationStatus} onChange={(event) => update("publicationStatus", event.target.value as ProductInput["publicationStatus"])} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2"><option value="draft">Rascunho</option><option value="published">Publicado</option></select></label>
          <label className="text-sm font-medium lg:col-span-3">Descrição<textarea rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Conservação<input value={form.conservation} onChange={(event) => update("conservation", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium lg:col-span-2">Tags, separadas por vírgula<input value={tags} onChange={(event) => setTags(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Itens inclusos, separados por vírgula<input value={includes} onChange={(event) => setIncludes(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Dimensões<input value={form.specs.dimensions} onChange={(event) => updateSpec("dimensions", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Peso do produto<input value={form.specs.productWeight} onChange={(event) => updateSpec("productWeight", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Material<input value={form.specs.material} onChange={(event) => updateSpec("material", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Cor<input value={form.specs.color} onChange={(event) => updateSpec("color", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Elétrico<input value={form.specs.electric} onChange={(event) => updateSpec("electric", event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-input-background px-3 py-2" /></label>
          <div className="lg:col-span-3"><p className="text-sm font-medium mb-2">Categorias</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{catalog.categories.map((category) => <label key={category.id} className="rounded-xl border border-border p-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.categoryIds.includes(category.id)} onChange={() => update("categoryIds", form.categoryIds.includes(category.id) ? form.categoryIds.filter((id) => id !== category.id) : [...form.categoryIds, category.id])} className="accent-primary" />{category.name}</label>)}</div>{catalog.categories.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada. O produto pode ser salvo sem categoria.</p>}</div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => update("isActive", event.target.checked)} className="accent-primary" />Produto ativo</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(event) => update("featured", event.target.checked)} className="accent-primary" />Produto em destaque</label>
        </div>
        {product && <div className="mt-5"><MediaManager ownerType="product" ownerId={product.id} onChanged={catalog.refreshCatalog} /></div>}
        {!product && <p className="mt-4 text-sm text-muted-foreground">Salve o produto primeiro. Depois, edite-o para enviar as fotos.</p>}
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        <div className="flex justify-end gap-3 mt-6"><Btn variant="outline" onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={() => void submit()} disabled={saving}>{saving ? "Salvando..." : "Salvar produto"}</Btn></div>
      </div>
    </div>
  );
}

export function AdminProducts() {
  const catalog = useCatalog();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | undefined>();
  const [editorOpen, setEditorOpen] = useState(false);
  const filtered = useMemo(() => catalog.products.filter((product) => `${product.name} ${product.brand} ${product.model}`.toLowerCase().includes(search.toLowerCase())), [catalog.products, search]);

  const remove = async (product: Product) => {
    if (!window.confirm(`Arquivar o produto “${product.name}”?`)) return;
    try {
      const result = await catalog.deleteProduct(product.id);
      if (result.ok) return;
      const details = result.impact?.dependencies.map((item) => `• ${item.label}: ${item.relation}`).join("\n") ?? result.reason ?? "";
      if (window.confirm(`O produto possui vínculos:\n${details}\n\nDeseja desvincular os dependentes e arquivar o produto?`)) {
        await catalog.deleteProduct(product.id, "deactivate_dependents");
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Não foi possível excluir o produto.");
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6"><div><h1 className="text-xl font-semibold text-foreground">Produtos</h1><p className="text-sm text-muted-foreground mt-1">CRUD comercial persistido. Produtos só aparecem no site quando estão ativos e publicados.</p></div><Btn variant="primary" size="sm" onClick={() => { setEditing(undefined); setEditorOpen(true); }} disabled={catalog.syncStatus === "loading" || catalog.syncStatus === "error"}><Plus size={14} />Novo produto</Btn></div>
      {catalog.syncStatus === "loading" ? <LoadingState title="Carregando produtos" /> : catalog.syncStatus === "error" ? <ErrorState title="Não foi possível carregar os produtos" description="O catálogo não pôde ser carregado da API." onRetry={() => void catalog.refreshCatalog()} /> : catalog.products.length === 0 ? <EmptyState title="Nenhum produto cadastrado" description="Use “Novo produto” para criar o primeiro cadastro real." /> : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border relative"><Search size={15} className="absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm" /></div>
          {filtered.length === 0 ? <div className="p-6"><EmptyState compact title="Nenhum resultado" description="Ajuste a busca." /></div> : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-secondary text-left text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Produto</th><th className="px-4 py-3">Categorias</th><th className="px-4 py-3">Preço/semana</th><th className="px-4 py-3">Disponibilidade</th><th className="px-4 py-3">Publicação</th><th className="px-4 py-3">Avaliação</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-border">{filtered.map((product) => <tr key={product.id}><td className="px-4 py-3"><div className="flex items-center gap-3">{product.photo ? <img src={product.photo} alt="" className="h-10 w-10 rounded-lg object-cover border border-border" /> : <div className="h-10 w-10 rounded-lg border border-dashed border-border flex items-center justify-center"><Package size={16} className="text-muted-foreground" /></div>}<div><p className="font-medium text-foreground">{product.name}</p><p className="text-xs text-muted-foreground">{product.brand} · {product.model}</p></div></div></td><td className="px-4 py-3 text-muted-foreground">{product.categoryIds.map((id) => catalog.categories.find((category) => category.id === id)?.name).filter(Boolean).join(", ") || "Sem categoria"}</td><td className="px-4 py-3">{formatMoneyFromCents(Math.round(product.priceWeekly * 100))}</td><td className="px-4 py-3"><AvailabilityBadge status={product.status} /></td><td className="px-4 py-3"><span className={`text-xs rounded-full border px-2 py-1 ${product.isActive && product.publicationStatus === "published" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{product.isActive && product.publicationStatus === "published" ? "Publicado" : "Rascunho/inativo"}</span></td><td className="px-4 py-3">{product.rating > 0 ? `${product.rating.toFixed(1)} (${product.reviews})` : "Sem avaliações"}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={() => { setEditing(product); setEditorOpen(true); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg" aria-label={`Editar ${product.name}`}><Edit size={14} /></button><button onClick={() => void remove(product)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg" aria-label={`Excluir ${product.name}`}><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div>
          )}
        </div>
      )}
      {editorOpen && <ProductEditor product={editing} onClose={() => setEditorOpen(false)} />}
    </div>
  );
}
