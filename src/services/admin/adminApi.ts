import type {
  AdminCalendarEvent,
  AdminClientSummary,
  AdminDashboardSnapshot,
  AdminNotificationsResponse,
  AdminReportFilters,
  AdminReportSnapshot,
  AdminUser,
} from "../../domain/admin/types";
import type { PersistedQuote } from "../quotes/quotesApi";
import { API_BASE_URL, apiRequest } from "../api/apiClient";

function reportQuery(filters: AdminReportFilters): string {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function loadAdminDashboard(): Promise<AdminDashboardSnapshot> {
  return (await apiRequest<{ dashboard: AdminDashboardSnapshot }>("/admin/dashboard")).dashboard;
}

export async function listAdminClients(): Promise<AdminClientSummary[]> {
  return (await apiRequest<{ clients: AdminClientSummary[] }>("/admin/clients")).clients;
}

export async function listAdminReservations(): Promise<PersistedQuote[]> {
  return (await apiRequest<{ quotes: PersistedQuote[] }>("/admin/reservations")).quotes;
}

export async function listAdminCalendarEvents(): Promise<AdminCalendarEvent[]> {
  return (await apiRequest<{ events: AdminCalendarEvent[] }>("/admin/calendar")).events;
}

export async function loadAdminReport(filters: AdminReportFilters = {}): Promise<AdminReportSnapshot> {
  return (await apiRequest<{ report: AdminReportSnapshot }>(`/admin/reports${reportQuery(filters)}`)).report;
}

export function adminReportExportUrl(filters: AdminReportFilters = {}): string {
  return `${API_BASE_URL}/admin/reports/export${reportQuery(filters)}`;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  return (await apiRequest<{ users: AdminUser[] }>("/admin/users")).users;
}

export async function listAdminNotifications(): Promise<AdminNotificationsResponse> {
  return apiRequest<AdminNotificationsResponse>("/admin/notifications");
}
