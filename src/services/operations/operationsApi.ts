import type {
  AttachmentKind,
  DeliveryOperationRecord,
  HygieneJob,
  HygieneJobStatus,
  MaintenanceJob,
  MaintenanceJobStatus,
  ManualPayment,
  OrderOperationDetail,
  OperationalAttachment,
  PaymentMethod,
  PaymentStatus,
  QuoteOperationEvent,
} from "../../domain/operations/types";
import { API_BASE_URL, apiRequest, resolveApiResourceUrl } from "../api/apiClient";

export function normalizeOrderOperationDetailImageUrls(
  detail: OrderOperationDetail,
  apiBaseUrl = API_BASE_URL,
): OrderOperationDetail {
  return {
    ...detail,
    quote: {
      ...detail.quote,
      payload: {
        ...detail.quote.payload,
        items: detail.quote.payload.items.map((item) => ({
          ...item,
          productSnapshot: {
            ...item.productSnapshot,
            photo: resolveApiResourceUrl(item.productSnapshot.photo, apiBaseUrl),
            ...(item.productSnapshot.assembly ? {
              assembly: {
                ...item.productSnapshot.assembly,
                selectedImage: resolveApiResourceUrl(item.productSnapshot.assembly.selectedImage, apiBaseUrl),
              },
            } : {}),
          },
        })),
      },
    },
    attachments: detail.attachments.map((attachment) => ({
      ...attachment,
      contentUrl: resolveApiResourceUrl(attachment.contentUrl, apiBaseUrl),
    })),
  };
}

export async function loadOrderOperation(quoteId: string): Promise<OrderOperationDetail> {
  return normalizeOrderOperationDetailImageUrls(await apiRequest<OrderOperationDetail>(`/admin/operations/orders/${quoteId}`));
}
export async function saveManualPayment(quoteId: string, input: {
  status: PaymentStatus; amountCents: number; method: PaymentMethod; receivedAt: string | null; note: string;
}): Promise<ManualPayment> {
  return (await apiRequest<{ payment: ManualPayment }>(`/admin/operations/orders/${quoteId}/payment`, { method: "PATCH", body: JSON.stringify(input) })).payment;
}
export async function addOrderNote(quoteId: string, note: string): Promise<QuoteOperationEvent> {
  return (await apiRequest<{ event: QuoteOperationEvent }>(`/admin/operations/orders/${quoteId}/notes`, { method: "POST", body: JSON.stringify({ note }) })).event;
}
export async function applyOrderLifecycle(quoteId: string, input: {
  action: "reserve" | "prepare" | "deliver" | "return" | "cancel";
  note?: string;
  responsible?: string;
  occurredAt?: string;
}): Promise<OrderOperationDetail> {
  return normalizeOrderOperationDetailImageUrls(await apiRequest<OrderOperationDetail>(`/admin/operations/orders/${quoteId}/lifecycle`, { method: "POST", body: JSON.stringify(input) }));
}
export async function uploadOperationalAttachment(quoteId: string, input: {
  file: File; kind: AttachmentKind; unitId?: string; note?: string;
}): Promise<OperationalAttachment> {
  const body = new FormData();
  body.append("file", input.file);
  body.append("kind", input.kind);
  if (input.unitId) body.append("unitId", input.unitId);
  if (input.note) body.append("note", input.note);
  const attachment = (await apiRequest<{ attachment: OperationalAttachment }>(`/admin/operations/orders/${quoteId}/attachments`, { method: "POST", body })).attachment;
  return { ...attachment, contentUrl: resolveApiResourceUrl(attachment.contentUrl) };
}
export async function deleteOperationalAttachment(id: string): Promise<void> {
  await apiRequest<void>(`/admin/operations/attachments/${id}`, { method: "DELETE" });
}
export async function listDeliveryOperations(): Promise<DeliveryOperationRecord[]> {
  return (await apiRequest<{ records: DeliveryOperationRecord[] }>("/admin/operations/deliveries")).records;
}
export async function listHygieneJobs(): Promise<HygieneJob[]> {
  return (await apiRequest<{ jobs: HygieneJob[] }>("/admin/operations/hygiene")).jobs;
}
export async function createHygieneJobs(input: { quoteId?: string | null; unitIds: string[]; responsible: string; notes?: string }): Promise<HygieneJob[]> {
  return (await apiRequest<{ jobs: HygieneJob[] }>("/admin/operations/hygiene", { method: "POST", body: JSON.stringify({ quoteId: input.quoteId ?? null, unitIds: input.unitIds, responsible: input.responsible, notes: input.notes ?? "" }) })).jobs;
}
export async function updateHygieneJob(id: string, input: { status?: HygieneJobStatus; responsible?: string; notes?: string; checklist?: Record<string, boolean> }): Promise<HygieneJob> {
  return (await apiRequest<{ job: HygieneJob }>(`/admin/operations/hygiene/${id}`, { method: "PATCH", body: JSON.stringify(input) })).job;
}
export async function listMaintenanceJobs(): Promise<MaintenanceJob[]> {
  return (await apiRequest<{ jobs: MaintenanceJob[] }>("/admin/operations/maintenance")).jobs;
}
export async function createMaintenanceJobs(input: { quoteId?: string | null; unitIds: string[]; maintenanceType: "preventive" | "corrective"; problem: string; responsible: string }): Promise<MaintenanceJob[]> {
  return (await apiRequest<{ jobs: MaintenanceJob[] }>("/admin/operations/maintenance", { method: "POST", body: JSON.stringify({ quoteId: input.quoteId ?? null, ...input }) })).jobs;
}
export async function updateMaintenanceJob(id: string, input: { status?: MaintenanceJobStatus; diagnosis?: string; resolution?: string; responsible?: string; costCents?: number }): Promise<MaintenanceJob> {
  return (await apiRequest<{ job: MaintenanceJob }>(`/admin/operations/maintenance/${id}`, { method: "PATCH", body: JSON.stringify(input) })).job;
}
