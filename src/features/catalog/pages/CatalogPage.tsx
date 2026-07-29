import React, { useMemo, useState } from "react";
import { Archive, Filter, List, Search, X } from "lucide-react";
import { useSearchParams } from "react-router";
import { ErrorState, EmptyState, LoadingState } from "../../../components/states/DataState";
import { ProductCard } from "../../../components/prototype/ProductCard";
import { getCategoryNames } from "../../../domain/catalog/selectors";
import type { Page } from "../../../domain/shared/types";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";

export function CatalogPage({ navigate }: {
  navigate: (p: Page, params?: Record<string, string>) => void;
}) {
  const { products, categories, publicCategories, syncStatus, refreshCatalog } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const search = searchParams.get("busca") ?? "";
  const filterCat = searchParams.getAll("category").filter(Boolean);
  const [sortBy, setSortBy] = useState("Mais relevantes");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const updateCatalogParams = (nextSearch: string, nextCategories: string[]) => {
    const next = new URLSearchParams();
    if (nextSearch.trim()) next.set("busca", nextSearch);
    nextCategories.forEach((categoryId) => next.append("category", categoryId));
    setSearchParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) {
      const normalizedSearch = search.toLowerCase();
      result = result.filter((product) =>
        product.name.toLowerCase().includes(normalizedSearch)
        || product.brand.toLowerCase().includes(normalizedSearch)
        || getCategoryNames(product, categories).some((name) => name.toLowerCase().includes(normalizedSearch)),
      );
    }
    if (filterCat.length) result = result.filter((product) => product.categoryIds.some((categoryId) => filterCat.includes(categoryId)));
    if (filterStatus.length) result = result.filter((product) => filterStatus.includes(product.status));
    if (sortBy === "Menor preço estimado") result.sort((a, b) => a.priceWeekly - b.priceWeekly);
    if (sortBy === "Maior preço estimado") result.sort((a, b) => b.priceWeekly - a.priceWeekly);
    if (sortBy === "Melhor avaliados") result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, categories, search, filterCat, filterStatus, sortBy]);

  const toggleCat = (categoryId: string) => {
    const nextCategories = filterCat.includes(categoryId)
      ? filterCat.filter((id) => id !== categoryId)
      : [...filterCat, categoryId];
    updateCatalogParams(search, nextCategories);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
    setFilterStatus([]);
  };

  const FilterPanel = () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-semibold text-foreground mb-3">Categoria</p>
        {publicCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma categoria publicada.</p>
        ) : publicCategories.map((category) => (
          <label key={category.id} className="flex items-center gap-2 py-1.5 cursor-pointer">
            <input type="checkbox" checked={filterCat.includes(category.id)} onChange={() => toggleCat(category.id)} className="accent-primary" />
            <span className="text-sm text-foreground flex-1">{category.name}</span>
            <span className="text-xs text-muted-foreground">{category.productCount}</span>
          </label>
        ))}
      </div>
      <div>
        <p className="font-semibold text-foreground mb-3">Disponibilidade</p>
        {[["available", "Disponível"], ["few_units", "Poucas unidades"], ["on_demand", "Sob consulta"]].map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filterStatus.includes(value)}
              onChange={() => setFilterStatus((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])}
              className="accent-primary"
            />
            <span className="text-sm text-foreground">{label}</span>
          </label>
        ))}
      </div>
      {(search || filterCat.length > 0 || filterStatus.length > 0) && (
        <button onClick={clearFilters} className="text-sm text-primary underline text-left">Limpar filtros</button>
      )}
    </div>
  );

  const catalogState = (() => {
    if (syncStatus === "loading") return <LoadingState title="Carregando catálogo" description="Consultando os produtos publicados." />;
    if (syncStatus === "error") return <ErrorState title="Não foi possível carregar os produtos" description="Nenhum dado fictício foi exibido. Verifique a API e tente novamente." onRetry={() => void refreshCatalog()} />;
    if (products.length === 0) return <EmptyState title="Nenhum produto publicado" description="Os produtos cadastrados e publicados pelo administrador aparecerão aqui." />;
    if (filtered.length === 0) return <EmptyState title="Nenhum produto encontrado" description="Ajuste os filtros ou a busca." actionLabel="Limpar filtros" onAction={clearFilters} />;
    return (
      <div className={viewMode === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            categoryNames={getCategoryNames(product, publicCategories)}
            navigate={navigate}
            isComparing={compareItems.includes(product.id)}
            onToggleCompare={(id) => setCompareItems((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
          />
        ))}
      </div>
    );
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-2">Catálogo de produtos</h1>
        <p className="text-muted-foreground">Equipamentos disponíveis para locação</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => updateCatalogParams(event.target.value, filterCat)} placeholder="Buscar produtos ou categorias..." disabled={products.length === 0} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60" />
        </div>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} disabled={products.length === 0} className="px-4 py-2.5 rounded-xl border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60">
          {["Mais relevantes", "Menor preço estimado", "Maior preço estimado", "Melhor avaliados", "Mais procurados"].map((option) => <option key={option}>{option}</option>)}
        </select>
        <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} disabled={products.length === 0} className="px-3 py-2.5 rounded-xl border border-border bg-input-background text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60" aria-label="Alternar visualização">
          {viewMode === "grid" ? <List size={18} /> : <Archive size={18} />}
        </button>
        <button onClick={() => setDrawerOpen(true)} disabled={products.length === 0} className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-input-background text-foreground disabled:opacity-60">
          <Filter size={16} />Filtros
        </button>
      </div>

      {(filterCat.length > 0 || filterStatus.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filterCat.map((categoryId) => {
            const category = categories.find((item) => item.id === categoryId);
            return category ? (
              <button key={categoryId} onClick={() => toggleCat(categoryId)} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
                {category.name} <X size={12} />
              </button>
            ) : null;
          })}
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0"><FilterPanel /></aside>
        <div className="flex-1">
          {products.length > 0 && syncStatus !== "loading" && syncStatus !== "error" && (
            <p className="text-sm text-muted-foreground mb-6">{filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
          )}
          {catalogState}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto w-72 bg-card h-full p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="font-semibold text-foreground">Filtros</p>
              <button onClick={() => setDrawerOpen(false)} aria-label="Fechar filtros"><X size={20} className="text-muted-foreground" /></button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
}
