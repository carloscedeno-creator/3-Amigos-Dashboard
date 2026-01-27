import axios from "axios"
import { retryWithExponentialBackoff } from "../utils/retry-helper.js"

function parseRetryAfterMs(headerValue) {
  if (!headerValue) return null

  const seconds = Number(headerValue)
  if (!Number.isNaN(seconds)) {
    return seconds * 1000
  }

  const dateMs = Date.parse(headerValue)
  if (Number.isNaN(dateMs)) return null

  const diff = dateMs - Date.now()
  return diff > 0 ? diff : null
}

export class JiraClient {
  constructor({ baseUrl, apiToken, timeoutMs = 10000, maxRetries = 3 } = {}) {
    if (!baseUrl) throw new Error("JiraClient: baseUrl is required")
    if (!apiToken) throw new Error("JiraClient: apiToken is required")

    this.maxRetries = maxRetries
    this.client = axios.create({
      baseURL: baseUrl.replace(/\/+$/, ""),
      timeout: timeoutMs,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    })
  }

  async request({ method = "GET", url, params, data, headers } = {}) {
    if (!url) {
      throw new Error("JiraClient.request: url is required")
    }

    const executeRequest = async () => {
      try {
        const response = await this.client.request({
          method,
          url,
          params,
          data,
          headers,
        })
        return response.data
      } catch (error) {
        const status = error?.response?.status
        const retryAfterHeader = error?.response?.headers?.["retry-after"]
        const retryAfterMs = parseRetryAfterMs(retryAfterHeader)
        const is429 = status === 429
        const is5xx = status >= 500 && status < 600

        if (!is429 && !is5xx) {
          throw error
        }

        error.__retryHint = {
          status,
          retryAfterMs,
        }
        throw error
      }
    }

    return retryWithExponentialBackoff(executeRequest, {
      maxRetries: this.maxRetries,
      shouldRetry: (err) => {
        const status = err?.__retryHint?.status ?? err?.response?.status
        return status === 429 || (status >= 500 && status < 600)
      },
      getRetryDelayMs: (err, attempt) => {
        if (err?.__retryHint?.retryAfterMs != null) {
          return err.__retryHint.retryAfterMs
        }
        const backoff = 500 * 2 ** attempt
        const capped = Math.min(8000, backoff)
        const jitter = Math.random() * 100
        return capped + jitter
      },
    })
  }
}

export function createJiraClient(config) {
  return new JiraClient(config)
}
