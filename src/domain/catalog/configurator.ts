import type { RentalRateTable } from "../pricing/types";
import type {
  AssemblyVariant,
  BallSet,
  CatalogSnapshot,
  ChairModel,
  Cover,
  Reducer,
} from "./types";

export interface ProductConfiguration {
  chairModel: ChairModel;
  cover: Cover;
  reducer: Reducer | null;
  ballSet: BallSet;
  variant: AssemblyVariant;
}

export function getChairModelByProductId(
  snapshot: Pick<CatalogSnapshot, "chairModels">,
  productId: string,
): ChairModel | undefined {
  return snapshot.chairModels.find((model) => model.productId === productId);
}

export function getCompatibleCovers(
  snapshot: Pick<CatalogSnapshot, "covers" | "compatibilities">,
  modelId: string,
  activeOnly = true,
): Cover[] {
  const compatibleIds = new Set(
    snapshot.compatibilities
      .filter((item) => item.modelId === modelId && item.componentType === "cover" && (!activeOnly || item.isActive))
      .map((item) => item.componentId),
  );

  return snapshot.covers
    .filter((cover) => compatibleIds.has(cover.id) && (!activeOnly || cover.isActive))
    .sort((left, right) => left.code.localeCompare(right.code, "pt-BR", { numeric: true }));
}

export function getCompatibleReducers(
  snapshot: Pick<CatalogSnapshot, "reducers" | "compatibilities">,
  modelId: string,
  activeOnly = true,
): Reducer[] {
  const compatibleIds = new Set(
    snapshot.compatibilities
      .filter((item) => item.modelId === modelId && item.componentType === "reducer" && (!activeOnly || item.isActive))
      .map((item) => item.componentId),
  );

  return snapshot.reducers
    .filter((reducer) => compatibleIds.has(reducer.id) && (!activeOnly || reducer.isActive))
    .sort((left, right) => left.code.localeCompare(right.code, "pt-BR", { numeric: true }));
}

export function getBallSetForModel(
  snapshot: Pick<CatalogSnapshot, "ballSets">,
  modelId: string,
): BallSet | undefined {
  return snapshot.ballSets.find((ballSet) => ballSet.modelId === modelId);
}

export function getAssemblyVariant(
  snapshot: Pick<CatalogSnapshot, "assemblyVariants">,
  modelId: string,
  coverId: string,
  reducerId: string | null,
): AssemblyVariant | undefined {
  return snapshot.assemblyVariants.find((variant) => (
    variant.modelId === modelId
    && variant.coverId === coverId
    && variant.reducerId === reducerId
    && variant.isActive
    && variant.publicationStatus === "published"
  ));
}

export function getProductConfiguration(
  snapshot: Pick<CatalogSnapshot, "chairModels" | "covers" | "reducers" | "ballSets" | "assemblyVariants">,
  variantId: string,
): ProductConfiguration | undefined {
  const variant = snapshot.assemblyVariants.find((item) => item.id === variantId);
  if (!variant) return undefined;

  const chairModel = snapshot.chairModels.find((item) => item.id === variant.modelId);
  const cover = snapshot.covers.find((item) => item.id === variant.coverId);
  const reducer = variant.reducerId
    ? snapshot.reducers.find((item) => item.id === variant.reducerId) ?? null
    : null;
  const ballSet = snapshot.ballSets.find((item) => item.id === variant.ballSetId);

  if (!chairModel || !cover || !ballSet) return undefined;
  return { chairModel, cover, reducer, ballSet, variant };
}

export function composeConfigurationDescription(
  modelDescription: string,
  coverDescription?: string,
  reducerDescription?: string,
): string {
  return [modelDescription, coverDescription, reducerDescription]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join(" ");
}

export function sumRentalRates(...rates: RentalRateTable[]): RentalRateTable {
  return rates.reduce<RentalRateTable>((total, rate) => ({
    daily: total.daily + rate.daily,
    weekly: total.weekly + rate.weekly,
    monthly: total.monthly + rate.monthly,
  }), { daily: 0, weekly: 0, monthly: 0 });
}

export function getConfigurationAvailableQuantity(configuration: {
  chairModel: ChairModel;
  cover: Cover;
  reducer: Reducer | null;
  ballSet: BallSet;
}): number {
  const quantities = [
    configuration.chairModel.availableQuantity,
    configuration.cover.availableQuantity,
    configuration.ballSet.availableQuantity,
  ];
  if (configuration.reducer) quantities.push(configuration.reducer.availableQuantity);
  return Math.max(0, Math.min(...quantities));
}

export function isAssemblyVariantComplete(variant: AssemblyVariant): boolean {
  return variant.images.some((image) => image.isVisible && Boolean(image.url.trim()));
}

export function componentIsPreferred(
  snapshot: Pick<CatalogSnapshot, "compatibilities">,
  modelId: string,
  componentType: "cover" | "reducer",
  componentId: string,
): boolean {
  return snapshot.compatibilities.some((item) => (
    item.modelId === modelId
    && item.componentType === componentType
    && item.componentId === componentId
    && item.isPreferred
    && item.isActive
  ));
}
