import React, { useState } from "react";

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;
  const accessibleLabel = alt?.trim() || "Imagem indisponível";

  if (didError) {
    return (
      <div
        role="img"
        aria-label={accessibleLabel}
        className={`inline-flex items-center justify-center bg-muted text-muted-foreground ${className ?? ""}`}
        style={style}
        data-original-url={typeof src === "string" ? src : undefined}
      >
        <span className="px-3 py-2 text-center text-xs">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  );
}
