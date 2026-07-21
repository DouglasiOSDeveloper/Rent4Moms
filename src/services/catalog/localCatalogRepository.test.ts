import { beforeEach, describe, expect, it } from "vitest";
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
import type { CatalogSnapshot, LegacyCatalogSnapshotV1 } from "../../domain/catalog/types";
import { CATALOG_STORAGE_KEY, LocalCatalogRepository, migrateCatalogSnapshot } from "./localCatalogRepository";

function snapshot(): CatalogSnapshot {
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
    updatedAt: "2026-07-20T00:00:00.000Z",
  };
}

describe("LocalCatalogRepository", () => {
  beforeEach(() => window.localStorage.clear());

  it("persiste e recupera o catálogo com configurador", () => {
    const repository = new LocalCatalogRepository();
    const value = snapshot();

    repository.save(value);

    expect(repository.load()).toEqual(value);
    expect(window.localStorage.getItem(CATALOG_STORAGE_KEY)).toContain("4.0-028");
  });

  it("migra o catálogo da etapa 3 sem perder categorias editadas", () => {
    const legacy: LegacyCatalogSnapshotV1 = {
      version: 1,
      products: INITIAL_PRODUCTS.filter((product) => product.id !== "mamaroo-20" && product.id !== "mamaroo-30"),
      categories: [{ ...INITIAL_CATEGORIES[0], name: "Categoria editada" }, ...INITIAL_CATEGORIES.slice(1)],
      updatedAt: "2026-07-20T00:00:00.000Z",
    };

    const migrated = migrateCatalogSnapshot(legacy);

    expect(migrated?.version).toBe(2);
    expect(migrated?.categories[0].name).toBe("Categoria editada");
    expect(migrated?.products.some((product) => product.id === "mamaroo-30")).toBe(true);
    expect(migrated?.assemblyVariants).toHaveLength(48);
  });

  it("ignora conteúdo inválido salvo no navegador", () => {
    window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify({ version: 99 }));
    expect(new LocalCatalogRepository().load()).toBeNull();
  });
});
