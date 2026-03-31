-- Monthly analytics materialized view for faster wallet/dashboard analytics
-- This pre-aggregates successful ledger activity by user, month, and normalized entry type.

DROP MATERIALIZED VIEW IF EXISTS mv_user_ledger_monthly;

CREATE MATERIALIZED VIEW mv_user_ledger_monthly AS
SELECT
  le."userId" AS user_id,
  date_trunc('month', le."createdAt" AT TIME ZONE 'UTC')::timestamp AS month_start,
  CASE
    WHEN le."entryType" = 'ADMIN_ADJUSTMENT'
      AND COALESCE(le.metadata->>'kind', '') = 'WITHDRAWAL'
      THEN 'WITHDRAWAL'
    ELSE le."entryType"::text
  END AS entry_type,
  SUM(ABS(le.amount))::numeric AS total_amount,
  COUNT(*)::bigint AS transaction_count
FROM "ledger_entries" le
WHERE le.status = 'SUCCESS'
GROUP BY
  le."userId",
  date_trunc('month', le."createdAt" AT TIME ZONE 'UTC')::timestamp,
  CASE
    WHEN le."entryType" = 'ADMIN_ADJUSTMENT'
      AND COALESCE(le.metadata->>'kind', '') = 'WITHDRAWAL'
      THEN 'WITHDRAWAL'
    ELSE le."entryType"::text
  END;

-- Required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX mv_user_ledger_monthly_user_month_type_idx
  ON mv_user_ledger_monthly (user_id, month_start, entry_type);

CREATE INDEX mv_user_ledger_monthly_user_month_idx
  ON mv_user_ledger_monthly (user_id, month_start DESC);

CREATE INDEX mv_user_ledger_monthly_month_idx
  ON mv_user_ledger_monthly (month_start DESC);
