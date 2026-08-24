import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (!token) redirect('/forgot-password')

  const record = await prisma.passwordResetToken.findUnique({ where: { token } })
  const valid = record && record.expires >= new Date()

  if (!valid) {
    if (record) await prisma.passwordResetToken.delete({ where: { id: record.id } })

    return (
      <>
        <div className="fiscow-auth-heading">
          <h1>Lien invalide ou expiré</h1>
          <p>Ce lien de réinitialisation n’est plus valable. Demandez-en un nouveau pour continuer.</p>
        </div>
        <div className="fiscow-auth-error" role="alert">Le lien de réinitialisation est invalide ou expiré.</div>
      </>
    )
  }

  return (
    <>
      <div className="fiscow-auth-heading">
        <h1>Nouveau mot de passe</h1>
        <p>Choisissez un mot de passe solide pour sécuriser votre compte.</p>
      </div>

      <ResetPasswordForm token={token} />
    </>
  )
}
