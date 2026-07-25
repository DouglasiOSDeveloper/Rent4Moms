import type { CatalogSnapshot } from "./types";

export function createEmptyCatalogSnapshot(): CatalogSnapshot {
  return {
    version: 2,
    products: [],
    categories: [],
    chairModels: [],
    covers: [],
    reducers: [],
    ballSets: [],
    compatibilities: [],
    assemblyVariants: [],
    updatedAt: new Date(0).toISOString(),
  };
}

export function isCatalogEmpty(snapshot: CatalogSnapshot): boolean {
  return snapshot.products.length === 0
    && snapshot.categories.length === 0
    && snapshot.chairModels.length === 0
    && snapshot.covers.length === 0
    && snapshot.reducers.length === 0
    && snapshot.ballSets.length === 0
    && snapshot.compatibilities.length === 0
    && snapshot.assemblyVariants.length === 0;
}
