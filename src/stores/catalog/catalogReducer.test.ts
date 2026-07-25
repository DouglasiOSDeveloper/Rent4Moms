import { describe, expect, it } from "vitest";
import {
  INITIAL_ASSEMBLY_VARIANTS,
  INITIAL_BALL_SETS,
  INITIAL_CATEGORIES,
  INITIAL_CHAIR_MODELS,
  INITIAL_COMPATIBILITIES,
  INITIAL_COVERS,
  INITIAL_PRODUCTS,
  INITIAL_REDUCERS,
} from "../../test/fixtures/catalogFixture";
import { getCategoriesWithCount, getCategoryNames } from "../../domain/catalog/selectors";
import type { CatalogSnapshot, Category } from "../../domain/catalog/types";
import { catalogReducer } from "./catalogReducer";

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

describe("catalogReducer", () => {
  it("vincula um produto a várias categorias", () => {
    const next = catalogReducer(snapshot(), {
      type: "product.categories.updated",
      productId: "mamaroo-40",
      categoryIds: ["cadeiras-de-balanco", "bebes-conforto"],
    });

    expect(next.products.find((product) => product.id === "mamaroo-40")?.categoryIds)
      .toEqual(["cadeiras-de-balanco", "bebes-conforto"]);
  });

  it("remove os vínculos ao excluir uma categoria", () => {
    const linked = catalogReducer(snapshot(), {
      type: "product.categories.updated",
      productId: "mamaroo-40",
      categoryIds: ["cadeiras-de-balanco", "bebes-conforto"],
    });
    const next = catalogReducer(linked, { type: "category.deleted", categoryId: "bebes-conforto" });

    expect(next.categories.some((category) => category.id === "bebes-conforto")).toBe(false);
    expect(next.products.find((product) => product.id === "mamaroo-40")?.categoryIds)
      .toEqual(["cadeiras-de-balanco"]);
  });

  it("mantém categorias inativas fora da lista pública", () => {
    const inactive: Category = { ...INITIAL_CATEGORIES[0], isActive: false };
    const categories = [inactive, ...INITIAL_CATEGORIES.slice(1)];
    const publicCategories = getCategoriesWithCount(categories, INITIAL_PRODUCTS, true);

    expect(publicCategories.some((category) => category.id === inactive.id)).toBe(false);
  });

  it("calcula contagens a partir da relação muitos-para-muitos", () => {
    const products = INITIAL_PRODUCTS.map((product) => product.id === "mamaroo-40"
      ? { ...product, categoryIds: ["cadeiras-de-balanco", "bebes-conforto"] }
      : product);
    const categories = getCategoriesWithCount(INITIAL_CATEGORIES, products);

    expect(categories.find((category) => category.id === "cadeiras-de-balanco")?.productCount).toBe(4);
    expect(categories.find((category) => category.id === "bebes-conforto")?.productCount).toBe(2);
    expect(getCategoryNames(products[0], INITIAL_CATEGORIES)).toEqual(["Cadeiras de balanço", "Bebês-conforto"]);
  });

  it("atualiza componente e compatibilidades na mesma operação", () => {
    const component = { ...INITIAL_COVERS[0], name: "Pano atualizado" };
    const next = catalogReducer(snapshot(), {
      type: "component.saved",
      componentType: "cover",
      component,
      compatibilities: [{
        id: `chair-model-30:cover:${component.id}`,
        modelId: "chair-model-30",
        componentType: "cover",
        componentId: component.id,
        isPreferred: true,
        isActive: true,
      }],
    });

    expect(next.covers.find((cover) => cover.id === component.id)?.name).toBe("Pano atualizado");
    expect(next.compatibilities.filter((item) => item.componentId === component.id)).toHaveLength(1);
    expect(next.compatibilities.find((item) => item.componentId === component.id)?.modelId).toBe("chair-model-30");
  });
});
