export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function computeDelay(
  attempt: number,
  initialDelayMs: number,
  factor: number,
  maxDelayMs: number,
  jitter: boolean,
) {
  const exponentialDelay = Math.min(
    maxDelayMs,
    Math.round(initialDelayMs * Math.pow(factor, attempt - 1)),
  );
  if (!jitter) {
    return exponentialDelay;
  }
  const jitterAmount = Math.floor(Math.random() * Math.max(1, exponentialDelay / 2));
  return exponentialDelay + jitterAmount;
}

export async function retryWithBackoff<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 4,
    initialDelayMs = 200,
    maxDelayMs = 10_000,
    factor = 2,
    jitter = true,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      const canRetry = attempt < maxAttempts && shouldRetry(error, attempt);
      if (!canRetry) {
        throw error;
      }

      const delay = computeDelay(
        attempt,
        initialDelayMs,
        factor,
        maxDelayMs,
        jitter,
      );
      await sleep(delay);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Retry failed without error details");
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  successThreshold?: number;
  resetTimeoutMs?: number;
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private openedAt = 0;

  constructor(private readonly options: CircuitBreakerOptions = {}) {}

  private get failureThreshold() {
    return this.options.failureThreshold ?? 5;
  }

  private get successThreshold() {
    return this.options.successThreshold ?? 2;
  }

  private get resetTimeoutMs() {
    return this.options.resetTimeoutMs ?? 30_000;
  }

  private canAttemptRequest() {
    if (this.state !== "OPEN") {
      return true;
    }
    return Date.now() - this.openedAt >= this.resetTimeoutMs;
  }

  private transitionToOpen() {
    this.state = "OPEN";
    this.openedAt = Date.now();
    this.successCount = 0;
  }

  private transitionToHalfOpen() {
    this.state = "HALF_OPEN";
    this.failureCount = 0;
    this.successCount = 0;
  }

  private transitionToClosed() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.openedAt = 0;
  }

  getState(): CircuitState {
    return this.state;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.canAttemptRequest()) {
      throw new Error("Circuit breaker is OPEN");
    }

    if (this.state === "OPEN") {
      this.transitionToHalfOpen();
    }

    try {
      const result = await operation();

      if (this.state === "HALF_OPEN") {
        this.successCount += 1;
        if (this.successCount >= this.successThreshold) {
          this.transitionToClosed();
        }
      } else {
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      if (this.state === "HALF_OPEN") {
        this.transitionToOpen();
      } else {
        this.failureCount += 1;
        if (this.failureCount >= this.failureThreshold) {
          this.transitionToOpen();
        }
      }
      throw error;
    }
  }
}

