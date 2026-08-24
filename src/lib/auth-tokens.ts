import { randomBytes } from 'crypto'

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex')
}

export const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

export function tokenExpiry(ttlMs: number): Date {
  return new Date(Date.now() + ttlMs)
}
