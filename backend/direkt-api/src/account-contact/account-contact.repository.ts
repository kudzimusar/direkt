import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../platform/database/database.service';
import type { AccountContactReference } from './account-contact.types';

@Injectable()
export class AccountContactRepository {
  constructor(private readonly database: DatabaseService) {}

  async list(identityId: string): Promise<AccountContactReference[]> {
    const result = await this.database.query<{
      id: string;
      channel: 'email' | 'phone';
      display_hint: string;
      verified_at: Date | null;
    }>(
      `SELECT id, channel, display_hint, verified_at
       FROM account.contacts
       WHERE identity_id = $1
       ORDER BY verified_at DESC NULLS LAST, id`,
      [identityId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      channel: row.channel,
      displayHint: row.display_hint,
      verified: row.verified_at !== null,
      verifiedAt: row.verified_at?.toISOString() ?? null,
    }));
  }
}
