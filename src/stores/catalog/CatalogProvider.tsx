import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import {
  INITIAL_ASSEMBLY_VARIANTS,
  INITIAL_BALL_SETS,
  INITIAL_CATEGORIES,
  INITIAL_CHAIR_MODELS,
  INITIAL_COMPATIBILITIES,
  INITIAL_COVERS,
  INITIAL_PRODUCTS,
  INITIAL_REDUCERS,
} from "../../data/mocks/catalog";
import { isAssemblyVariantComplete } from "../../domain/catalog/configurator";
import type {
  AssemblyVariant,
  AssemblyVariantInput,
  BallSet,
  CatalogComponentType,
  CatalogSnapshot,
  Category,
  CategoryInput,
  CategoryWithCount,
  ChairModel,
  ComponentCompatibility,
  ConfigurableComponentInput,
  Cover,
  Product,
  Reducer,
} from "../../domain/catalog/types";
import { getCategoriesWithCount } from "../../domain/catalog/selectors";
import { CatalogApiRepository } from "../../services/catalog/catalogApiRepository";
import { LocalCatalogRepository } from "../../services/catalog/localCatalogRepository";
import { catalogReducer } from "./catalogReducer";

interface DeleteResult {
  ok: boolean;
  reason?: string;
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
  createCategory: (input: CategoryInput) => Category;
  updateCategory: (categoryId: string, input: CategoryInput) => void;
  deleteCategory: (categoryId: string) => void;
  updateProductCategories: (productId: string, categoryIds: string[]) => void;
  updateChairModel: (modelId: string, patch: Partial<ChairModel>) => void;
  updateBallSet: (ballSetId: string, patch: Partial<BallSet>) => void;
  saveCover: (input: ConfigurableComponentInput, coverId?: string) => Cover;
  saveReducer: (input: ConfigurableComponentInput, reducerId?: string) => Reducer;
  deleteCover: (coverId: string) => DeleteResult;
  deleteReducer: (reducerId: string) => DeleteResult;
  saveAssemblyVariant: (input: AssemblyVariantInput, variantId?: string) => AssemblyVariant;
  deleteAssemblyVariant: (variantId: string) => void;
  resetCatalog: () => void;
  refreshCatalog: () => Promise<void>;
  syncStatus: "loading" | "synced" | "offline" | "saving" | "error";
}

const repository = new LocalCatalogRepository();
const apiRepository = new CatalogApiRepository();

export function createInitialCatalogSnapshot(): CatalogSnapshot {
  return {
    version: 2,
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    chairModels: INITIAL_CHAIR_MODELS,
    covers: INITIAL_COVERS,
    reducers: INITIAL_REDUCERS,
    ballSets: INITIAL_BALL_SETS,
    compatibilities: INITIAL_COMPATIBILITIES,
    assemblyVariants: INITIAL_ASSEMBLY_VARIANTS,
    updatedAt: new Date().toISOString(),
  };
}

