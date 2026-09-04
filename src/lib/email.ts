type SendEmailParams = {
  to: string
  subject: string
  html: string
}

export const EMAIL_SEND_FAILURE = 'Impossible d’envoyer l’email pour le moment. Vérifiez la configuration Brevo puis réessayez.'

const BASE_URL = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function sender() {
  return {
    email: process.env.EMAIL_FROM || 'onboarding@brevo.com',
    name: process.env.EMAIL_FROM_NAME || 'Fiscow',
  }
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[email:dev] to=${to} subject="${subject}"`)
      console.log(html)
      return
    }

    throw new Error(EMAIL_SEND_FAILURE)
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: sender(),
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    console.error('[email:brevo] échec', response.status, details)
    if (response.status === 401) {
      console.error('[email:brevo] 401 Unauthorized — vérifiez la valeur de BREVO_API_KEY et ses permissions')
    }
    throw new Error(EMAIL_SEND_FAILURE)
  }
}

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#FFF7F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7F0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #EDE7E1;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(23,23,23,0.06);">
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #EDE7E1;">
              <span style="color:#171717;font-size:24px;font-weight:800;letter-spacing:-0.04em;">Fiscow<span style="color:#FF8A1F;">.</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#171717;font-size:15px;line-height:1.65;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#FFFDFC;padding:16px 32px;border-top:1px solid #EDE7E1;color:#6B6B6B;font-size:12px;">
              &copy; ${new Date().getFullYear()} Fiscow — Novatrix. Conformité fiscale au Bénin.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function button(text: string, url: string): string {
  return `<p style="text-align:center;margin:32px 0;">
  <a href="${url}" style="background:#FF8A1F;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:10px;font-weight:700;display:inline-block;">${text}</a>
</p>`
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${BASE_URL}/verify-email?token=${encodeURIComponent(token)}`
  await sendEmail({
    to,
    subject: 'Vérifiez votre adresse email',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;">Confirmez votre adresse email</h1>
      <p>Bienvenue sur Fiscow. Pour activer votre compte, confirmez votre adresse email en cliquant sur le bouton ci-dessous.</p>
      ${button('Vérifier mon email', url)}
      <p style="color:#6B6B6B;font-size:13px;overflow-wrap:anywhere;">Si le bouton ne fonctionne pas, copiez ce lien :<br />${url}</p>
      <p style="color:#6B6B6B;font-size:13px;">Ce lien est valable 24 heures.</p>
    `),
  })
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${BASE_URL}/reset-password?token=${encodeURIComponent(token)}`
  await sendEmail({
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;">Réinitialisez votre mot de passe</h1>
      <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Fiscow.</p>
      ${button('Réinitialiser mon mot de passe', url)}
      <p style="color:#6B6B6B;font-size:13px;">Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.</p>
      <p style="color:#6B6B6B;font-size:13px;">Ce lien est valable 60 minutes.</p>
    `),
  })
}

export async function sendReminderEmail(
  to: string,
  companyName: string,
  events: { title: string; date: string; montant: string }[],
): Promise<void> {
  const rows = events
    .map(
      (e) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #EDE7E1;">${e.title}</td>
        <td style="padding:10px 0;border-bottom:1px solid #EDE7E1;">${e.date}</td>
        <td style="padding:10px 0;border-bottom:1px solid #EDE7E1;text-align:right;">${e.montant}</td>
      </tr>`,
    )
    .join('')

  await sendEmail({
    to,
    subject: `${events.length} échéance${events.length > 1 ? 's' : ''} fiscale${events.length > 1 ? 's' : ''} à venir`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;">Bonjour,</h1>
      <p>Voici vos prochaines échéances fiscales pour <strong>${companyName}</strong> :</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        ${rows}
      </table>
      <p>Connectez-vous à Fiscow pour préparer vos déclarations à temps.</p>
      ${button('Accéder à mon calendrier', `${BASE_URL}/calendrier-fiscal`)}
    `),
  })
}
