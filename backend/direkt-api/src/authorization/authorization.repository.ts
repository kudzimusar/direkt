import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../platform/database/database.service';
import type { Permission, RoleKey } from './permissions';

export interface AuthorizationSnapshot {
  roles: RoleKey[];
  permissions: Permission[];
}

@Injectable()
export class AuthorizationRepository {
  constructor(private readonly database: DatabaseService) {}

  snapshot(identityId: string, providerId?: string): Promise<AuthorizationSnapshot> {
    return this.permissionSnapshot(
      identityId,
      `assignments.scope_type = 'global'
       OR ($2::uuid IS NOT NULL AND assignments.provider_id = $2::uuid)`,
      [identityId, providerId ?? null],
    );
  }

  anyProviderSnapshot(identityId: string): Promise<AuthorizationSnapshot> {
    return this.permissionSnapshot(
      identityId,
      `assignments.scope_type = 'global'
       OR (assignments.scope_type = 'provider' AND assignments.provider_id IS NOT NULL)`,
      [identityId],
    );
  }

  private async permissionSnapshot(
    identityId: string,
    scopeCondition: string,
    values: unknown[],
  ): Promise<AuthorizationSnapshot> {
    const result = await this.database.query<{
      role_key: RoleKey;
      permission_key: Permission;
    }>(
      `SELECT DISTINCT roles.role_key, permissions.permission_key
       FROM authz.role_assignments AS assignments
       JOIN authz.roles AS roles ON roles.id = assignments.role_id
       JOIN authz.role_permissions AS role_permissions
         ON role_permissions.role_id = roles.id
       JOIN authz.permissions AS permissions
         ON permissions.id = role_permissions.permission_id
       WHERE assignments.identity_id = $1
         AND assignments.revoked_at IS NULL
         AND assignments.starts_at <= now()
         AND (assignments.ends_at IS NULL OR assignments.ends_at > now())
         AND (${scopeCondition})
       ORDER BY roles.role_key, permissions.permission_key`,
      values,
    );

    void identityId;
    return {
      roles: [...new Set(result.rows.map((row) => row.role_key))],
      permissions: [...new Set(result.rows.map((row) => row.permission_key))],
    };
  }
}
