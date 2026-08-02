import type {
  AssemblyVariant,
  AssemblyVariantInput,
  BallSet,
  BallSetInput,
  CatalogComponentType,
  CatalogDeleteResolution,
  CatalogImpact,
  CatalogSnapshot,
  Category,
  CategoryInput,
  ChairModel,
  ChairModelInput,
  ConfigurableComponentInput,
  Cover,
  Product,
  ProductInput,
  Reducer,
} from "../../domain/catalog/types";
import { apiRequest } from "../api/apiClient";


type PublicChairModel = Omit<ChairModel, "availableQuantity"> & { isAvailable: boolean };
type PublicCover = Omit<Cover, "availableQuantity"> & { isAvailable: boolean };
type PublicReducer = Omit<Reducer, "availableQuantity"> & { isAvailable: boolean };
type PublicBallSet = Omit<BallSet, "availableQuantity"> & { isAvailable: boolean };

interface PublicCatalogSnapshot extends Omit<CatalogSnapshot, "chairModels" | "covers" | "reducers" | "ballSets"> {
  chairModels: PublicChairModel[];
  covers: PublicCover[];
  reducers: PublicReducer[];
  ballSets: PublicBallSet[];
}

function normalizePublicAvailability<T extends { isAvailable: boolean }>(item: T): Omit<T, "isAvailable"> & { availableQuantity: number } {
  const { isAvailable, ...catalogItem } = item;
  return { ...catalogItem, availableQuantity: isAvailable ? 1 : 0 };
}

function normalizePublicCatalog(catalog: PublicCatalogSnapshot): CatalogSnapshot {
  return {
    ...catalog,
    chairModels: catalog.chairModels.map(normalizePublicAvailability),
    covers: catalog.covers.map(normalizePublicAvailability),
    reducers: catalog.reducers.map(normalizePublicAvailability),
    ballSets: catalog.ballSets.map(normalizePublicAvailability),
  };
}

interface MutationResponse<T> { entity: T; catalog: CatalogSnapshot }
interface DeleteResponse { impact: CatalogImpact; catalog: CatalogSnapshot }

export class CatalogApiRepository {
  async load(admin = false): Promise<CatalogSnapshot> {
    if (admin) {
      const response = await apiRequest<{ catalog: CatalogSnapshot }>("/admin/catalog");
      return response.catalog;
    }
    const response = await apiRequest<{ catalog: PublicCatalogSnapshot }>("/catalog");
    return normalizePublicCatalog(response.catalog);
  }

  async createCategory(input: CategoryInput): Promise<MutationResponse<Category>> {
    return apiRequest<MutationResponse<Category>>("/admin/catalog/categories", { method: "POST", body: JSON.stringify({ ...input, sortOrder: input.sortOrder ?? 0 }) });
  }

  async updateCategory(id: string, input: CategoryInput): Promise<MutationResponse<Category>> {
    return apiRequest<MutationResponse<Category>>(`/admin/catalog/categories/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ ...input, sortOrder: input.sortOrder ?? 0 }) });
  }

  async createProduct(input: ProductInput): Promise<MutationResponse<Product>> {
    return apiRequest<MutationResponse<Product>>("/admin/catalog/products", { method: "POST", body: JSON.stringify(input) });
  }

  async updateProduct(id: string, input: ProductInput): Promise<MutationResponse<Product>> {
    return apiRequest<MutationResponse<Product>>(`/admin/catalog/products/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
  }

  async createChairModel(input: ChairModelInput): Promise<MutationResponse<ChairModel>> {
    return apiRequest<MutationResponse<ChairModel>>("/admin/catalog/chair-models", { method: "POST", body: JSON.stringify(input) });
  }

  async updateChairModel(id: string, input: ChairModelInput): Promise<MutationResponse<ChairModel>> {
    return apiRequest<MutationResponse<ChairModel>>(`/admin/catalog/chair-models/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
  }

  async createBallSet(input: BallSetInput): Promise<MutationResponse<BallSet>> {
    return apiRequest<MutationResponse<BallSet>>("/admin/catalog/ball-sets", { method: "POST", body: JSON.stringify(input) });
  }

  async updateBallSet(id: string, input: BallSetInput): Promise<MutationResponse<BallSet>> {
    return apiRequest<MutationResponse<BallSet>>(`/admin/catalog/ball-sets/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
  }

  async saveComponent(
    type: CatalogComponentType,
    input: ConfigurableComponentInput,
    componentId?: string,
  ): Promise<{ entity: Cover | Reducer; catalog: CatalogSnapshot }> {
    const path = type === "cover" ? "covers" : "reducers";
    const payload = {
      code: input.code,
      name: input.name,
      description: input.description,
      priceAdjustment: input.priceAdjustment,
      isActive: input.isActive,
    };
    const response = componentId
      ? await apiRequest<MutationResponse<Cover | Reducer>>(`/admin/catalog/${path}/${encodeURIComponent(componentId)}`, { method: "PATCH", body: JSON.stringify(payload) })
      : await apiRequest<MutationResponse<Cover | Reducer>>(`/admin/catalog/${path}`, { method: "POST", body: JSON.stringify(payload) });
    const savedId = response.entity.id;
    const compatibilityResponse = await apiRequest<{ catalog: CatalogSnapshot }>(
      `/admin/catalog/components/${type}/${encodeURIComponent(savedId)}/compatibilities`,
      {
        method: "PUT",
        body: JSON.stringify({ compatibleModelIds: input.compatibleModelIds, preferredModelIds: input.preferredModelIds }),
      },
    );
    return { entity: response.entity, catalog: compatibilityResponse.catalog };
  }

  async saveAssemblyVariant(input: AssemblyVariantInput, variantId?: string): Promise<MutationResponse<AssemblyVariant>> {
    return variantId
      ? apiRequest<MutationResponse<AssemblyVariant>>(`/admin/catalog/assembly-variants/${encodeURIComponent(variantId)}`, { method: "PATCH", body: JSON.stringify(input) })
      : apiRequest<MutationResponse<AssemblyVariant>>("/admin/catalog/assembly-variants", { method: "POST", body: JSON.stringify(input) });
  }

  async getImpact(entityType: string, entityId: string): Promise<CatalogImpact> {
    const response = await apiRequest<{ impact: CatalogImpact }>(`/admin/catalog/impact/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`);
    return response.impact;
  }

  async deleteEntity(
    collection: string,
    entityId: string,
    resolution: CatalogDeleteResolution = "block",
  ): Promise<DeleteResponse> {
    return apiRequest<DeleteResponse>(`/admin/catalog/${collection}/${encodeURIComponent(entityId)}?resolution=${resolution}`, { method: "DELETE" });
  }
}
