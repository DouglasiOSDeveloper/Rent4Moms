import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../api/apiClient";
import { mediaApi } from "./mediaApi";

vi.mock("../api/apiClient", async () => {
  const actual = await vi.importActual<typeof import("../api/apiClient")>("../api/apiClient");
  return { ...actual, apiRequest: vi.fn() };
});

const requestMock = vi.mocked(apiRequest);

describe("mediaApi Stage E", () => {
  beforeEach(() => requestMock.mockReset());

  it("uploads a variant image with the selected dynamic angle", async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "frontal.png", { type: "image/png" });
    requestMock.mockResolvedValue({ asset: { id: "asset-1", contentUrl: "/api/v1/media/assets/asset-1/content" } });

    await mediaApi.upload({
      ownerType: "assembly_variant",
      ownerId: "variant-1",
      angleId: "angle-frt",
      file,
      alt: "Vista frontal",
      isPublic: true,
      isPrimary: false,
      sortOrder: 0,
    });

    expect(requestMock).toHaveBeenCalledTimes(1);
    const [path, init] = requestMock.mock.calls[0]!;
    expect(path).toBe("/admin/media/assets");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeInstanceOf(FormData);
    const body = init?.body as FormData;
    expect(body.get("ownerType")).toBe("assembly_variant");
    expect(body.get("ownerId")).toBe("variant-1");
    expect(body.get("angleId")).toBe("angle-frt");
    expect(body.get("isPublic")).toBe("true");
  });

  it("updates visibility without replacing the file", async () => {
    requestMock.mockResolvedValue({ asset: { id: "asset-1", isPublic: false, contentUrl: "/api/v1/media/assets/asset-1/content" } });

    await mediaApi.updateAsset("asset-1", { isPublic: false });

    expect(requestMock).toHaveBeenCalledWith("/admin/media/assets/asset-1", {
      method: "PATCH",
      body: JSON.stringify({ isPublic: false }),
    });
  });
});
