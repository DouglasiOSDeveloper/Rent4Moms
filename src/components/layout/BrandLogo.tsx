import React from "react";

const brandLogoUrl = `${import.meta.env.BASE_URL}brand/rent4moms-logo.png`;

export function BrandLogo({ brandName, className = "" }: { brandName: string; className?: string }) {
  return (
    <img
      src={brandLogoUrl}
      alt={`Logo ${brandName}`}
      className={`block object-contain ${className}`}
    />
  );
}
