import type { RentalRateTable } from "../pricing/types";

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
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
  status: "available" | "few_units" | "on_demand" | "unavailable";
  description: string;
  rating: number;
  reviews: number;
  photo: string;
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
}

export type AssemblyAngle = "FRT" | "DIR" | "ESQ" | "SUP";
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
}

export interface ConfigurableComponentBase {
  id: string;
  code: string;
  name: string;
  description: string;
  priceAdjustment: RentalRateTable;
  isActive: boolean;
  availableQuantity: number;
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
  angle: AssemblyAngle;
  assetKey: string;
  alt: string;
  isPlaceholder: boolean;
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
  availableQuantity: number;
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
  images: AssemblyImage[];
}
