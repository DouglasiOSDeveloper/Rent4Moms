import type { InventoryAllocation } from "../inventory/types";
import type { PersistedQuote } from "../../services/quotes/quotesApi";

export type PaymentStatus = "pending" | "received" | "partial" | "refunded";
export type PaymentMethod = "pix" | "card" | "transfer" | "cash" | "payment_link" | "other";
export interface ManualPayment {
  id: string;
  quoteId: string;
  status: PaymentStatus;
  amountCents: number;
  method: PaymentMethod;
  receivedAt: string | null;
  note: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
export type QuoteEventType = "note" | "payment" | "reservation" | "preparation" | "delivery" | "return" | "cancellation" | "hygiene" | "maintenance";
export interface QuoteOperationEvent {
  id: string;
  quoteId: string;
  type: QuoteEventType;
  title: string;
  note: string;
  metadata: Record<string, unknown>;
  actorUserId: string | null;
  createdAt: string;
}
export type AttachmentKind = "delivery" | "return" | "damage" | "hygiene" | "maintenance" | "document";
export interface OperationalAttachment {
  id: string;
  quoteId: string;
  unitId: string | null;
  kind: AttachmentKind;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  note: string;
  contentUrl: string;
  createdAt: string;
}
export type HygieneJobStatus = "waiting" | "in_progress" | "drying" | "inspection" | "approved" | "rejected";
export interface HygieneJob {
  id: string;
  quoteId: string | null;
  unitId: string;
  unitCode: string;
  unitLabel: string;
  status: HygieneJobStatus;
  responsible: string;
  notes: string;
  checklist: Record<string, boolean>;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export type MaintenanceJobStatus = "open" | "diagnosing" | "waiting_parts" | "repairing" | "testing" | "completed" | "unrepairable";
export interface MaintenanceJob {
  id: string;
  quoteId: string | null;
  unitId: string;
  unitCode: string;
  unitLabel: string;
  status: MaintenanceJobStatus;
  maintenanceType: "preventive" | "corrective";
  problem: string;
  diagnosis: string;
  resolution: string;
  responsible: string;
  costCents: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface OrderOperationDetail {
  quote: PersistedQuote;
  allocations: InventoryAllocation[];
  payment: ManualPayment | null;
  attachments: OperationalAttachment[];
  events: QuoteOperationEvent[];
  hygieneJobs: HygieneJob[];
  maintenanceJobs: MaintenanceJob[];
}
export interface DeliveryOperationRecord {
  quote: PersistedQuote;
  payment: ManualPayment | null;
  deliveryEvent: QuoteOperationEvent | null;
  returnEvent: QuoteOperationEvent | null;
}
