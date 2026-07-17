import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  CompletePrivateUploadInput,
  CreatePrivateUploadInput,
  EvidenceStoragePort,
  PrivateReadGrant,
  PrivateUploadGrant,
} from './evidence-storage.port';

interface SyntheticObjectRecord {
  contentType: string;
  maxBytes: number;
  expiresAt: Date;
  confirmed: boolean;
}

@Injectable()
export class SyntheticPrivateStorageAdapter implements EvidenceStoragePort {
  private readonly objects = new Map<string, SyntheticObjectRecord>();

  async createUploadGrant(input: CreatePrivateUploadInput): Promise<PrivateUploadGrant> {
    const objectKey = `private/${input.providerId}/${input.uploadSessionId}/${randomUUID()}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    this.objects.set(objectKey, {
      contentType: input.contentType,
      maxBytes: input.maxBytes,
      expiresAt,
      confirmed: false,
    });

    return {
      objectKey,
      uploadUrl: `https://storage.invalid/private-upload/${input.uploadSessionId}?token=${randomUUID()}`,
      expiresAt,
      requiredHeaders: {
        'content-type': input.contentType,
        'x-direkt-private-upload': 'synthetic',
      },
      synthetic: true,
    };
  }

  async confirmUpload(input: CompletePrivateUploadInput): Promise<void> {
    const record = this.objects.get(input.objectKey);
    if (!record) {
      throw new NotFoundException('Synthetic private upload object was not found.');
    }
    if (record.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Synthetic private upload grant has expired.');
    }
    if (record.contentType !== input.contentType) {
      throw new BadRequestException('Uploaded content type does not match the authorized session.');
    }
    if (input.sizeBytes > record.maxBytes) {
      throw new BadRequestException('Uploaded object exceeds the authorized size.');
    }
    if (!/^[0-9a-f]{64}$/.test(input.sha256)) {
      throw new BadRequestException('Uploaded object checksum is invalid.');
    }
    record.confirmed = true;
  }

  async createReadGrant(
    objectKey: string,
    actorIdentityId: string,
    purpose: string,
    notAfter?: Date,
  ): Promise<PrivateReadGrant> {
    const record = this.objects.get(objectKey);
    if (!record?.confirmed) {
      throw new NotFoundException('Private evidence object is not available for review.');
    }
    const defaultExpiry = Date.now() + 5 * 60 * 1000;
    const expiresAt = new Date(Math.min(defaultExpiry, notAfter?.getTime() ?? defaultExpiry));
    if (expiresAt.getTime() <= Date.now()) {
      throw new NotFoundException('Private evidence authorization is no longer active.');
    }
    return {
      accessUrl: `https://storage.invalid/private-review/${randomUUID()}?token=${randomUUID()}`,
      expiresAt,
      watermark: `DIREKT synthetic review · ${actorIdentityId.slice(0, 8)} · ${purpose}`,
      synthetic: true,
    };
  }
}
