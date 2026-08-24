type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= max) return false
  entry.count += 1
  return true
}

export const RATE_LIMITS = {
  login: { max: 5, windowMs: 60 * 1000 },
  register: { max: 5, windowMs: 60 * 60 * 1000 },
  resendVerification: { max: 6, windowMs: 15 * 60 * 1000 },
  forgotPassword: { max: 3, windowMs: 60 * 60 * 1000 },
  resetPassword: { max: 5, windowMs: 60 * 1000 },
  confirmPassword: { max: 5, windowMs: 60 * 1000 },
} as const
