import type { InventoryAllocation, InventoryOverview, InventoryUnit, InventoryUnitInput, QuoteInventoryAction } from "../../domain/inventory/types";
import { apiRequest } from "../api/apiClient";
import type { PersistedQuote } from "../quotes/quotesApi";
export async function loadInventoryOverview(): Promise<InventoryOverview> { return apiRequest<InventoryOverview>("/admin/inventory/overview"); }
export async function createInventoryUnit(input: InventoryUnitInput): Promise<InventoryUnit> { return (await apiRequest<{ unit: InventoryUnit }>("/admin/inventory/units", { method: "POST", body: JSON.stringify(input) })).unit; }
export async function updateInventoryUnit(unitId: string, patch: Partial<Omit<InventoryUnitInput, "itemType" | "itemId">>): Promise<InventoryUnit> { return (await apiRequest<{ unit: InventoryUnit }>(`/admin/inventory/units/${unitId}`, { method: "PATCH", body: JSON.stringify(patch) })).unit; }
export async function retireInventoryUnit(unitId: string): Promise<void> { await apiRequest<void>(`/admin/inventory/units/${unitId}`, { method: "DELETE" }); }
export async function loadQuoteInventory(quoteId: string): Promise<{ quote: PersistedQuote; allocations: InventoryAllocation[] }> { return apiRequest(`/admin/quotes/${quoteId}/inventory`); }
export async function applyQuoteInventoryAction(quoteId: string, action: QuoteInventoryAction, reason?: string): Promise<{ quote: PersistedQuote; allocations: InventoryAllocation[] }> { return apiRequest(`/admin/quotes/${quoteId}/inventory-action`, { method: "POST", body: JSON.stringify({ action, reason }) }); }
export async function expireInventoryHolds(): Promise<number> { return (await apiRequest<{ expiredAllocations: number }>("/admin/inventory/expire", { method: "POST" })).expiredAllocations; }
