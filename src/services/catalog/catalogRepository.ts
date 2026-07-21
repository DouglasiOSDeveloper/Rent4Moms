import type { CatalogSnapshot } from "../../domain/catalog/types";

export interface CatalogRepository {
  load(): CatalogSnapshot | null;
  save(snapshot: CatalogSnapshot): void;
  clear(): void;
}
