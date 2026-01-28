import { createClient } from "@supabase/supabase-js"
import { retryWithExponentialBackoff } from "../utils/retry-helper.js"

let supabaseInstance = null

export function getSupabaseClient({ url, serviceRoleKey }) {
  if (supabaseInstance) return supabaseInstance
  if (!url) throw new Error("getSupabaseClient: url is required")
  if (!serviceRoleKey) throw new Error("getSupabaseClient: serviceRoleKey is required")

  supabaseInstance = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return supabaseInstance
}

export async function upsertWithRetry({
  supabase,
  table,
  rows,
  onConflict,
  chunkSize = 500,
  maxRetries = 3,
}) {
  if (!supabase) throw new Error("upsertWithRetry: supabase client is required")
  if (!table) throw new Error("upsertWithRetry: table is required")
  if (!Array.isArray(rows)) throw new Error("upsertWithRetry: rows must be an array")
  if (!rows.length) return { status: 200, count: 0 }

  const chunks = []
  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize))
  }

  let total = 0
  for (const chunk of chunks) {
    await retryWithExponentialBackoff(
      async () => {
        const { error, status, statusText, count } = await supabase
          .from(table)
          .upsert(chunk, { onConflict })

        if (error) {
          throw new Error(`upsertWithRetry: (${status} ${statusText}) ${error.message}`)
        }
        total += count ?? chunk.length
        return { status, count }
      },
      {
        maxRetries,
        shouldRetry: (err) => {
          const message = err?.message || ""
          return message.includes("ECONNRESET") || message.includes("ETIMEDOUT") || message.includes("429")
        },
      },
    )
  }

  return { status: 200, count: total }
}
