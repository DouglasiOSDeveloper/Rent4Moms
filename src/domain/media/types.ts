export type MediaOwnerType = "product" | "chair_model" | "cover" | "reducer" | "ball_set" | "assembly_variant";

export interface MediaAngle {
  id: string;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  ownerType: MediaOwnerType;
  ownerId: string;
  angleId: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  alt: string;
  isPublic: boolean;
  isPrimary: boolean;
  sortOrder: number;
  contentUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAngleInput {
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MediaUploadInput {
  ownerType: MediaOwnerType;
  ownerId: string;
  angleId?: string | null;
  file: File;
  alt: string;
  isPublic: boolean;
  isPrimary: boolean;
  sortOrder: number;
}
