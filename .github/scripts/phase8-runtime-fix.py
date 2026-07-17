from pathlib import Path


def replace_once(source: str, old: str, new: str, label: str) -> str:
    count = source.count(old)
    if count != 1:
        raise SystemExit(f"Expected one {label} target, found {count}")
    return source.replace(old, new)


path = Path("src/interaction/interaction-handoff.repository.ts")
source = path.read_text()

source = replace_once(
    source,
    """           $3, jsonb_build_object('channel', $4, 'rawContactIncluded', false, 'externalDeliveryAttempted', false)
""",
    """           $3, jsonb_build_object('channel', $4::text, 'rawContactIncluded', false, 'externalDeliveryAttempted', false)
""",
    "handoff event channel cast",
)

source = replace_once(
    source,
    """      .catch((error: unknown) => {
        const databaseError = error as {
          code?: string;
          constraint?: string;
          detail?: string;
          message?: string;
          table?: string;
          where?: string;
        };
        if (process.env.NODE_ENV === 'test') {
          process.stderr.write(
            `${JSON.stringify({
              event: 'phase8_handoff_error',
              code: databaseError.code ?? null,
              constraint: databaseError.constraint ?? null,
              detail: databaseError.detail ?? null,
              message: databaseError.message ?? null,
              table: databaseError.table ?? null,
              where: databaseError.where ?? null,
            })}\n`,
          );
        }
        if (databaseError.code === '23P01') {
          throw new ConflictException(
            'A current contact handoff already exists for this interaction and channel.',
          );
        }
        throw error;
      });
""",
    """      .catch((error: unknown) => {
        const code = (error as { code?: string }).code;
        if (code === '23P01') {
          throw new ConflictException(
            'A current contact handoff already exists for this interaction and channel.',
          );
        }
        throw error;
      });
""",
    "temporary handoff diagnostic",
)

source = replace_once(
    source,
    """  private async audit(
    client: PoolClient,
    actor: AuthenticatedActor,
    providerId: string,
    requestId: string | undefined,
    action: string,
    resourceId: string,
    details: Record<string, unknown>,
  ): Promise<void> {
    await client.query(
      `INSERT INTO platform.audit_events (
       actor_identity_id, actor_session_id, action, resource_type, resource_id,
       provider_id, request_id, details
     ) VALUES ($1, $2, $3, 'interaction', $4, $5, $6, $7::jsonb)`,
      [
        actor.identityId,
        actor.sessionId,
        action,
        resourceId,
        providerId,
        requestId ?? null,
        JSON.stringify(details),
      ],
    );
  }
""",
    """  private async audit(
    client: PoolClient,
    actor: AuthenticatedActor,
    providerId: string,
    requestId: string | undefined,
    action: string,
    resourceId: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    await client.query(
      `INSERT INTO platform.audit_events (
         request_id, actor_type, actor_id, provider_id, action,
         resource_type, resource_id, outcome, metadata
       ) VALUES ($1, 'identity', $2, $3, $4, 'interaction_handoff', $5, 'success', $6::jsonb)`,
      [
        requestId ?? null,
        actor.identityId,
        providerId,
        action,
        resourceId,
        JSON.stringify(metadata),
      ],
    );
  }
""",
    "handoff audit contract",
)

path.write_text(source)
