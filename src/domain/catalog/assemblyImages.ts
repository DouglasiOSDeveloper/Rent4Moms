import type { AssemblyAngle, AssemblyImage } from "./types";

export function resolvePublicImageUrl(value: string): string {
  const normalized = value.trim();
  return /^(https?:|data:|blob:|\/)/.test(normalized) ? normalized : "";
}

export function resolveAssemblyImageUrl(image: AssemblyImage): string {
  return image.isVisible ? resolvePublicImageUrl(image.url) : "";
}

export function getAngleLabel(angle: AssemblyAngle, fallback?: string): string {
  return fallback?.trim() || angle;
}
