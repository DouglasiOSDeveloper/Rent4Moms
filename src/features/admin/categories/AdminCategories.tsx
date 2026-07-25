import React, { useMemo, useState } from "react";
import { CheckCircle, Edit, Plus, Search, Trash2, X } from "lucide-react";
import type { Category, CategoryInput } from "../../../domain/catalog/types";
import { Btn, Input, cn } from "../../../components/prototype/PrototypeUI";
import { EmptyState, ErrorState, LoadingState } from "../../../components/states/DataState";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";

const COLOR_OPTIONS = [
  { value: "bg-amber-50 border-amber-200", label: "Âmbar" },
  { value: "bg-rose-50 border-rose-200", label: "Rosa" },
  { value: "bg-blue-50 border-blue-200", label: "Azul" },
  { value: "bg-green-50 border-green-200", label: "Verde" },
  { value: "bg-purple-50 border-purple-200", label: "Roxo" },
  { value: "bg-gray-50 border-gray-200", label: "Cinza" },
];

const EMPTY_FORM: CategoryInput = {
  name: "",
  description: "",
  icon: "📦",
  color: COLOR_OPTIONS[0].value,
  isActive: true,
};

export function AdminCategories() {
  const {
    allCategoriesWithCount,
    createCategory,
    updateCategory,
    deleteCategory,
    syncStatus,
    refreshCatalog,
  } = useCatalog();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryInput>(EMPTY_FORM);
  const [modalOpen, setModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const normalized = search.toLowerCase();
    return allCategoriesWithCount.filter((category) =>
      category.name.toLowerCase().includes(normalized)
      || category.description.toLowerCase().includes(normalized),
    );
  }, [allCategoriesWithCount, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: allCategoriesWithCount.length + 1 });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
    setError("");
    setModalOpen(true);
  };

  const saveCategory = async () => {
    if (!form.name.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) await updateCategory(editing.id, form);
      else await createCategory(form);
      setModalOpen(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a categoria.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Arquivar a categoria “${category.name}”?`)) return;
    try {
      const result = await deleteCategory(category.id);
      if (result.ok) return;
      const details = result.impact?.dependencies.map((item) => `• ${item.label}: ${item.relation}`).join("\n") ?? result.reason ?? "";
      if (window.confirm(`A categoria possui vínculos:\n${details}\n\nDeseja remover os vínculos e arquivar a categoria?`)) {
        await deleteCategory(category.id, "deactivate_dependents");
      }
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir a categoria.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground mt-1">As alterações aparecem imediatamente na Home e no catálogo.</p>
        </div>
        <Btn variant="primary" size="sm" onClick={openCreate} disabled={syncStatus === "loading" || syncStatus === "error"}><Plus size={14} />Nova categoria</Btn>
      </div>

      {saved && (
        <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg w-fit">
          <CheckCircle size={14} />Categoria salva no catálogo persistido.
        </div>
      )}

      {syncStatus === "loading" ? <LoadingState title="Carregando categorias" /> : syncStatus === "error" ? <ErrorState title="Não foi possível carregar as categorias" description="Nenhuma categoria fictícia foi exibida." onRetry={() => void refreshCatalog()} /> : allCategoriesWithCount.length === 0 ? <EmptyState title="Nenhuma categoria cadastrada" description="Use “Nova categoria” para criar o primeiro registro real." /> : <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar categoria..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                {["Ordem", "Categoria", "Descrição", "Produtos", "Status", ""].map((heading) => (
                  <th key={heading} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((category) => (
                <tr key={category.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{category.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center text-xl", category.color)}>{category.icon}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{category.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-sm">{category.description || "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{category.productCount}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", category.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200")}>
                      {category.isActive ? "Publicada" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(category)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors" aria-label={`Editar ${category.name}`}><Edit size={14} /></button>
                      <button onClick={() => handleDelete(category)} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label={`Excluir ${category.name}`}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border text-sm text-muted-foreground">
          {filtered.length} categoria{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-foreground text-lg">{editing ? "Editar categoria" : "Nova categoria"}</h2>
              <button onClick={() => setModalOpen(false)} aria-label="Fechar"><X size={20} className="text-muted-foreground" /></button>
            </div>

            <div className="grid sm:grid-cols-[1fr_110px] gap-4">
              <Input label="Nome" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} placeholder="Ex: Itens para viagem" required />
              <Input label="Ícone" value={form.icon} onChange={(icon) => setForm((current) => ({ ...current, icon }))} placeholder="🧳" />
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground block mb-1.5">Descrição</label>
                <textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Descrição curta da categoria..." className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Estilo visual</label>
                <select value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm">
                  {COLOR_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <Input label="Ordem" type="number" value={String(form.sortOrder ?? 1)} onChange={(value) => setForm((current) => ({ ...current, sortOrder: Number(value) || 1 }))} />
              <label className="sm:col-span-2 flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} className="accent-primary" />
                Publicar esta categoria no site
              </label>
            </div>

            {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

            <div className="flex gap-3 mt-6 justify-end">
              <Btn variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Btn>
              <Btn variant="primary" onClick={() => void saveCategory()} disabled={saving}>{saving ? "Salvando..." : "Salvar categoria"}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
