import type { Category, CategoryWithCount, Product } from "./types";

export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "pt-BR"));
}

export function getProductCategories(product: Product, categories: Category[]): Category[] {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  return product.categoryIds
    .map((categoryId) => categoryMap.get(categoryId))
    .filter((category): category is Category => Boolean(category));
}

export function getPrimaryCategory(product: Product, categories: Category[]): Category | undefined {
  return getProductCategories(product, categories)[0];
}

export function getCategoryNames(product: Product, categories: Category[]): string[] {
  return getProductCategories(product, categories).map((category) => category.name);
}

export function getCategoriesWithCount(
  categories: Category[],
  products: Product[],
  activeOnly = false,
): CategoryWithCount[] {
  return sortCategories(categories)
    .filter((category) => !activeOnly || category.isActive)
    .map((category) => ({
      ...category,
      productCount: products.filter((product) => product.categoryIds.includes(category.id)).length,
    }));
}

export function productsShareCategory(left: Product, right: Product): boolean {
  return left.categoryIds.some((categoryId) => right.categoryIds.includes(categoryId));
}
