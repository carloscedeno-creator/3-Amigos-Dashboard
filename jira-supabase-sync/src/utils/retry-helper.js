const defaultOptions = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 8000,
  jitterMs: 100,
  shouldRetry: () => true,
  getRetryDelayMs: null,
  onRetry: null,
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function retryWithExponentialBackoff(fn, options = {}) {
  const config = { ...defaultOptions, ...options }

  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    try {
      return await fn(attempt)
    } catch (error) {
      const nextAttempt = attempt + 1
      const shouldRetry = config.shouldRetry(error, attempt)

      if (!shouldRetry || nextAttempt > config.maxRetries) {
        throw error
      }

      const delayFromCustom =
        typeof config.getRetryDelayMs === "function"
          ? config.getRetryDelayMs(error, attempt)
          : null

      const backoffDelay = config.baseDelayMs * 2 ** attempt
      const jitter = Math.random() * config.jitterMs
      const delayMs =
        delayFromCustom != null
          ? delayFromCustom
          : Math.min(config.maxDelayMs, backoffDelay + jitter)

      if (typeof config.onRetry === "function") {
        config.onRetry({ attempt: nextAttempt, delayMs, error })
      }

      await sleep(delayMs)
    }
  }
}
