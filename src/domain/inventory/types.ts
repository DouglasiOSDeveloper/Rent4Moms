export type InventoryItemType = "chair_model" | "cover" | "reducer" | "ball_set";
export type InventoryUnitStatus = "available" | "held" | "reserved" | "preparing" | "rented" | "returned" | "inspection" | "washing" | "maintenance" | "unavailable" | "retired";
export type InventoryAllocationStatus = "active" | "released" | "expired";
export type InventoryComponentRole = "chair" | "cover" | "reducer" | "ball_set";
export type QuoteInventoryAction = "reserve" | "prepare" | "rent" | "return" | "release";
export interface InventoryUnit { id: string; code: string; itemType: InventoryItemType; itemId: string; label: string; status: InventoryUnitStatus; condition: string; location: string; notes: string; createdAt: string; updatedAt: string }
export interface InventoryUnitView extends InventoryUnit { catalogReferenceStatus: "active" | "inactive" | "missing"; catalogItemLabel: string | null }
export interface InventoryAllocation { id: string; quoteId: string; quoteItemIndex: number; componentRole: InventoryComponentRole; unitId: string; unitCode: string; itemType: InventoryItemType; itemId: string; status: InventoryAllocationStatus; expiresAt: string | null; createdAt: string; releasedAt: string | null; releaseReason: string | null }
export interface StockMovement { id: string; unitId: string; unitCode: string; quoteId: string | null; fromStatus: InventoryUnitStatus | null; toStatus: InventoryUnitStatus; reason: string; actorUserId: string | null; metadata: Record<string, unknown>; createdAt: string }
export interface InventoryAvailabilityEntry { itemType: InventoryItemType; itemId: string; availableQuantity: number; totalQuantity: number }
export interface InventorySummary { total: number; byStatus: Partial<Record<InventoryUnitStatus, number>>; byType: Partial<Record<InventoryItemType, number>>; activeAllocations: number; expiringSoon: number }
export interface InventoryOverview { summary: InventorySummary; units: InventoryUnitView[]; allocations: InventoryAllocation[]; movements: StockMovement[]; availability: InventoryAvailabilityEntry[] }
export interface InventoryUnitInput { code: string; itemType: InventoryItemType; itemId: string; label: string; status: InventoryUnitStatus; condition: string; location: string; notes: string }
