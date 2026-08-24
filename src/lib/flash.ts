import { cookies } from 'next/headers'

export async function setFlash(type: 'success' | 'error', message: string) {
  const store = await cookies()
  store.set('rg_flash', JSON.stringify({ type, message }), {
    path: '/',
    maxAge: 10,
    httpOnly: false,
  })
}
