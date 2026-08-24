import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <>
      <div className="fiscow-auth-heading">
        <h1>Créer votre compte</h1>
        <p>Configurez votre entreprise et reprenez le contrôle de vos obligations fiscales.</p>
      </div>

      <RegisterForm />
    </>
  )
}
