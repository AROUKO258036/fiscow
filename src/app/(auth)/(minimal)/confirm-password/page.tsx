import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { ConfirmPasswordForm } from '@/components/auth/confirm-password-form'

export default async function ConfirmPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { callbackUrl } = await searchParams

  return (
    <>
      <div className="fiscow-auth-heading">
        <h1>Zone sécurisée</h1>
        <p>Confirmez votre mot de passe avant de continuer.</p>
      </div>

      <ConfirmPasswordForm callbackUrl={callbackUrl} />
    </>
  )
}
