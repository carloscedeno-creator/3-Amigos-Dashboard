import { createClient } from "@supabase/supabase-js"
import { getSupabaseConfig } from "@/config/env"

let supabaseInstance

function ensureClient() {
  if (!supabaseInstance) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export function getSupabaseClient() {
  return ensureClient()
}

export async function checkSupabaseConnection() {
  const client = ensureClient()
  const { data, error } = await client.auth.getSession()
  if (error) {
    throw new Error(`Supabase connection failed: ${error.message}`)
  }
  return data?.session ?? null
}

export async function queryWithRetry(queryFn, { retries = 3, delayMs = 500 } = {}) {
  let lastError

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const result = await queryFn(ensureClient())

      if (result && result.error) {
        throw result.error
      }

      return result
    } catch (error) {
      lastError = error
      if (attempt === retries) {
        break
      }
      const backoff = delayMs * 2 ** attempt
      await new Promise((resolve) => setTimeout(resolve, backoff))
    }
  }

  throw new Error(
    `Supabase query failed after ${retries + 1} attempts: ${lastError?.message ?? "unknown error"}`
  )
}
