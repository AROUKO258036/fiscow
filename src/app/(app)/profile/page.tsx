import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileInfoForm } from '@/components/app/profile/profile-info-form'
import { PasswordForm } from '@/components/app/profile/password-form'
import { DeleteAccountForm } from '@/components/app/profile/delete-account-form'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(session.user.id),
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerifiedAt: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  const initial =
    user.name?.trim().charAt(0).toUpperCase() ||
    user.email?.trim().charAt(0).toUpperCase() ||
    'U'

  return (
    <div className="fiscow-settings-page">
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="fiscow-settings-page-head">
        <div>
          <span className="fiscow-settings-eyebrow">
            Mon compte
          </span>

          <h1>Paramètres</h1>

          <p>
            Gérez vos informations personnelles et la sécurité
            de votre compte Fiscow.
          </p>
        </div>
      </div>

      {/* =====================================================
          PROFILE OVERVIEW
          ===================================================== */}

      <section className="fiscow-settings-profile-card">
        <div className="fiscow-settings-profile-main">
          <div className="fiscow-settings-profile-avatar">
            {initial}
          </div>

          <div className="fiscow-settings-profile-copy">
            <h2>{user.name}</h2>

            <p>{user.email}</p>
          </div>
        </div>

        <div
          className={
            user.emailVerifiedAt
              ? 'fiscow-settings-status is-success'
              : 'fiscow-settings-status is-warning'
          }
        >
          <span className="fiscow-settings-status-dot" />

          {user.emailVerifiedAt
            ? 'Email vérifié'
            : 'Email à vérifier'}
        </div>
      </section>

      {/* =====================================================
          SETTINGS GRID
          ===================================================== */}

      <div className="fiscow-settings-grid">
        <section className="fiscow-settings-card">
          <div className="fiscow-settings-card-head">
            <div className="fiscow-settings-card-icon">
              <i className="ti ti-user" />
            </div>

            <div>
              <h2>Informations du compte</h2>

              <p>
                Modifiez votre nom et votre adresse email.
              </p>
            </div>
          </div>

          <div className="fiscow-settings-card-body">
            <ProfileInfoForm
              name={user.name}
              email={user.email}
              emailVerifiedAt={user.emailVerifiedAt}
            />
          </div>
        </section>

        <section className="fiscow-settings-card">
          <div className="fiscow-settings-card-head">
            <div className="fiscow-settings-card-icon">
              <i className="ti ti-lock" />
            </div>

            <div>
              <h2>Sécurité</h2>

              <p>
                Modifiez votre mot de passe de connexion.
              </p>
            </div>
          </div>

          <div className="fiscow-settings-card-body">
            <PasswordForm />
          </div>
        </section>
      </div>

      {/* =====================================================
          DANGER ZONE
          ===================================================== */}

      <section className="fiscow-settings-danger-card">
        <div className="fiscow-settings-danger-copy">
          <div className="fiscow-settings-danger-icon">
            <i className="ti ti-alert-triangle" />
          </div>

          <div>
            <h2>Zone sensible</h2>

            <p>
              La suppression du compte est définitive et ne peut
              pas être annulée.
            </p>
          </div>
        </div>

        <DeleteAccountForm />
      </section>
    </div>
  )
}