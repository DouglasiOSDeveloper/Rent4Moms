import type { ProductPeriodPricing, RentalRateTable } from "../pricing/types";

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CatalogMediaImage {
  id: string;
  url: string;
  alt: string;
  originalName: string;
  isPrimary: boolean;
  sortOrder: number;
  angle?: AssemblyAngle;
  angleLabel?: string;
}

export interface ProductDetails {
  audience: string;
  includedItems: string;
  usage: string;
  safety: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  categoryIds: string[];
  ageMin: string;
  ageMax: string;
  weightMax: string;
  priceDaily: number;
  priceWeekly: number;
  priceMonthly: number;
  periodPricing?: ProductPeriodPricing;
  status: "available" | "few_units" | "on_demand" | "unavailable";
  description: string;
  details?: ProductDetails;
  rating: number;
  reviews: number;
  photo: string;
  images?: CatalogMediaImage[];
  featured: boolean;
  conservation: string;
  tags: string[];
  minDays: number;
  specs: {
    dimensions: string;
    productWeight: string;
    material: string;
    color: string;
    electric: string;
    includes: string[];
  };
  isActive: boolean;
  publicationStatus: AssemblyPublicationStatus;
}

export type AssemblyAngle = string;
export type CatalogComponentType = "cover" | "reducer";
export type AssemblyPublicationStatus = "draft" | "published";

export interface ChairModel {
  id: string;
  productId: string | null;
  version: "2.0" | "3.0" | "4.0" | "5.0" | string;
  technicalCode: string;
  name: string;
  description: string;
  ballSetId: string;
  isActive: boolean;
  availableQuantity: number;
  defaultImage: string;
  images?: CatalogMediaImage[];
}

export interface ConfigurableComponentBase {
  id: string;
  code: string;
  name: string;
  description: string;
  priceAdjustment: RentalRateTable;
  isActive: boolean;
  availableQuantity: number;
  photo: string;
}

export interface Cover extends ConfigurableComponentBase {
  kind: "cover";
}

export interface Reducer extends ConfigurableComponentBase {
  kind: "reducer";
}

export interface BallSet {
  id: string;
  code: string;
  name: string;
  modelId: string;
  description: string;
  isActive: boolean;
  availableQuantity: number;
  photo: string;
}

export interface ComponentCompatibility {
  id: string;
  modelId: string;
  componentType: CatalogComponentType;
  componentId: string;
  isPreferred: boolean;
  isActive: boolean;
}

export interface AssemblyImage {
  id: string;
  angleId: string;
  angle: AssemblyAngle;
  angleLabel: string;
  url: string;
  alt: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface AssemblyVariant {
  id: string;
  modelId: string;
  coverId: string;
  reducerId: string | null;
  ballSetId: string;
  prefix: string;
  isActive: boolean;
  publicationStatus: AssemblyPublicationStatus;
  images: AssemblyImage[];
}

export interface CatalogSnapshot {
  version: 2;
  products: Product[];
  categories: Category[];
  chairModels: ChairModel[];
  covers: Cover[];
  reducers: Reducer[];
  ballSets: BallSet[];
  compatibilities: ComponentCompatibility[];
  assemblyVariants: AssemblyVariant[];
  updatedAt: string;
}

export interface LegacyCatalogSnapshotV1 {
  version: 1;
  products: Product[];
  categories: Category[];
  updatedAt: string;
}

export interface CategoryWithCount extends Category {
  productCount: number;
}

export interface CategoryInput {
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder?: number;
}

export interface ConfigurableComponentInput {
  code: string;
  name: string;
  description: string;
  priceAdjustment: RentalRateTable;
  isActive: boolean;
  compatibleModelIds: string[];
  preferredModelIds: string[];
}

export interface AssemblyVariantInput {
  modelId: string;
  coverId: string;
  reducerId: string | null;
  ballSetId: string;
  prefix: string;
  isActive: boolean;
  publicationStatus: AssemblyPublicationStatus;
}


export interface ProductInput {
  name: string;
  brand: string;
  model: string;
  categoryIds: string[];
  ageMin: string;
  ageMax: string;
  weightMax: string;
  priceDaily: number;
  priceWeekly: number;
  priceMonthly: number;
  periodPricing: ProductPeriodPricing;
  status: Product["status"];
  description: string;
  details: ProductDetails;
  featured: boolean;
  conservation: string;
  tags: string[];
  minDays: number;
  specs: Product["specs"];
  isActive: boolean;
  publicationStatus: AssemblyPublicationStatus;
}

export type ChairModelInput = Omit<ChairModel, "id" | "availableQuantity" | "defaultImage">;
export type BallSetInput = Omit<BallSet, "id" | "availableQuantity" | "photo">;
export type CatalogEntityType = "category" | "product" | "chair_model" | "cover" | "reducer" | "ball_set" | "assembly_variant";
export type CatalogDeleteResolution = "block" | "deactivate_dependents";

export interface CatalogImpactDependency {
  entityType: CatalogEntityType | "compatibility" | "inventory_unit" | "media_asset";
  id: string;
  label: string;
  relation: string;
  resolution: "unlink" | "deactivate" | "archive" | "retire";
}

export interface CatalogImpact {
  entityType: CatalogEntityType;
  entityId: string;
  dependencies: CatalogImpactDependency[];
  canDeleteWithoutResolution: boolean;
}
