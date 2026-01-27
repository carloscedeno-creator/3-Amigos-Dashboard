import { useState } from "react"
import { login } from "@/utils/authService"

const emailRegex = /\S+@\S+\.\S+/

export function Login({ onSuccess, onForgotPassword, onCreateAccount }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    if (!emailRegex.test(email)) {
      setError("Invalid email")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    const result = await login(email, password)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    onSuccess?.(result.user)
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
      <p className="text-sm text-slate-600">Access the Delivery Dashboard</p>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-800">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="user@example.com"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-800">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error ? <p className="text-sm text-danger-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-4 text-right">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Forgot your password?
        </button>
      </div>
      <div className="mt-2 text-right">
        <button
          type="button"
          onClick={onCreateAccount}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Create account
        </button>
      </div>
    </div>
  )
}
