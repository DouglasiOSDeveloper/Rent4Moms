import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createEmptyCatalogSnapshot, isCatalogEmpty } from "../../domain/catalog/emptyCatalog";
import type {
  AssemblyVariant,
  AssemblyVariantInput,
  BallSet,
  BallSetInput,
  CatalogDeleteResolution,
  CatalogEntityType,
  CatalogImpact,
  CatalogSnapshot,
  Category,
  CategoryInput,
  CategoryWithCount,
  ChairModel,
  ChairModelInput,
  ComponentCompatibility,
  ConfigurableComponentInput,
  Cover,
  Product,
  ProductInput,
  Reducer,
} from "../../domain/catalog/types";
import { getCategoriesWithCount } from "../../domain/catalog/selectors";
import { normalizeCatalogSnapshotImageUrls } from "../../domain/catalog/assemblyImages";
import { normalizeProductPeriodPricing } from "../../domain/pricing/pricingEngine";
import { CatalogApiRepository } from "../../services/catalog/catalogApiRepository";

interface DeleteResult {
  ok: boolean;
  reason?: string;
  impact?: CatalogImpact;
}

interface CatalogContextValue {
  products: Product[];
  categories: Category[];
  publicCategories: CategoryWithCount[];
  allCategoriesWithCount: CategoryWithCount[];
  chairModels: ChairModel[];
  covers: Cover[];
  reducers: Reducer[];
  ballSets: BallSet[];
  compatibilities: ComponentCompatibility[];
  assemblyVariants: AssemblyVariant[];
  getProduct: (productId: string) => Product | undefined;
  createCategory: (input: CategoryInput) => Promise<Category>;
  updateCategory: (categoryId: string, input: CategoryInput) => Promise<Category>;
  deleteCategory: (categoryId: string, resolution?: CatalogDeleteResolution) => Promise<DeleteResult>;
  createProduct: (input: ProductInput) => Promise<Product>;
  updateProduct: (productId: string, input: ProductInput) => Promise<Product>;
  deleteProduct: (productId: string, resolution?: CatalogDeleteResolution) => Promise<DeleteResult>;
  updateProductCategories: (productId: string, categoryIds: string[]) => Promise<void>;
  saveChairModel: (input: ChairModelInput, modelId?: string) => Promise<ChairModel>;
  updateChairModel: (modelId: string, patch: Partial<ChairModel>) => Promise<void>;
  deleteChairModel: (modelId: string, resolution?: CatalogDeleteResolution) => Promise<DeleteResult>;
  saveBallSet: (input: BallSetInput, ballSetId?: string) => Promise<BallSet>;
  updateBallSet: (ballSetId: string, patch: Partial<BallSet>) => Promise<void>;
  deleteBallSet: (ballSetId: string, resolution?: CatalogDeleteResolution) => Promise<DeleteResult>;
  saveCover: (input: ConfigurableComponentInput, coverId?: string) => Promise<Cover>;
  saveReducer: (input: ConfigurableComponentInput, reducerId?: string) => Promise<Reducer>;
  deleteCover: (coverId: string, resolution?: CatalogDeleteResolution) => Promise<DeleteResult>;
  deleteReducer: (reducerId: string, resolution?: CatalogDeleteResolution) => Promise<DeleteResult>;
  saveAssemblyVariant: (input: AssemblyVariantInput, variantId?: string) => Promise<AssemblyVariant>;
  deleteAssemblyVariant: (variantId: string, resolution?: CatalogDeleteResolution) => Promise<DeleteResult>;
  getImpact: (entityType: CatalogEntityType, entityId: string) => Promise<CatalogImpact>;
  resetCatalog: () => void;
  refreshCatalog: () => Promise<void>;
  syncStatus: "loading" | "synced" | "empty" | "saving" | "error";
}

const apiRepository = new CatalogApiRepository();
const CatalogContext = createContext<CatalogContextValue | null>(null);

export function createInitialCatalogSnapshot(): CatalogSnapshot {
  return createEmptyCatalogSnapshot();
}

