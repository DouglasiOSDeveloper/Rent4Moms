import type {
  AssemblyVariant,
  BallSet,
  CatalogComponentType,
  CatalogSnapshot,
  ChairModel,
  ComponentCompatibility,
  Cover,
  Product,
  Reducer,
} from "../../domain/catalog/types";

export type CatalogAction =
  | { type: "category.created"; category: CatalogSnapshot["categories"][number] }
  | { type: "category.updated"; category: CatalogSnapshot["categories"][number] }
  | { type: "category.deleted"; categoryId: string }
  | { type: "product.categories.updated"; productId: string; categoryIds: string[] }
  | { type: "chair-model.updated"; chairModel: ChairModel }
  | { type: "ball-set.updated"; ballSet: BallSet }
  | { type: "component.saved"; componentType: CatalogComponentType; component: Cover | Reducer; compatibilities: ComponentCompatibility[] }
  | { type: "component.deleted"; componentType: CatalogComponentType; componentId: string }
  | { type: "variant.saved"; variant: AssemblyVariant }
  | { type: "variant.deleted"; variantId: string }
  | { type: "catalog.reset"; snapshot: CatalogSnapshot };

function touch(snapshot: CatalogSnapshot): CatalogSnapshot {
  return { ...snapshot, updatedAt: new Date().toISOString() };
}

export function catalogReducer(state: CatalogSnapshot, action: CatalogAction): CatalogSnapshot {
  switch (action.type) {
    case "category.created":
      return touch({ ...state, categories: [...state.categories, action.category] });
    case "category.updated":
      return touch({
        ...state,
        categories: state.categories.map((category) => category.id === action.category.id ? action.category : category),
      });
    case "category.deleted":
      return touch({
        ...state,
        categories: state.categories.filter((category) => category.id !== action.categoryId),
        products: state.products.map((product): Product => ({
          ...product,
          categoryIds: product.categoryIds.filter((categoryId) => categoryId !== action.categoryId),
        })),
      });
    case "product.categories.updated":
      return touch({
        ...state,
        products: state.products.map((product) => product.id === action.productId
          ? { ...product, categoryIds: [...new Set(action.categoryIds)] }
          : product),
      });
    case "chair-model.updated":
      return touch({
        ...state,
        chairModels: state.chairModels.map((model) => model.id === action.chairModel.id ? action.chairModel : model),
      });
    case "ball-set.updated":
      return touch({
        ...state,
        ballSets: state.ballSets.map((ballSet) => ballSet.id === action.ballSet.id ? action.ballSet : ballSet),
      });
    case "component.saved": {
      const list = action.componentType === "cover" ? state.covers : state.reducers;
      const exists = list.some((component) => component.id === action.component.id);
      const nextList = exists
        ? list.map((component) => component.id === action.component.id ? action.component : component)
        : [...list, action.component];
      const compatibilities = [
        ...state.compatibilities.filter((compatibility) => !(
          compatibility.componentType === action.componentType
          && compatibility.componentId === action.component.id
        )),
        ...action.compatibilities,
      ];

      return touch(action.componentType === "cover"
        ? { ...state, covers: nextList as Cover[], compatibilities }
        : { ...state, reducers: nextList as Reducer[], compatibilities });
    }
    case "component.deleted":
      return touch({
        ...state,
        covers: action.componentType === "cover"
          ? state.covers.filter((component) => component.id !== action.componentId)
          : state.covers,
        reducers: action.componentType === "reducer"
          ? state.reducers.filter((component) => component.id !== action.componentId)
          : state.reducers,
        compatibilities: state.compatibilities.filter((compatibility) => !(
          compatibility.componentType === action.componentType
          && compatibility.componentId === action.componentId
        )),
      });
    case "variant.saved": {
      const exists = state.assemblyVariants.some((variant) => variant.id === action.variant.id);
      return touch({
        ...state,
        assemblyVariants: exists
          ? state.assemblyVariants.map((variant) => variant.id === action.variant.id ? action.variant : variant)
          : [...state.assemblyVariants, action.variant],
      });
    }
    case "variant.deleted":
      return touch({
        ...state,
        assemblyVariants: state.assemblyVariants.filter((variant) => variant.id !== action.variantId),
      });
    case "catalog.reset":
      return action.snapshot;
    default:
      return state;
  }
}
