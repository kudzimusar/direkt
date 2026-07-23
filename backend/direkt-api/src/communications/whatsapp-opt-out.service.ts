import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { AuditService } from '../platform/audit/audit.service';
import { DatabaseService } from '../platform/database/database.service';

@Injectable()
export class WhatsAppOptOutService {
  constructor(
    private readonly database: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async optOut(
    actor: AuthenticatedActor,
    requestId?: string,
  ): Promise<{ channel: 'whatsapp'; optedOut: true; contactsAffected: number }> {
    const result = await this.database.query<{ contact_hash: string }>(
      `INSERT INTO platform.communication_channel_opt_outs (
         identity_id, contact_hash, channel, source, request_id
       )
       SELECT $1::uuid, value_hash, 'whatsapp', 'authenticated_account_opt_out', $2::uuid
         FROM account.contacts
        WHERE identity_id = $1::uuid
          AND channel = 'phone'
          AND verified_at IS NOT NULL
       ON CONFLICT (contact_hash, channel)
       DO UPDATE SET
         identity_id = EXCLUDED.identity_id,
         source = EXCLUDED.source,
         opted_out_at = now(),
         request_id = EXCLUDED.request_id
       RETURNING contact_hash`,
      [actor.identityId, requestId ?? null],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('No verified phone contact is available for WhatsApp opt-out.');
    }
    await this.audit.record({
      actorType: 'identity',
      actorId: actor.identityId,
      ...(requestId ? { requestId } : {}),
      action: 'whatsapp_channel_opted_out',
      resourceType: 'communication_channel',
      outcome: 'success',
      metadata: {
        channel: 'whatsapp',
        contactsAffected: result.rows.length,
        rawContactIncluded: false,
      },
    });
    return { channel: 'whatsapp', optedOut: true, contactsAffected: result.rows.length };
  }
}
