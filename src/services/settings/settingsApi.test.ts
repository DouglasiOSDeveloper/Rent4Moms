import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../api/apiClient";
import { loadRemoteDeliverySettings } from "./settingsApi";

vi.mock("../api/apiClient", () => ({ apiRequest: vi.fn() }));
const requestMock = vi.mocked(apiRequest);

describe("settingsApi", () => {
  beforeEach(() => requestMock.mockReset());

  it("uses the public route for delivery windows and the protected route for freight parameters", async () => {
    requestMock.mockResolvedValue({ settings: null });

    await loadRemoteDeliverySettings(false);
    await loadRemoteDeliverySettings(true);

    expect(requestMock.mock.calls[0]?.[0]).toBe("/settings/delivery");
    expect(requestMock.mock.calls[1]?.[0]).toBe("/admin/settings/delivery");
  });
});
