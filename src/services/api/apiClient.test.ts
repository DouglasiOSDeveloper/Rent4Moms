import { describe, expect, it } from "vitest";
import { resolveApiResourceUrl } from "./apiClient";

describe("resolveApiResourceUrl", () => {
  it("points API media paths to the production API origin", () => {
    expect(resolveApiResourceUrl(
      "/api/v1/media/assets/asset-1/content",
      "https://api.rent4moms.com.br/api/v1",
    )).toBe("https://api.rent4moms.com.br/api/v1/media/assets/asset-1/content");
  });

  it("keeps relative API paths for the local Vite proxy", () => {
    expect(resolveApiResourceUrl(
      "/api/v1/media/assets/asset-1/content",
      "/api/v1",
    )).toBe("/api/v1/media/assets/asset-1/content");
  });

  it("keeps supported absolute and embedded image URLs", () => {
    expect(resolveApiResourceUrl("https://cdn.example.com/image.png")).toBe("https://cdn.example.com/image.png");
    expect(resolveApiResourceUrl("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
    expect(resolveApiResourceUrl("javascript:alert(1)")).toBe("");
  });
});
