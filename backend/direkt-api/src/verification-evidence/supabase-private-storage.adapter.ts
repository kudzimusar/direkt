import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'node:crypto';
import type {
  CompletePrivateUploadInput,
  CreatePrivateUploadInput,
  EvidenceStoragePort,
  PrivateReadGrant,
  PrivateUploadGrant,
} from './evidence-storage.port';

interface SignedUploadResponse {
  url?: string;
}

interface SignedReadResponse {
  signedURL?: string;
  signedUrl?: string;
}

@Injectable()
export class SupabasePrivateStorageAdapter implements EvidenceStoragePort {
  private readonly supabaseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly evidenceBucket: string;

  constructor(configService: ConfigService) {
    this.supabaseUrl = configService.getOrThrow<string>('SUPABASE_URL').replace(/\/$/, '');
    this.serviceRoleKey = configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.evidenceBucket = configService.get<string>(
      'SUPABASE_EVIDENCE_BUCKET',
      'provider-evidence',
    );
  }

  async createUploadGrant(input: CreatePrivateUploadInput): Promise<PrivateUploadGrant> {
    const objectKey = `private/${input.providerId}/${input.uploadSessionId}/${randomUUID()}`;
    const response = await this.requestJson<SignedUploadResponse>(
      `/storage/v1/object/upload/sign/${this.encoded(this.evidenceBucket)}/${this.encodedPath(objectKey)}`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      },
    );
    if (!response.url) {
      throw new ServiceUnavailableException('Supabase did not return a signed upload URL.');
    }

    return {
      objectKey,
      uploadUrl: this.absoluteStorageUrl(response.url),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      requiredHeaders: {
        'content-type': input.contentType,
        'x-upsert': 'false',
      },
      synthetic: false,
    };
  }

  async confirmUpload(input: CompletePrivateUploadInput): Promise<void> {
    if (!/^[0-9a-f]{64}$/.test(input.sha256)) {
      throw new BadRequestException('Uploaded object checksum is invalid.');
    }

    const signedUrl = await this.createSignedReadUrl(input.objectKey, 60);
    const response = await this.fetchWithTimeout(signedUrl, { method: 'GET' });
    if (!response.ok) {
      await this.throwStorageError(response, 'Uploaded evidence object could not be verified.');
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    const actualContentType = response.headers.get('content-type')?.split(';', 1)[0]?.trim();
    const actualChecksum = createHash('sha256').update(bytes).digest('hex');

    if (bytes.byteLength !== input.sizeBytes) {
      throw new BadRequestException('Uploaded object size does not match the submitted evidence.');
    }
    if (actualContentType && actualContentType !== input.contentType) {
      throw new BadRequestException(
        'Uploaded content type does not match the authorized evidence session.',
      );
    }
    if (actualChecksum !== input.sha256) {
      throw new BadRequestException(
        'Uploaded object checksum does not match the submitted evidence.',
      );
    }
  }

  async createReadGrant(
    objectKey: string,
    actorIdentityId: string,
    purpose: string,
    notAfter?: Date,
  ): Promise<PrivateReadGrant> {
    const defaultExpiry = Date.now() + 5 * 60 * 1000;
    const expiresAt = new Date(Math.min(defaultExpiry, notAfter?.getTime() ?? defaultExpiry));
    const expiresIn = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    if (expiresIn <= 0) {
      throw new NotFoundException('Private evidence authorization is no longer active.');
    }

    return {
      accessUrl: await this.createSignedReadUrl(objectKey, expiresIn),
      expiresAt,
      watermark: `DIREKT private review · ${actorIdentityId.slice(0, 8)} · ${purpose}`,
      synthetic: false,
    };
  }

  private async createSignedReadUrl(objectKey: string, expiresIn: number): Promise<string> {
    const response = await this.requestJson<SignedReadResponse>(
      `/storage/v1/object/sign/${this.encoded(this.evidenceBucket)}/${this.encodedPath(objectKey)}`,
      {
        method: 'POST',
        body: JSON.stringify({ expiresIn }),
      },
    );
    const signedUrl = response.signedURL ?? response.signedUrl;
    if (!signedUrl) {
      throw new ServiceUnavailableException('Supabase did not return a signed evidence URL.');
    }
    return this.absoluteStorageUrl(signedUrl);
  }

  private async requestJson<T>(path: string, init: RequestInit): Promise<T> {
    const response = await this.fetchWithTimeout(`${this.supabaseUrl}${path}`, {
      ...init,
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
        'content-type': 'application/json',
        ...init.headers,
      },
    });
    if (!response.ok) {
      await this.throwStorageError(response, 'Supabase Storage request failed.');
    }
    return (await response.json()) as T;
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (error) {
      throw new ServiceUnavailableException('Supabase Storage is temporarily unavailable.', {
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private async throwStorageError(response: Response, fallback: string): Promise<never> {
    const detail = await response.text().catch(() => '');
    const message = detail && detail.length <= 500 ? `${fallback} ${detail}` : fallback;
    if (response.status === 404) {
      throw new NotFoundException(message);
    }
    if (response.status === 400 || response.status === 409 || response.status === 413) {
      throw new BadRequestException(message);
    }
    throw new ServiceUnavailableException(message);
  }

  private absoluteStorageUrl(value: string): string {
    if (/^https?:\/\//.test(value)) {
      return value;
    }
    if (value.startsWith('/storage/v1/')) {
      return `${this.supabaseUrl}${value}`;
    }
    if (value.startsWith('/object/')) {
      return `${this.supabaseUrl}/storage/v1${value}`;
    }
    return `${this.supabaseUrl}/storage/v1/${value.replace(/^\//, '')}`;
  }

  private encodedPath(value: string): string {
    return value
      .split('/')
      .map((segment) => this.encoded(segment))
      .join('/');
  }

  private encoded(value: string): string {
    return encodeURIComponent(value);
  }
}
