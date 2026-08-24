import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; verified?: string; reset?: string }>
}) {
  const { callbackUrl, verified, reset } = await searchParams

  return (
    <>
      <div className="fiscow-auth-heading">
        <h1>Connexion</h1>
        <p>Accédez à votre espace de gestion</p>
      </div>

      {verified === '1' && (
        <div className="fiscow-auth-success" role="status">
          Votre adresse email a bien été vérifiée. Vous pouvez maintenant vous connecter.
        </div>
      )}

      {reset === '1' && (
        <div className="fiscow-auth-success" role="status">
          Votre mot de passe a été réinitialisé. Vous pouvez vous connecter.
        </div>
      )}

      <LoginForm
        callbackUrl={callbackUrl}
        googleEnabled={!!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET}
      />
    </>
  )
}
