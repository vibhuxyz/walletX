import { prismaPostgres } from "@repo/db-postgres";
import { Logger } from "@repo/libs";
import { publishMessage } from "@repo/rabbitmq";

const logger = new Logger("OutboxService");

interface ClaimedOutboxEvent {
  id: string;
  exchange: string;
  routingKey: string;
  payload: unknown;
  attempts: number;
}

async function claimPendingOutboxEvents(
  limit: number = 50,
): Promise<ClaimedOutboxEvent[]> {
  // We combine SELECT, FOR UPDATE SKIP LOCKED, and UPDATE into a single atomic query.
  // This eliminates the need for $transaction and fixes the P2028 timeout issue.
  const rows = await prismaPostgres.$queryRawUnsafe<
    Array<{
      id: string;
      exchange: string;
      routing_key: string;
      payload: unknown;
      attempts: number;
    }>
  >(
    `WITH claimed AS (
       SELECT id
       FROM outbox_events
       WHERE status IN ('PENDING', 'FAILED')
         AND available_at <= NOW()
       ORDER BY created_at ASC
       FOR UPDATE SKIP LOCKED
       LIMIT $1
     )
     UPDATE outbox_events e
     SET status = 'PROCESSING',
         attempts = e.attempts + 1,
         updated_at = NOW()
     FROM claimed c
     WHERE e.id = c.id
     RETURNING e.id, e.exchange, e.routing_key, e.payload, e.attempts;`,
    limit,
  );

  if (rows.length === 0) {
    return [];
  }

  return rows.map((row) => ({
    id: row.id,
    exchange: row.exchange,
    routingKey: row.routing_key,
    payload: row.payload,
    // Note: attempts is already incremented by the RETURNING clause in the SQL
    attempts: row.attempts,
  }));
}

async function markOutboxEventPublished(id: string) {
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

async function markOutboxEventFailed(
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

function computeRetryAt(attempts: number) {
  const delaySeconds = Math.min(300, Math.pow(2, Math.min(attempts, 8)));
  return new Date(Date.now() + delaySeconds * 1000);
}

export async function processOutboxBatch(limit: number = 50) {
  const events = await claimPendingOutboxEvents(limit);
  if (events.length === 0) {
    return { claimed: 0, published: 0, failed: 0 };
  }

  let published = 0;
  let failed = 0;

  for (const event of events) {
    try {
      await publishMessage(event.exchange, event.routingKey, event.payload);
      await markOutboxEventPublished(event.id);
      published += 1;
    } catch (error) {
      failed += 1;
      const retryAt = computeRetryAt(event.attempts);
      await markOutboxEventFailed(
        event.id,
        error instanceof Error ? error.message : String(error),
        retryAt,
      );

      logger.error("Outbox publish failed", {
        outboxEventId: event.id,
        exchange: event.exchange,
        routingKey: event.routingKey,
        attempts: event.attempts,
        retryAt,
      });
    }
  }

  logger.info("Outbox batch processed", {
    claimed: events.length,
    published,
    failed,
  });

  return {
    claimed: events.length,
    published,
    failed,
  };
}
