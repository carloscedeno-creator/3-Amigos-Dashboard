import { useState } from "react"
import { login, signUp } from "@/utils/authService"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordPolicy = {
  minLength: 8,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  digit: /[0-9]/,
  special: /[^A-Za-z0-9]/,
}

function validatePasswordPolicy(password) {
  if (password.length < passwordPolicy.minLength) return "Min 8 characters"
  if (!passwordPolicy.upper.test(password)) return "Must include uppercase"
  if (!passwordPolicy.lower.test(password)) return "Must include lowercase"
  if (!passwordPolicy.digit.test(password)) return "Must include number"
  if (!passwordPolicy.special.test(password)) return "Must include special char"
  return null
}

export function Login({ onSuccess, onForgotPassword }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    if (!emailRegex.test(email)) {
      setError("Invalid email")
      return
    }

    const passwordError = validatePasswordPolicy(password)
    if (passwordError) {
      setError(`Invalid password: ${passwordError}`)
      return
    }

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    const result = isSignUp ? await signUp(email, password) : await login(email, password)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    onSuccess?.(result.user)
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {isSignUp ? "Create account" : "Sign in"}
          </h2>
          <p className="text-sm text-slate-600">
            {isSignUp ? "Create your dashboard access" : "Access the Delivery Dashboard"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsSignUp((prev) => !prev)
            setError(null)
            setConfirmPassword("")
          }}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          {isSignUp ? "I already have an account" : "Create account"}
        </button>
      </div>

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
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
          <p className="text-xs text-slate-500">Min 8, uppercase, lowercase, number, special.</p>
        </div>

        {isSignUp ? (
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-800">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
        ) : null}

        {error ? <p className="text-sm text-danger-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (isSignUp ? "Creating account..." : "Signing in...") : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      {!isSignUp ? (
        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Forgot your password?
          </button>
        </div>
      ) : null}
    </div>
  )
}
