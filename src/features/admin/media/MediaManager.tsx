import React, { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { Btn, cn } from "../../../components/prototype/PrototypeUI";
import type { MediaAngle, MediaAsset, MediaOwnerType } from "../../../domain/media/types";
import { mediaApi } from "../../../services/media/mediaApi";

interface MediaManagerProps {
  ownerType: MediaOwnerType;
  ownerId: string;
  angles?: MediaAngle[];
  onChanged?: () => Promise<void> | void;
  compact?: boolean;
}

export function MediaManager({ ownerType, ownerId, angles = [], onChanged, compact = false }: MediaManagerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [angleId, setAngleId] = useState("");
  const [alt, setAlt] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isPrimary, setIsPrimary] = useState(ownerType !== "assembly_variant");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const requiresAngle = ownerType === "assembly_variant";
  const activeAngles = useMemo(() => angles.filter((item) => item.isActive), [angles]);

  const reload = async () => {
    try { setAssets(await mediaApi.listAssets(ownerType, ownerId)); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar as imagens."); }
  };

  useEffect(() => { void reload(); }, [ownerType, ownerId]);

  const upload = async () => {
    if (!file) { setError("Selecione uma imagem."); return; }
    if (requiresAngle && !angleId) { setError("Selecione a angulação."); return; }
    setBusy(true); setError("");
    try {
      await mediaApi.upload({ ownerType, ownerId, angleId: requiresAngle ? angleId : null, file, alt, isPublic, isPrimary, sortOrder: assets.length });
      setFile(null); setAlt(""); setAngleId("");
      await reload(); await onChanged?.();
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "Não foi possível enviar a imagem."); }
    finally { setBusy(false); }
  };

  const patch = async (asset: MediaAsset, values: Partial<Pick<MediaAsset, "isPublic" | "isPrimary">>) => {
    setBusy(true); setError("");
    try { await mediaApi.updateAsset(asset.id, values); await reload(); await onChanged?.(); }
    catch (updateError) { setError(updateError instanceof Error ? updateError.message : "Não foi possível alterar a imagem."); }
    finally { setBusy(false); }
  };

  const remove = async (asset: MediaAsset) => {
    if (!window.confirm(`Excluir a imagem “${asset.originalName}”?`)) return;
    setBusy(true); setError("");
    try { await mediaApi.deleteAsset(asset.id); await reload(); await onChanged?.(); }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir a imagem."); }
    finally { setBusy(false); }
  };

  return <section className={cn("rounded-xl border border-border bg-secondary/40", compact ? "p-3" : "p-4")}>
    <div className="flex items-center justify-between gap-3 mb-3"><div><p className="text-sm font-semibold">Fotos</p><p className="text-xs text-muted-foreground">JPG, PNG ou WebP. A visibilidade controla o que aparece no site.</p></div><span className="text-xs text-muted-foreground">{assets.length} arquivo(s)</span></div>
    <div className={cn("grid gap-3", requiresAngle ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
      <label className="text-xs font-medium">Arquivo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-1 block w-full text-xs" /></label>
      {requiresAngle && <label className="text-xs font-medium">Angulação<select value={angleId} onChange={(event) => setAngleId(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-2"><option value="">Selecione</option>{activeAngles.map((angle) => <option key={angle.id} value={angle.id}>{angle.code} · {angle.name}</option>)}</select></label>}
      <label className="text-xs font-medium">Texto alternativo<input value={alt} onChange={(event) => setAlt(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-2" /></label>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs"><label className="flex items-center gap-2"><input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />Visível no site</label>{!requiresAngle && <label className="flex items-center gap-2"><input type="checkbox" checked={isPrimary} onChange={(event) => setIsPrimary(event.target.checked)} />Imagem principal</label>}<Btn variant="primary" size="sm" disabled={busy || !file || (requiresAngle && !angleId)} onClick={() => void upload()}>{busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}Enviar foto</Btn></div>
    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    {assets.length > 0 && <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{assets.map((asset) => { const angle = angles.find((item) => item.id === asset.angleId); return <article key={asset.id} className="rounded-xl border border-border bg-white overflow-hidden"><img src={asset.contentUrl} alt={asset.alt || asset.originalName} className="w-full h-28 object-cover bg-secondary" /><div className="p-3"><p className="text-xs font-medium truncate">{angle ? `${angle.code} · ${angle.name}` : asset.originalName}</p><p className="text-[11px] text-muted-foreground truncate">{asset.alt || "Sem texto alternativo"}</p><div className="mt-2 flex justify-end gap-1"><button type="button" title={asset.isPublic ? "Ocultar" : "Publicar"} onClick={() => void patch(asset, { isPublic: !asset.isPublic })} className="p-1.5 rounded hover:bg-secondary">{asset.isPublic ? <Eye size={14} /> : <EyeOff size={14} />}</button>{!requiresAngle && <button type="button" title="Definir como principal" disabled={asset.isPrimary} onClick={() => void patch(asset, { isPrimary: true })} className={cn("p-1.5 rounded hover:bg-secondary", asset.isPrimary && "text-amber-500")}><Star size={14} fill={asset.isPrimary ? "currentColor" : "none"} /></button>}<button type="button" title="Excluir" onClick={() => void remove(asset)} className="p-1.5 rounded text-destructive hover:bg-destructive/10"><Trash2 size={14} /></button></div></div></article>; })}</div>}
  </section>;
}
