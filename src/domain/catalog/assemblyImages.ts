import type { AssemblyAngle, AssemblyImage } from "./types";

const ANGLE_LABELS: Record<AssemblyAngle, string> = {
  FRT: "Frontal",
  DIR: "Lateral direita",
  ESQ: "Lateral esquerda",
  SUP: "Superior",
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function chairPath(angle: AssemblyAngle): string {
  if (angle === "SUP") {
    return '<ellipse cx="320" cy="190" rx="126" ry="80" fill="#f7eee9" stroke="#cc6a4b" stroke-width="8"/><ellipse cx="320" cy="190" rx="82" ry="48" fill="#fffaf7" stroke="#6f4a3d" stroke-width="5"/><circle cx="320" cy="190" r="13" fill="#cc6a4b"/>';
  }
  if (angle === "DIR") {
    return '<path d="M225 250 C235 150 300 112 390 140 L420 210 C370 245 315 270 225 250Z" fill="#f7eee9" stroke="#cc6a4b" stroke-width="8"/><path d="M245 250 L210 325 M385 230 L420 325" stroke="#6f4a3d" stroke-width="12" stroke-linecap="round"/><circle cx="250" cy="325" r="18" fill="#6f4a3d"/><circle cx="420" cy="325" r="18" fill="#6f4a3d"/>';
  }
  if (angle === "ESQ") {
    return '<path d="M415 250 C405 150 340 112 250 140 L220 210 C270 245 325 270 415 250Z" fill="#f7eee9" stroke="#cc6a4b" stroke-width="8"/><path d="M395 250 L430 325 M255 230 L220 325" stroke="#6f4a3d" stroke-width="12" stroke-linecap="round"/><circle cx="390" cy="325" r="18" fill="#6f4a3d"/><circle cx="220" cy="325" r="18" fill="#6f4a3d"/>';
  }
  return '<path d="M210 235 Q320 105 430 235 L400 285 Q320 330 240 285Z" fill="#f7eee9" stroke="#cc6a4b" stroke-width="8"/><path d="M255 282 L220 335 M385 282 L420 335" stroke="#6f4a3d" stroke-width="12" stroke-linecap="round"/><circle cx="220" cy="335" r="18" fill="#6f4a3d"/><circle cx="420" cy="335" r="18" fill="#6f4a3d"/>';
}

export function resolveAssemblyImageUrl(image: AssemblyImage): string {
  if (!image.isPlaceholder && /^(https?:|data:|blob:|\/)/.test(image.assetKey)) return image.assetKey;

  const title = escapeXml(image.assetKey.replace(/_(FRT|DIR|ESQ|SUP)$/i, ""));
  const angleLabel = ANGLE_LABELS[image.angle];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 450" role="img" aria-label="${escapeXml(image.alt)}">
      <rect width="640" height="450" rx="28" fill="#f5f0eb"/>
      <circle cx="86" cy="78" r="34" fill="#cc6a4b"/>
      <text x="86" y="84" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#ffffff">R4</text>
      ${chairPath(image.angle)}
      <text x="320" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#3e2a22">${title}</text>
      <text x="320" y="412" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="#7e6a61">${angleLabel} · imagem provisória</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getAngleLabel(angle: AssemblyAngle): string {
  return ANGLE_LABELS[angle];
}
