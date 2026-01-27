import { createClient } from "@supabase/supabase-js"

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
