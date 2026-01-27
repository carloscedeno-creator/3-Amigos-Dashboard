import { useState } from "react"
import { resetPassword } from "@/utils/authService"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState({ loading: false, message: null, error: null })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ loading: false, message: null, error: null })

    if (!emailRegex.test(email)) {
      setStatus({ loading: false, message: null, error: "Invalid email" })
      return
    }

    setStatus({ loading: true, message: null, error: null })
    const { error } = await resetPassword(email)
    if (error) {
      setStatus({ loading: false, message: null, error: error || "Could not send the email" })
      return
    }

    setStatus({
      loading: false,
      message: "If the account exists, you'll receive an email with instructions.",
      error: null,
    })
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Recover password</h2>
      <p className="text-sm text-slate-600">Enter your email to receive a reset link.</p>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="reset-email" className="text-sm font-medium text-slate-800">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="user@example.com"
            autoComplete="email"
          />
        </div>

        {status.error ? <p className="text-sm text-danger-600">{status.error}</p> : null}
        {status.message ? <p className="text-sm text-success-600">{status.message}</p> : null}

        <button
          type="submit"
          disabled={status.loading}
          className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status.loading ? "Sending..." : "Send link"}
        </button>
      </form>

      <div className="mt-4 text-right">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Back to login
        </button>
      </div>
    </div>
  )
}
