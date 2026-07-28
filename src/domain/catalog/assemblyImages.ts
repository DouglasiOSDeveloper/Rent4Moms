import { API_BASE_URL, resolveApiResourceUrl } from "../../services/api/apiClient";
import type {
  AssemblyAngle,
  AssemblyImage,
  CatalogMediaImage,
  CatalogSnapshot,
} from "./types";

export function resolvePublicImageUrl(value: string, apiBaseUrl = API_BASE_URL): string {
  return resolveApiResourceUrl(value, apiBaseUrl);
}

function normalizeCatalogImages(images: CatalogMediaImage[] | undefined, apiBaseUrl: string): CatalogMediaImage[] | undefined {
  return images?.map((image) => ({ ...image, url: resolvePublicImageUrl(image.url, apiBaseUrl) }));
}

export function normalizeCatalogSnapshotImageUrls(snapshot: CatalogSnapshot, apiBaseUrl = API_BASE_URL): CatalogSnapshot {
  return {
    ...snapshot,
    products: snapshot.products.map((product) => ({
      ...product,
      photo: resolvePublicImageUrl(product.photo, apiBaseUrl),
      images: normalizeCatalogImages(product.images, apiBaseUrl),
    })),
    chairModels: snapshot.chairModels.map((model) => ({
      ...model,
      defaultImage: resolvePublicImageUrl(model.defaultImage, apiBaseUrl),
      images: normalizeCatalogImages(model.images, apiBaseUrl),
    })),
    covers: snapshot.covers.map((cover) => ({
      ...cover,
      photo: resolvePublicImageUrl(cover.photo, apiBaseUrl),
    })),
    reducers: snapshot.reducers.map((reducer) => ({
      ...reducer,
      photo: resolvePublicImageUrl(reducer.photo, apiBaseUrl),
    })),
    ballSets: snapshot.ballSets.map((ballSet) => ({
      ...ballSet,
      photo: resolvePublicImageUrl(ballSet.photo, apiBaseUrl),
    })),
    assemblyVariants: snapshot.assemblyVariants.map((variant) => ({
      ...variant,
      images: variant.images.map((image) => ({
        ...image,
        url: resolvePublicImageUrl(image.url, apiBaseUrl),
      })),
    })),
  };
}

export function resolveAssemblyImageUrl(image: AssemblyImage): string {
  return image.isVisible ? resolvePublicImageUrl(image.url) : "";
}

export function getAngleLabel(angle: AssemblyAngle, fallback?: string): string {
  return fallback?.trim() || angle;
}
