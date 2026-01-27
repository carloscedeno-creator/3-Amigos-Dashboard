import { useState } from "react"
import { signUp } from "@/utils/authService"

const emailRegex = /\S+@\S+\.\S+/

const passwordRules =
  "Must be at least 8 characters and include uppercase, lowercase, number, and special character."

function isStrongPassword(value) {
  const minLen = value.length >= 8
  const hasUpper = /[A-Z]/.test(value)
  const hasLower = /[a-z]/.test(value)
  const hasNumber = /\d/.test(value)
  const hasSpecial = /[^A-Za-z0-9]/.test(value)
  return minLen && hasUpper && hasLower && hasNumber && hasSpecial
}

export function Signup({ onSuccess, onBackToLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    if (!emailRegex.test(email)) {
      setError("Invalid email")
      return
    }
    if (!isStrongPassword(password)) {
      setError(passwordRules)
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    const result = await signUp(email, password)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    onSuccess?.(result.user)
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Create account</h2>
      <p className="text-sm text-slate-600">Sign up to access the Delivery Dashboard.</p>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="signup-email" className="text-sm font-medium text-slate-800">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="user@example.com"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="signup-password" className="text-sm font-medium text-slate-800">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="signup-confirm" className="text-sm font-medium text-slate-800">
            Confirm password
          </label>
          <input
            id="signup-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        {error ? <p className="text-sm text-danger-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <div className="mt-4 text-right">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  )
}
