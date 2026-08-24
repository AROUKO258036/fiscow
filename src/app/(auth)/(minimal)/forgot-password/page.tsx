import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="fiscow-auth-heading">
        <h1>Mot de passe oublié ?</h1>
        <p>Indiquez votre adresse email et nous vous enverrons un lien de réinitialisation.</p>
      </div>

      <ForgotPasswordForm />
    </>
  )
}
