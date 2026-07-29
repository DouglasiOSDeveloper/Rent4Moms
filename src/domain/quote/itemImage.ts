import { resolveAssemblyImageUrl, resolvePublicImageUrl } from "../catalog/assemblyImages";
import type { AssemblyVariant, Product } from "../catalog/types";
import type { QuoteItem } from "./types";

interface QuoteItemImageCatalog {
  products: Product[];
  assemblyVariants: AssemblyVariant[];
}

function publicSnapshotUrl(value: string | null | undefined): string {
  const normalized = value?.trim() ?? "";
  if (!normalized || /\/api\/v1\/admin\/media\/assets\//i.test(normalized)) return "";
  return resolvePublicImageUrl(normalized);
}

export function resolveQuoteItemDisplayImage(
  item: QuoteItem,
  catalog: QuoteItemImageCatalog,
): string {
  const assembly = item.productSnapshot.assembly;
  const snapshotImage = publicSnapshotUrl(assembly?.selectedImage)
    || publicSnapshotUrl(item.productSnapshot.photo);
  if (snapshotImage) return snapshotImage;

  if (assembly) {
    const variant = catalog.assemblyVariants.find((candidate) => candidate.id === assembly.variantId);
    const image = variant?.images.find((candidate) => (
      candidate.angle === assembly.selectedAngle && candidate.isVisible
    )) ?? variant?.images.find((candidate) => candidate.isVisible);
    const variantImage = image ? resolveAssemblyImageUrl(image) : "";
    if (variantImage) return variantImage;
  }

  const product = catalog.products.find((candidate) => candidate.id === item.productId);
  return publicSnapshotUrl(product?.photo);
}
