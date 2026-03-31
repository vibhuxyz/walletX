import { Logger } from "@repo/libs";
import * as ledgerService from "../services/ledger.service.js";
import type { Request, Response } from "express";

const logger = new Logger("LedgerController");

function applyReadCacheHeaders(
  res: Response,
  options: {
    cacheControl: string;
    startedAt: number;
  },
) {
  res.setHeader("Cache-Control", options.cacheControl);
  res.setHeader(
    "Server-Timing",
    `app;desc="ledger-read";dur=${(Date.now() - options.startedAt).toFixed(1)}`,
  );
}

/**
 * Get user's ledger entries
 */
export const getLedgerEntries = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const { limit, offset, cursor, type, category, status, startDate, endDate } =
    req.query;

  logger.debug("Fetching ledger entries", { userId, query: req.query });

  const options: any = {
    limit: limit ? parseInt(limit as string) : 50,
    offset: offset ? parseInt(offset as string) : 0,
  };
  if (cursor) options.cursor = cursor;

  if (type) options.type = type;
  if (category) options.category = category;
  if (status) options.status = status;
  if (startDate) options.startDate = new Date(startDate as string);
  if (endDate) options.endDate = new Date(endDate as string);

  const result = await ledgerService.getUserLedgerEntries(userId, options);

  res.json({
    success: true,
    data: result,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Get single ledger entry details
 */
export const getLedgerEntryDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const { entryId } = req.params;

  logger.debug("Fetching ledger entry details", { userId, entryId });

  const entry = await ledgerService.getLedgerEntryDetails(
    userId,
    entryId as string,
  );

  res.json({
    success: true,
    data: entry,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Get ledger statistics
 */
export const getLedgerStatistics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const startedAt = Date.now();
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  logger.debug("Fetching ledger statistics", { userId });

  const stats = await ledgerService.getLedgerStatistics(
    userId,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined,
  );

  applyReadCacheHeaders(res, {
    cacheControl: "private, max-age=0, stale-while-revalidate=15",
    startedAt,
  });

  res.json({
    success: true,
    data: stats,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Get analytics payload for dashboard charts
 */
export const getLedgerAnalytics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const startedAt = Date.now();
  const userId = req.user!.userId;
  const monthsRaw = req.query.months;

  const parsedMonths =
    typeof monthsRaw === "string" ? Number.parseInt(monthsRaw, 10) : undefined;
  const months =
    parsedMonths && Number.isFinite(parsedMonths) ? parsedMonths : 6;

  logger.debug("Fetching ledger analytics", { userId, months });

  const analytics = await ledgerService.getLedgerAnalytics(userId, months);

  applyReadCacheHeaders(res, {
    cacheControl: "private, max-age=0, stale-while-revalidate=30",
    startedAt,
  });

  res.json({
    success: true,
    data: analytics,
    meta: {
      requestId: req.requestId!,
      timestamp: new Date().toISOString(),
    },
  });
};