function productToInput(product: Product, patch: Partial<Product> = {}): ProductInput {
  const next = { ...product, ...patch };
  return {
    name: next.name,
    brand: next.brand,
    model: next.model,
    categoryIds: next.categoryIds,
    ageMin: next.ageMin,
    ageMax: next.ageMax,
    weightMax: next.weightMax,
    priceDaily: next.priceDaily,
    priceWeekly: next.priceWeekly,
    priceMonthly: next.priceMonthly,
    periodPricing: normalizeProductPeriodPricing(next.periodPricing),
    status: next.status,
    description: next.description,
    featured: next.featured,
    conservation: next.conservation,
    tags: next.tags,
    minDays: next.minDays,
    specs: next.specs,
    isActive: next.isActive,
    publicationStatus: next.publicationStatus,
  };
}

const deleteMetadata: Record<CatalogEntityType, { collection: string; label: string }> = {
  category: { collection: "categories", label: "categoria" },
  product: { collection: "products", label: "produto" },
  chair_model: { collection: "chair-models", label: "modelo" },
  cover: { collection: "covers", label: "pano" },
  reducer: { collection: "reducers", label: "redutor" },
  ball_set: { collection: "ball-sets", label: "conjunto de bolinhas" },
  assembly_variant: { collection: "assembly-variants", label: "variante" },
};

