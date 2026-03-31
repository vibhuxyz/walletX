import { prismaPostgres } from "@repo/db-postgres";
import { Logger } from "@repo/libs";

const logger = new Logger("AnalyticsRefreshJob");

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

function resolveIntervalMs(): number {
  const raw = process.env.ANALYTICS_REFRESH_INTERVAL_MS;
  if (!raw) return DEFAULT_INTERVAL_MS;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    logger.warn("Invalid ANALYTICS_REFRESH_INTERVAL_MS, using default", {
      raw,
      fallbackMs: DEFAULT_INTERVAL_MS,
    });
    return DEFAULT_INTERVAL_MS;
  }

  return parsed;
}

function isJobEnabled(): boolean {
  const raw = (process.env.ENABLE_ANALYTICS_REFRESH_JOB ?? "true").toLowerCase();
  return raw !== "false" && raw !== "0" && raw !== "no";
}

async function refreshAnalyticsMaterializedView() {
  const startedAt = Date.now();

  await prismaPostgres.$executeRawUnsafe(
    `REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_ledger_monthly`,
  );

  const durationMs = Date.now() - startedAt;

  logger.info("Analytics materialized view refreshed", {
    durationMs,
    view: "mv_user_ledger_monthly",
    refreshedAt: new Date().toISOString(),
  });
}

export function startAnalyticsRefreshJob() {
  if (!isJobEnabled()) {
    logger.info("Analytics refresh job disabled via environment");
    return;
  }

  const intervalMs = resolveIntervalMs();

  const run = async () => {
    try {
      await refreshAnalyticsMaterializedView();
    } catch (error) {
      logger.error("Analytics refresh job failed", {
        error: error instanceof Error ? error.message : String(error),
        view: "mv_user_ledger_monthly",
      });
    }
  };

  void run();

  const timer = setInterval(() => {
    void run();
  }, intervalMs);

  timer.unref();

  logger.info("Analytics refresh job started", {
    intervalMs,
    view: "mv_user_ledger_monthly",
  });
}
