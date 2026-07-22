import { createHash } from 'node:crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { DatabaseService } from '../platform/database/database.service';
import type { RegisterPushDeviceDto } from './push-device.dto';

@Injectable()
export class PushDeviceTokenService {
  constructor(
    private readonly database: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    actor: AuthenticatedActor,
    dto: RegisterPushDeviceDto,
    requestId: string,
  ): Promise<{ installationId: string; status: 'registered' }> {
    this.assertControlledPilotRegistrationEnabled();
    const tokenHash = createHash('sha256').update(dto.token, 'utf8').digest('hex');

    await this.database.transaction(async (client) => {
      await client.query(
        `DELETE FROM platform.push_device_tokens
          WHERE token_hash = $1
            AND NOT (identity_id = $2::uuid AND installation_id = $3::uuid)`,
        [tokenHash, actor.identityId, dto.installationId],
      );
      await client.query(
        `INSERT INTO platform.push_device_tokens (
           identity_id,
           installation_id,
           token,
           token_hash,
           platform,
           data_classification,
           app_version
         ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, 'controlled-pilot', $6)
         ON CONFLICT (identity_id, installation_id)
         DO UPDATE SET
           token = EXCLUDED.token,
           token_hash = EXCLUDED.token_hash,
           platform = EXCLUDED.platform,
           app_version = EXCLUDED.app_version,
           data_classification = 'controlled-pilot',
           updated_at = now(),
           last_seen_at = now(),
           invalidated_at = NULL`,
        [actor.identityId, dto.installationId, dto.token, tokenHash, dto.platform, dto.appVersion ?? null],
      );
      await client.query(
        `INSERT INTO platform.audit_events (
           request_id,
           actor_type,
           actor_id,
           action,
           resource_type,
           outcome,
           metadata
         ) VALUES ($1::uuid, 'identity', $2::uuid, 'push_device_registered', 'push_device', 'success', $3::jsonb)`,
        [
          requestId,
          actor.identityId,
          JSON.stringify({
            installationId: dto.installationId,
            platform: dto.platform,
            tokenStored: true,
            tokenLogged: false,
          }),
        ],
      );
    });

    return { installationId: dto.installationId, status: 'registered' };
  }

  async unregister(
    actor: AuthenticatedActor,
    installationId: string,
    requestId: string,
  ): Promise<{ installationId: string; status: 'deleted' }> {
    this.assertControlledPilotRegistrationEnabled();
    await this.database.transaction(async (client) => {
      await client.query(
        `DELETE FROM platform.push_device_tokens
          WHERE identity_id = $1::uuid
            AND installation_id = $2::uuid`,
        [actor.identityId, installationId],
      );
      await client.query(
        `INSERT INTO platform.audit_events (
           request_id,
           actor_type,
           actor_id,
           action,
           resource_type,
           outcome,
           metadata
         ) VALUES ($1::uuid, 'identity', $2::uuid, 'push_device_deleted', 'push_device', 'success', $3::jsonb)`,
        [requestId, actor.identityId, JSON.stringify({ installationId })],
      );
    });
    return { installationId, status: 'deleted' };
  }

  private assertControlledPilotRegistrationEnabled(): void {
    const registrationMode = this.configService.getOrThrow<string>('PUSH_REGISTRATION_MODE');
    const dataMode = this.configService.getOrThrow<string>('DIREKT_DATA_MODE');
    const pilotApproved = this.configService.getOrThrow<boolean>('PILOT_ENTRY_APPROVED');
    if (registrationMode !== 'controlled-pilot' || dataMode !== 'controlled-pilot' || !pilotApproved) {
      throw new ServiceUnavailableException('Push device registration is not enabled.');
    }
  }
}