export function CatalogProvider({ children, canPersistRemote = false }: { children: React.ReactNode; canPersistRemote?: boolean }) {
  const [snapshot, setSnapshot] = useState<CatalogSnapshot>(createInitialCatalogSnapshot);
  const [syncStatus, setSyncStatus] = useState<CatalogContextValue["syncStatus"]>("loading");

  const applySnapshot = useCallback((next: CatalogSnapshot) => {
    const normalized = normalizeCatalogSnapshotImageUrls(next);
    setSnapshot(normalized);
    setSyncStatus(isCatalogEmpty(normalized) ? "empty" : "synced");
  }, []);

  const refreshCatalog = useCallback(async () => {
    setSyncStatus("loading");
    try {
      applySnapshot(await apiRepository.load(canPersistRemote));
    } catch {
      setSnapshot(createInitialCatalogSnapshot());
      setSyncStatus("error");
    }
  }, [applySnapshot, canPersistRemote]);

  useEffect(() => { void refreshCatalog(); }, [refreshCatalog]);

  const mutate = useCallback(async <T,>(operation: () => Promise<{ entity: T; catalog: CatalogSnapshot }>): Promise<T> => {
    setSyncStatus("saving");
    try {
      const response = await operation();
      applySnapshot(response.catalog);
      return response.entity;
    } catch (error) {
      setSyncStatus("error");
      throw error;
    }
  }, [applySnapshot]);

  const deleteEntity = useCallback(async (
    entityType: CatalogEntityType,
    entityId: string,
    resolution: CatalogDeleteResolution = "block",
  ): Promise<DeleteResult> => {
    const impact = await apiRepository.getImpact(entityType, entityId);
    if (!impact.canDeleteWithoutResolution && resolution === "block") {
      return {
        ok: false,
        impact,
        reason: `Este ${deleteMetadata[entityType].label} possui ${impact.dependencies.length} vínculo(s). Revise o impacto antes de excluir.`,
      };
    }
    setSyncStatus("saving");
    try {
      const response = await apiRepository.deleteEntity(deleteMetadata[entityType].collection, entityId, resolution);
      applySnapshot(response.catalog);
      return { ok: true, impact: response.impact };
    } catch (error) {
      setSyncStatus("error");
      throw error;
    }
  }, [applySnapshot]);

  const createCategory = useCallback((input: CategoryInput) => mutate(() => apiRepository.createCategory(input)), [mutate]);
  const updateCategory = useCallback((categoryId: string, input: CategoryInput) => mutate(() => apiRepository.updateCategory(categoryId, input)), [mutate]);
  const createProduct = useCallback((input: ProductInput) => mutate(() => apiRepository.createProduct(input)), [mutate]);
  const updateProduct = useCallback((productId: string, input: ProductInput) => mutate(() => apiRepository.updateProduct(productId, input)), [mutate]);

  const updateProductCategories = useCallback(async (productId: string, categoryIds: string[]) => {
    const product = snapshot.products.find((item) => item.id === productId);
    if (!product) return;
    await updateProduct(productId, productToInput(product, { categoryIds }));
  }, [snapshot.products, updateProduct]);

  const saveChairModel = useCallback((input: ChairModelInput, modelId?: string) => mutate(() => (
    modelId ? apiRepository.updateChairModel(modelId, input) : apiRepository.createChairModel(input)
  )), [mutate]);

  const updateChairModel = useCallback(async (modelId: string, patch: Partial<ChairModel>) => {
    const current = snapshot.chairModels.find((item) => item.id === modelId);
    if (!current) return;
    const next = { ...current, ...patch };
    const input: ChairModelInput = {
      productId: next.productId, version: next.version, technicalCode: next.technicalCode, name: next.name,
      description: next.description, ballSetId: next.ballSetId, isActive: next.isActive,
    };
    await saveChairModel(input, modelId);
  }, [saveChairModel, snapshot.chairModels]);

  const saveBallSet = useCallback((input: BallSetInput, ballSetId?: string) => mutate(() => (
    ballSetId ? apiRepository.updateBallSet(ballSetId, input) : apiRepository.createBallSet(input)
  )), [mutate]);

  const updateBallSet = useCallback(async (ballSetId: string, patch: Partial<BallSet>) => {
    const current = snapshot.ballSets.find((item) => item.id === ballSetId);
    if (!current) return;
    const next = { ...current, ...patch };
    const input: BallSetInput = {
      code: next.code, name: next.name, modelId: next.modelId, description: next.description,
      isActive: next.isActive,
    };
    await saveBallSet(input, ballSetId);
  }, [saveBallSet, snapshot.ballSets]);

  const saveCover = useCallback(async (input: ConfigurableComponentInput, coverId?: string): Promise<Cover> => {
    const entity = await mutate(() => apiRepository.saveComponent("cover", input, coverId));
    return entity as Cover;
  }, [mutate]);
  const saveReducer = useCallback(async (input: ConfigurableComponentInput, reducerId?: string): Promise<Reducer> => {
    const entity = await mutate(() => apiRepository.saveComponent("reducer", input, reducerId));
    return entity as Reducer;
  }, [mutate]);
  const saveAssemblyVariant = useCallback((input: AssemblyVariantInput, variantId?: string) => mutate(() => apiRepository.saveAssemblyVariant(input, variantId)), [mutate]);

  const resetCatalog = useCallback(() => {
    setSnapshot(createInitialCatalogSnapshot());
    setSyncStatus("empty");
  }, []);

  const value = useMemo<CatalogContextValue>(() => ({
    products: snapshot.products,
    categories: snapshot.categories,
    publicCategories: getCategoriesWithCount(snapshot.categories, snapshot.products, true),
    allCategoriesWithCount: getCategoriesWithCount(snapshot.categories, snapshot.products),
    chairModels: snapshot.chairModels,
    covers: snapshot.covers,
    reducers: snapshot.reducers,
    ballSets: snapshot.ballSets,
    compatibilities: snapshot.compatibilities,
    assemblyVariants: snapshot.assemblyVariants,
    getProduct: (productId) => snapshot.products.find((product) => product.id === productId),
    createCategory,
    updateCategory,
    deleteCategory: (categoryId, resolution) => deleteEntity("category", categoryId, resolution),
    createProduct,
    updateProduct,
    deleteProduct: (productId, resolution) => deleteEntity("product", productId, resolution),
    updateProductCategories,
    saveChairModel,
    updateChairModel,
    deleteChairModel: (modelId, resolution) => deleteEntity("chair_model", modelId, resolution),
    saveBallSet,
    updateBallSet,
    deleteBallSet: (ballSetId, resolution) => deleteEntity("ball_set", ballSetId, resolution),
    saveCover,
    saveReducer,
    deleteCover: (coverId, resolution) => deleteEntity("cover", coverId, resolution),
    deleteReducer: (reducerId, resolution) => deleteEntity("reducer", reducerId, resolution),
    saveAssemblyVariant,
    deleteAssemblyVariant: (variantId, resolution) => deleteEntity("assembly_variant", variantId, resolution),
    getImpact: (entityType, entityId) => apiRepository.getImpact(entityType, entityId),
    resetCatalog,
    refreshCatalog,
    syncStatus,
  }), [snapshot, createCategory, updateCategory, deleteEntity, createProduct, updateProduct, updateProductCategories, saveChairModel, updateChairModel, saveBallSet, updateBallSet, saveCover, saveReducer, saveAssemblyVariant, resetCatalog, refreshCatalog, syncStatus]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used within CatalogProvider");
  return value;
}
