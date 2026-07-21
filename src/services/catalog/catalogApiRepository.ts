import type { CatalogSnapshot } from "../../domain/catalog/types";
import { apiRequest } from "../api/apiClient";

export class CatalogApiRepository {
  async load(): Promise<CatalogSnapshot> {
    const response = await apiRequest<{ catalog: CatalogSnapshot }>("/catalog");
    return response.catalog;
  }

  async save(snapshot: CatalogSnapshot): Promise<CatalogSnapshot> {
    const response = await apiRequest<{ catalog: CatalogSnapshot }>("/admin/catalog", {
      method: "PUT",
      body: JSON.stringify(snapshot),
    });
    return response.catalog;
  }
}
