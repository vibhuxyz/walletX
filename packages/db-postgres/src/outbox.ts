import { nanoid } from "nanoid";
import { prismaPostgres } from "./client.js";

export interface OutboxEventPayload {
  exchange: string;
  routingKey: string;
  payload: unknown;
  availableAt?: Date;
}

export interface ClaimedOutboxEvent {
  id: string;
  exchange: string;
  routingKey: string;
  payload: unknown;
  attempts: number;
}

export async function enqueueOutboxEventTx(
  tx: any,
  event: OutboxEventPayload,
) {
  const id = `out_${nanoid(21)}`;
  const availableAt = event.availableAt ?? new Date();

  await tx.$executeRawUnsafe(
    `INSERT INTO outbox_events
      (id, exchange, routing_key, payload, status, attempts, available_at, created_at, updated_at)
     VALUES
      ($1, $2, $3, $4::jsonb, 'PENDING', 0, $5, NOW(), NOW())`,
    id,
    event.exchange,
    event.routingKey,
    JSON.stringify(event.payload),
    availableAt,
  );

  return id;
}

export async function claimPendingOutboxEvents(
  limit: number = 50,
): Promise<ClaimedOutboxEvent[]> {
  return prismaPostgres.$transaction(async (tx) => {
    const rows = await tx.$queryRawUnsafe<
      Array<{
        id: string;
        exchange: string;
        routing_key: string;
        payload: unknown;
        attempts: number;
      }>
    >(
      `SELECT id, exchange, routing_key, payload, attempts
       FROM outbox_events
       WHERE status IN ('PENDING', 'FAILED')
         AND available_at <= NOW()
       ORDER BY created_at ASC
       FOR UPDATE SKIP LOCKED
       LIMIT $1`,
      limit,
    );

    if (rows.length === 0) {
      return [];
    }

    for (const row of rows) {
      await tx.$executeRawUnsafe(
        `UPDATE outbox_events
         SET status = 'PROCESSING',
             attempts = attempts + 1,
             updated_at = NOW()
         WHERE id = $1`,
        row.id,
      );
    }

    return rows.map((row) => ({
      id: row.id,
      exchange: row.exchange,
      routingKey: row.routing_key,
      payload: row.payload,
      attempts: row.attempts + 1,
    }));
  });
}

export async function markOutboxEventPublished(id: string) {
  await prismaPostgres.$executeRawUnsafe(
    `UPDATE outbox_events
     SET status = 'PUBLISHED',
         published_at = NOW(),
         last_error = NULL,
         updated_at = NOW()
     WHERE id = $1`,
    id,
  );
}

export async function markOutboxEventFailed(
  id: string,
  errorMessage: string,
  retryAt: Date,
) {
  await prismaPostgres.$executeRawUnsafe(
    `UPDATE outbox_events
     SET status = 'FAILED',
         last_error = $2,
         available_at = $3,
         updated_at = NOW()
     WHERE id = $1`,
    id,
    errorMessage,
    retryAt,
  );
}

