import {
  INITIAL_ASSEMBLY_VARIANTS,
  INITIAL_BALL_SETS,
  INITIAL_CHAIR_MODELS,
  INITIAL_COMPATIBILITIES,
  INITIAL_COVERS,
  INITIAL_PRODUCTS,
  INITIAL_REDUCERS,
} from "../../data/mocks/catalog";
import type { CatalogSnapshot, LegacyCatalogSnapshotV1, Product } from "../../domain/catalog/types";
import type { CatalogRepository } from "./catalogRepository";

export const CATALOG_STORAGE_KEY = "rent4moms.catalog.v1";

function isCatalogSnapshotV2(value: unknown): value is CatalogSnapshot {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CatalogSnapshot>;
  return candidate.version === 2
    && Array.isArray(candidate.products)
    && Array.isArray(candidate.categories)
    && Array.isArray(candidate.chairModels)
    && Array.isArray(candidate.covers)
    && Array.isArray(candidate.reducers)
    && Array.isArray(candidate.ballSets)
    && Array.isArray(candidate.compatibilities)
    && Array.isArray(candidate.assemblyVariants);
}

function isCatalogSnapshotV1(value: unknown): value is LegacyCatalogSnapshotV1 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LegacyCatalogSnapshotV1>;
  return candidate.version === 1 && Array.isArray(candidate.products) && Array.isArray(candidate.categories);
}

function mergeStageFourProducts(products: Product[]): Product[] {
  const productMap = new Map(products.map((product) => [product.id, product]));
  for (const product of INITIAL_PRODUCTS) {
    if (!productMap.has(product.id)) productMap.set(product.id, product);
  }
  return [...productMap.values()];
}

export function migrateCatalogSnapshot(value: unknown): CatalogSnapshot | null {
  if (isCatalogSnapshotV2(value)) return value;
  if (!isCatalogSnapshotV1(value)) return null;

  return {
    version: 2,
    products: mergeStageFourProducts(value.products),
    categories: value.categories,
    chairModels: INITIAL_CHAIR_MODELS,
    covers: INITIAL_COVERS,
    reducers: INITIAL_REDUCERS,
    ballSets: INITIAL_BALL_SETS,
    compatibilities: INITIAL_COMPATIBILITIES,
    assemblyVariants: INITIAL_ASSEMBLY_VARIANTS,
    updatedAt: new Date().toISOString(),
  };
}

export class LocalCatalogRepository implements CatalogRepository {
  load(): CatalogSnapshot | null {
    if (typeof window === "undefined") return null;

    try {
      const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      const migrated = migrateCatalogSnapshot(parsed);
      if (migrated && (parsed as { version?: number }).version === 1) this.save(migrated);
      return migrated;
    } catch {
      return null;
    }
  }

  save(snapshot: CatalogSnapshot): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(snapshot));
  }

  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(CATALOG_STORAGE_KEY);
  }
}
