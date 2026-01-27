import { getSupabaseClient } from "@/utils/supabaseApi"

function formatError(error) {
  if (!error) return null
  return error?.message || "Unexpected error"
}

export async function login(email, password) {
  const supabase = getSupabaseClient()
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return {
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: formatError(error),
    }
  } catch (error) {
    return { user: null, session: null, error: formatError(error) }
  }
}

export async function logout() {
  const supabase = getSupabaseClient()
  try {
    const { error } = await supabase.auth.signOut()
    return { error: formatError(error) }
  } catch (error) {
    return { error: formatError(error) }
  }
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient()
  try {
    const { data, error } = await supabase.auth.getUser()
    return { user: data?.user ?? null, error: formatError(error) }
  } catch (error) {
    return { user: null, error: formatError(error) }
  }
}

export async function isAuthenticated() {
  const supabase = getSupabaseClient()
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      return { authenticated: false, session: null, error: formatError(error) }
    }
    return { authenticated: Boolean(data?.session), session: data?.session ?? null, error: null }
  } catch (error) {
    return { authenticated: false, session: null, error: formatError(error) }
  }
}

export async function resetPassword(email) {
  const supabase = getSupabaseClient()
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error: formatError(error) }
  } catch (error) {
    return { error: formatError(error) }
  }
}

export function getUserRole(user) {
  // Basic role from metadata; default admin for early development
  return user?.user_metadata?.role || "admin"
}

export function onAuthStateChange(callback) {
  const supabase = getSupabaseClient()
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback?.(event, session)
  })

  return () => {
    subscription.unsubscribe()
  }
}

export async function signUp(email, password) {
  const supabase = getSupabaseClient()
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    return { user: data?.user ?? null, session: data?.session ?? null, error: formatError(error) }
  } catch (error) {
    return { user: null, session: null, error: formatError(error) }
  }
}
