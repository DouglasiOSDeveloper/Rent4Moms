import type { AuthUser } from "../auth/types";
import type { PersistedQuote } from "../../services/quotes/quotesApi";

export type AdminNotificationTarget =
  | "quotes"
  | "reservations"
  | "inventory"
  | "delivery"
  | "hygiene"
  | "maintenance"
  | "users";

export interface AdminDashboardSnapshot {
  generatedAt: string;
  indicators: {
    quotesTotal: number;
    quotesInAnalysis: number;
    activeRentals: number;
    inventoryTotal: number;
    inventoryAvailable: number;
    activeAllocations: number;
    deliveriesPending: number;
    hygienePending: number;
    maintenancePending: number;
    totalRequestedCents: number;
  };
  recentQuotes: PersistedQuote[];
}

export interface AdminClientSummary {
  key: string;
  userId: string | null;
  name: string;
  email: string;
  cpfDigits: string;
  phone: string;
  hasAccount: boolean;
  ordersCount: number;
  totalRequestedCents: number;
  lastOrderAt: string | null;
  createdAt: string | null;
}

export interface AdminCalendarEvent {
  id: string;
  quoteId: string;
  quoteCode: string;
  customerName: string;
  date: string;
  type: "rental_start" | "rental_end";
  label: string;
  status: string;
}

export interface AdminReportFilters {
  from?: string;
  to?: string;
  status?: string;
}

export interface AdminReportSnapshot {
  generatedAt: string;
  filters: {
    from: string | null;
    to: string | null;
    status: string | null;
  };
  totals: {
    quotes: number;
    requestedCents: number;
    customers: number;
  };
  byStatus: Array<{ status: string; count: number; totalCents: number }>;
  byMonth: Array<{ month: string; count: number; totalCents: number }>;
  byProduct: Array<{ productId: string; name: string; quantity: number }>;
}

export interface AdminNotification {
  id: string;
  target: AdminNotificationTarget;
  kind: "quote" | "delivery" | "inventory" | "hygiene" | "maintenance";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  occurredAt: string;
}

export interface AdminNotificationsResponse {
  notifications: AdminNotification[];
  count: number;
  generatedAt: string;
}

export type AdminUser = AuthUser;
