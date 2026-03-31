export const RedisKeys = {
  // Registration & OTP
  OTP_EMAIL_VERIFY: (email: string) => `otp:email:verify:${email}`,
  OTP_LOGIN: (email: string, deviceId: string) =>
    `otp:login:${email}:${deviceId}`,
  OTP_PASSWORD_RESET: (email: string) => `otp:password:reset:${email}`,
  OTP_PIN_RESET: (userId: string) => `otp:pin:reset:${userId}`,
  OTP_ACCOUNT_DELETE: (userId: string) => `otp:account:delete:${userId}`,
  OTP_BANK_LINK: (linkToken: string) => `otp:bank:link:${linkToken}`,
  OTP_LOCK: (scope: string, identifier: string) =>
    `otp:${scope}:lock:${identifier}`,
  OTP_SPAM_LOCK: (scope: string, identifier: string) =>
    `otp:${scope}:spam-lock:${identifier}`,
  OTP_COOLDOWN: (scope: string, identifier: string) =>
    `otp:${scope}:cooldown:${identifier}`,
  OTP_REQUESTS_COUNT: (scope: string, identifier: string) =>
    `otp:${scope}:requests-count:${identifier}`,
  OTP_FAILED_ATTEMPTS: (scope: string, identifier: string) =>
    `otp:${scope}:failed-attempts:${identifier}`,

  // Rate Limiting
  RATE_REGISTER: (ip: string) => `rate:register:${ip}`,
  RATE_LOGIN: (email: string) => `rate:login:${email}`,
  RATE_ORDER: (userId: string) => `rate:order:${userId}`,
  RATE_TRANSFER: (userId: string) => `rate:transfer:${userId}`,
  PIN_ATTEMPT: (userId: string) => `rate:pin:${userId}`,
  PIN_CHANGE_COOLDOWN: (userId: string) => `rate:pin:change:cooldown:${userId}`,

  // Tokens
  REFRESH_TOKEN: (tokenId: string) => `rt:${tokenId}`,
  TOKEN_USER: (userId: string) => `rt:user:${userId}`,
  BLACKLIST_ACCESS: (sessionId: string) => `bl:access:${sessionId}`,
  CSRF_TOKEN: (sessionId: string) => `csrf:${sessionId}`,

  // Cache
  WALLET_BALANCE: (userId: string) => `cache:wallet:balance:${userId}`,
  WALLET_STATUS: (userId: string) => `cache:wallet:status:${userId}`,
  USER_PROFILE: (userId: string) => `cache:user:profile:${userId}`,
  DEVICE_TRUST: (userId: string, deviceId: string) =>
    `cache:device:${userId}:${deviceId}`,
  LEDGER_ANALYTICS: (userId: string, months: number) =>
    `cache:ledger:analytics:${userId}:${months}`,
  LEDGER_ANALYTICS_PATTERN: (userId: string) =>
    `cache:ledger:analytics:${userId}:*`,
  LEDGER_STATS: (
    userId: string,
    startDateKey: string = "all",
    endDateKey: string = "all",
  ) => `cache:ledger:stats:${userId}:${startDateKey}:${endDateKey}`,
  LEDGER_STATS_PATTERN: (userId: string) => `cache:ledger:stats:${userId}:*`,
  RECENT_RECIPIENTS: (userId: string) => `cache:recent_recipients:${userId}`,
  DASHBOARD_SUMMARY: (userId: string) => `cache:dashboard:summary:${userId}`,
  DASHBOARD_FRESHNESS: (userId: string) =>
    `cache:dashboard:freshness:${userId}`,

  // Pending Operations
  PENDING_TRANSFER: (transferId: string) => `pending:transfer:${transferId}`,

  // Idempotency
  IDEMPOTENCY: (key: string) => `idempotency:${key}`,

  // Locks
  LOCK_WALLET: (userId: string) => `lock:wallet:${userId}`,
  LOCK_TRANSFER: (transferId: string) => `lock:transfer:${transferId}`,

  BANK_LINK_SESSION: (linkToken: string) => `bank:link:session:${linkToken}`,
  OTP_TOPUP: (orderId: string) => `otp:topup:${orderId}`,

  LOCK: (resource: string) => `lock:${resource}`,
};

export const RedisTTL = {
  OTP_EMAIL: 600, // 10 minutes
  OTP_LOGIN: 300, // 5 minutes
  OTP_RESET: 600, // 10 minutes
  OTP_PIN_RESET: 600, // 10 minutes
  OTP_ACCOUNT_DELETE: 600, // 10 minutes
  OTP_BANK_LINK: 300, // 5 minutes
  OTP_TOPUP: 600,
  OTP_LOCK: 1800, // 30 minutes
  OTP_SPAM_LOCK: 1800, // 30 minutes
  OTP_COOLDOWN: 60, // 1 minute
  OTP_REQUEST_WINDOW: 600, // 10 minutes
  OTP_FAILED_ATTEMPTS_WINDOW: 600, // 10 minutes
  RATE_LIMIT_REGISTER: 3600, // 1 hour
  RATE_LIMIT_LOGIN: 900, // 15 minutes
  RATE_LIMIT_ORDER: 3600, // 1 hour
  PIN_CHANGE_COOLDOWN: 604800, // 7 days

  REFRESH_TOKEN: 604800, // 7 days
  ACCESS_BLACKLIST: 900, // 15 minutes

  CACHE_BALANCE: 10, // 10 seconds
  CACHE_STATUS: 300, // 5 minutes
  CACHE_PROFILE: 600, // 10 minutes
  CACHE_DEVICE: 86400, // 24 hours
  CACHE_LEDGER_ANALYTICS: 30, // 30 seconds
  CACHE_LEDGER_STATS: 15, // 15 seconds
  CACHE_RECENT_RECIPIENTS: 60, // 60 seconds
  CACHE_DASHBOARD_SUMMARY: 15, // 15 seconds
  CACHE_DASHBOARD_FRESHNESS: 120, // 2 minutes

  PENDING_TRANSFER: 300, // 5 minutes
  IDEMPOTENCY: 86400, // 24 hours
};
