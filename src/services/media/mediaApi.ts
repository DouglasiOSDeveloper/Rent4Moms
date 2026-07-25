import type { MediaAngle, MediaAngleInput, MediaAsset, MediaOwnerType, MediaUploadInput } from "../../domain/media/types";
import { apiRequest } from "../api/apiClient";

export const mediaApi = {
  async listAngles(): Promise<MediaAngle[]> {
    return (await apiRequest<{ angles: MediaAngle[] }>("/admin/media/angles")).angles;
  },
  async createAngle(input: MediaAngleInput): Promise<MediaAngle> {
    return (await apiRequest<{ angle: MediaAngle }>("/admin/media/angles", { method: "POST", body: JSON.stringify(input) })).angle;
  },
  async updateAngle(id: string, input: MediaAngleInput): Promise<MediaAngle> {
    return (await apiRequest<{ angle: MediaAngle }>(`/admin/media/angles/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) })).angle;
  },
  async deleteAngle(id: string): Promise<void> {
    await apiRequest(`/admin/media/angles/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  async listAssets(ownerType: MediaOwnerType, ownerId: string): Promise<MediaAsset[]> {
    const query = new URLSearchParams({ ownerType, ownerId });
    return (await apiRequest<{ assets: MediaAsset[] }>(`/admin/media/assets?${query}`)).assets;
  },
  async upload(input: MediaUploadInput): Promise<MediaAsset> {
    const body = new FormData();
    body.set("ownerType", input.ownerType);
    body.set("ownerId", input.ownerId);
    if (input.angleId) body.set("angleId", input.angleId);
    body.set("alt", input.alt);
    body.set("isPublic", String(input.isPublic));
    body.set("isPrimary", String(input.isPrimary));
    body.set("sortOrder", String(input.sortOrder));
    body.set("file", input.file);
    return (await apiRequest<{ asset: MediaAsset }>("/admin/media/assets", { method: "POST", body })).asset;
  },
  async updateAsset(id: string, patch: Partial<Pick<MediaAsset, "alt" | "isPublic" | "isPrimary" | "sortOrder">>): Promise<MediaAsset> {
    return (await apiRequest<{ asset: MediaAsset }>(`/admin/media/assets/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) })).asset;
  },
  async deleteAsset(id: string): Promise<void> {
    await apiRequest(`/admin/media/assets/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