function loadInitialSnapshot(): CatalogSnapshot {
  return repository.load() ?? createInitialCatalogSnapshot();
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function compatibilityRecords(
  componentType: CatalogComponentType,
  componentId: string,
  input: ConfigurableComponentInput,
): ComponentCompatibility[] {
  return input.compatibleModelIds.map((modelId) => ({
    id: `${modelId}:${componentType}:${componentId}`,
    modelId,
    componentType,
    componentId,
    isPreferred: input.preferredModelIds.includes(modelId),
    isActive: true,
  }));
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children, canPersistRemote = false }: { children: React.ReactNode; canPersistRemote?: boolean }) {
  const [snapshot, dispatch] = useReducer(catalogReducer, undefined, loadInitialSnapshot);
  const [remoteHydrated, setRemoteHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"loading" | "synced" | "offline" | "saving" | "error">("loading");

  useEffect(() => {
    let active = true;
    apiRepository.load()
      .then((remoteSnapshot) => {
        if (!active) return;
        repository.save(remoteSnapshot);
        dispatch({ type: "catalog.reset", snapshot: remoteSnapshot });
        setSyncStatus("synced");
      })
      .catch(() => {
        if (active) setSyncStatus("offline");
      })
      .finally(() => {
        if (active) setRemoteHydrated(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    repository.save(snapshot);
    if (!remoteHydrated || !canPersistRemote) return;
    setSyncStatus("saving");
    const timer = window.setTimeout(() => {
      apiRepository.save(snapshot)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [snapshot, remoteHydrated, canPersistRemote]);

  const createCategory = useCallback((input: CategoryInput): Category => {
    const baseId = slugify(input.name) || "categoria";
    let id = baseId;
    let suffix = 2;
    while (snapshot.categories.some((category) => category.id === id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    const category: Category = {
      id,
      name: input.name.trim(),
      description: input.description.trim(),
      icon: input.icon.trim() || "📦",
      color: input.color,
      isActive: input.isActive,
      sortOrder: input.sortOrder ?? Math.max(0, ...snapshot.categories.map((item) => item.sortOrder)) + 1,
    };

    dispatch({ type: "category.created", category });
    return category;
  }, [snapshot.categories]);

  const updateCategory = useCallback((categoryId: string, input: CategoryInput) => {
    const current = snapshot.categories.find((category) => category.id === categoryId);
    if (!current) return;
    dispatch({
      type: "category.updated",
      category: {
        ...current,
        name: input.name.trim(),
        description: input.description.trim(),
        icon: input.icon.trim() || "📦",
        color: input.color,
        isActive: input.isActive,
        sortOrder: input.sortOrder ?? current.sortOrder,
      },
    });
  }, [snapshot.categories]);

  const deleteCategory = useCallback((categoryId: string) => {
    dispatch({ type: "category.deleted", categoryId });
  }, []);

  const updateProductCategories = useCallback((productId: string, categoryIds: string[]) => {
    dispatch({ type: "product.categories.updated", productId, categoryIds });
  }, []);

  const updateChairModel = useCallback((modelId: string, patch: Partial<ChairModel>) => {
    const current = snapshot.chairModels.find((model) => model.id === modelId);
    if (!current) return;
    dispatch({
      type: "chair-model.updated",
      chairModel: {
        ...current,
        ...patch,
        availableQuantity: Math.max(0, Math.trunc(patch.availableQuantity ?? current.availableQuantity)),
      },
    });
  }, [snapshot.chairModels]);

  const updateBallSet = useCallback((ballSetId: string, patch: Partial<BallSet>) => {
    const current = snapshot.ballSets.find((ballSet) => ballSet.id === ballSetId);
    if (!current) return;
    dispatch({
      type: "ball-set.updated",
      ballSet: {
        ...current,
        ...patch,
        availableQuantity: Math.max(0, Math.trunc(patch.availableQuantity ?? current.availableQuantity)),
      },
    });
  }, [snapshot.ballSets]);

  const saveComponent = useCallback((
    componentType: CatalogComponentType,
    input: ConfigurableComponentInput,
    componentId?: string,
  ): Cover | Reducer => {
    const list = componentType === "cover" ? snapshot.covers : snapshot.reducers;
    const prefix = componentType === "cover" ? "cover" : "reducer";
    const baseId = componentId ?? `${prefix}-${slugify(input.code || input.name) || Date.now()}`;
    let id = baseId;
    let suffix = 2;
    while (!componentId && list.some((component) => component.id === id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    const component = {
      id,
      code: input.code.trim(),
      name: input.name.trim(),
      description: input.description.trim(),
      priceAdjustment: {
        daily: Math.max(0, Number(input.priceAdjustment.daily) || 0),
        weekly: Math.max(0, Number(input.priceAdjustment.weekly) || 0),
        monthly: Math.max(0, Number(input.priceAdjustment.monthly) || 0),
      },
      isActive: input.isActive,
      availableQuantity: Math.max(0, Math.trunc(input.availableQuantity || 0)),
      kind: componentType,
    } as Cover | Reducer;

    dispatch({
      type: "component.saved",
      componentType,
      component,
      compatibilities: compatibilityRecords(componentType, component.id, input),
    });
    return component;
  }, [snapshot.covers, snapshot.reducers]);

  const saveCover = useCallback((input: ConfigurableComponentInput, coverId?: string) => (
    saveComponent("cover", input, coverId) as Cover
  ), [saveComponent]);

  const saveReducer = useCallback((input: ConfigurableComponentInput, reducerId?: string) => (
    saveComponent("reducer", input, reducerId) as Reducer
  ), [saveComponent]);

  const deleteComponent = useCallback((componentType: CatalogComponentType, componentId: string): DeleteResult => {
    const isUsed = snapshot.assemblyVariants.some((variant) => componentType === "cover"
      ? variant.coverId === componentId
      : variant.reducerId === componentId);
    if (isUsed) {
      return { ok: false, reason: "O componente está vinculado a uma ou mais variantes. Desative-o ou remova as variantes antes de excluir." };
    }
    dispatch({ type: "component.deleted", componentType, componentId });
    return { ok: true };
  }, [snapshot.assemblyVariants]);

  const saveAssemblyVariant = useCallback((input: AssemblyVariantInput, variantId?: string): AssemblyVariant => {
    const model = snapshot.chairModels.find((item) => item.id === input.modelId);
    const baseId = variantId ?? `${model?.version ?? "custom"}-${Date.now()}`;
    const next: AssemblyVariant = {
      id: baseId,
      ...input,
      prefix: input.prefix.trim(),
      publicationStatus: input.publicationStatus === "published" && input.images.length > 0
        ? input.publicationStatus
        : "draft",
    };
    if (next.publicationStatus === "published" && !isAssemblyVariantComplete(next)) {
      next.publicationStatus = "draft";
    }
    dispatch({ type: "variant.saved", variant: next });
    return next;
  }, [snapshot.chairModels]);

  const deleteAssemblyVariant = useCallback((variantId: string) => {
    dispatch({ type: "variant.deleted", variantId });
  }, []);

  const resetCatalog = useCallback(() => {
    repository.clear();
    dispatch({ type: "catalog.reset", snapshot: createInitialCatalogSnapshot() });
  }, []);

  const refreshCatalog = useCallback(async () => {
    setSyncStatus("loading");
    try {
      const remoteSnapshot = await apiRepository.load();
      repository.save(remoteSnapshot);
      dispatch({ type: "catalog.reset", snapshot: remoteSnapshot });
      setSyncStatus("synced");
    } catch {
      setSyncStatus("offline");
    }
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
    deleteCategory,
    updateProductCategories,
    updateChairModel,
    updateBallSet,
    saveCover,
    saveReducer,
    deleteCover: (coverId) => deleteComponent("cover", coverId),
    deleteReducer: (reducerId) => deleteComponent("reducer", reducerId),
    saveAssemblyVariant,
    deleteAssemblyVariant,
    resetCatalog,
    refreshCatalog,
    syncStatus,
  }), [
    snapshot,
    createCategory,
    updateCategory,
    deleteCategory,
    updateProductCategories,
    updateChairModel,
    updateBallSet,
    saveCover,
    saveReducer,
    deleteComponent,
    saveAssemblyVariant,
    deleteAssemblyVariant,
    resetCatalog,
    refreshCatalog,
    syncStatus,
  ]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used within CatalogProvider");
  return value;
}
