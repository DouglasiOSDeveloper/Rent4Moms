import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../api/apiClient";
import {
  adminReportExportUrl,
  listAdminCalendarEvents,
  listAdminClients,
  listAdminNotifications,
  listAdminReservations,
  listAdminUsers,
  loadAdminDashboard,
  loadAdminReport,
} from "./adminApi";

vi.mock("../api/apiClient", () => ({
  API_BASE_URL: "/api/v1",
  apiRequest: vi.fn(),
}));

const requestMock = vi.mocked(apiRequest);

describe("adminApi", () => {
  beforeEach(() => requestMock.mockReset());

  it("loads every administrative module from protected API endpoints", async () => {
    requestMock
      .mockResolvedValueOnce({ dashboard: { indicators: {} } })
      .mockResolvedValueOnce({ clients: [] })
      .mockResolvedValueOnce({ quotes: [] })
      .mockResolvedValueOnce({ events: [] })
      .mockResolvedValueOnce({ report: { totals: {} } })
      .mockResolvedValueOnce({ users: [] })
      .mockResolvedValueOnce({ notifications: [], count: 0, generatedAt: "2030-01-01T00:00:00.000Z" });

    await loadAdminDashboard();
    await listAdminClients();
    await listAdminReservations();
    await listAdminCalendarEvents();
    await loadAdminReport({ from: "2030-01-01", to: "2030-01-31", status: "Aprovado" });
    await listAdminUsers();
    await listAdminNotifications();

    expect(requestMock.mock.calls.map(([path]) => path)).toEqual([
      "/admin/dashboard",
      "/admin/clients",
      "/admin/reservations",
      "/admin/calendar",
      "/admin/reports?from=2030-01-01&to=2030-01-31&status=Aprovado",
      "/admin/users",
      "/admin/notifications",
    ]);
  });

  it("builds an authenticated CSV export URL without client-side report data", () => {
    expect(adminReportExportUrl({ status: "Em análise" })).toBe("/api/v1/admin/reports/export?status=Em+an%C3%A1lise");
  });
});
