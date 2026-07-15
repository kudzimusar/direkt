export const EVIDENCE_STORAGE = Symbol('EVIDENCE_STORAGE');

export interface CreatePrivateUploadInput {
  providerId: string;
  uploadSessionId: string;
  contentType: string;
  maxBytes: number;
}

export interface PrivateUploadGrant {
  objectKey: string;
  uploadUrl: string;
  expiresAt: Date;
  requiredHeaders: Record<string, string>;
}

export interface CompletePrivateUploadInput {
  objectKey: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
}

export interface PrivateReadGrant {
  accessUrl: string;
  expiresAt: Date;
  watermark: string;
}

export interface EvidenceStoragePort {
  createUploadGrant(input: CreatePrivateUploadInput): PrivateUploadGrant;
  confirmUpload(input: CompletePrivateUploadInput): void;
  createReadGrant(objectKey: string, actorIdentityId: string, purpose: string): PrivateReadGrant;
}