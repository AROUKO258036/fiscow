import NextAuth, {
  type NextAuthConfig,
} from "next-auth"

import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth.config"

const providers: NextAuthConfig["providers"] = [
  /*
   * =====================================================
   * EMAIL / MOT DE PASSE
   * =====================================================
   */

  Credentials({
    credentials: {
      email: {
        label: "Email",
        type: "email",
      },

      password: {
        label: "Mot de passe",
        type: "password",
      },
    },

    async authorize(credentials) {
      const email =
        credentials?.email as
          | string
          | undefined

      const password =
        credentials?.password as
          | string
          | undefined

      if (!email || !password) {
        return null
      }

      /*
       * Recherche dans LA BASE PRISMA.
       */
      const user =
        await prisma.user.findUnique({
          where: {
            email,
          },
        })

      if (!user) {
        return null
      }

      /*
       * Vérification mot de passe.
       */
      const valid =
        await bcrypt.compare(
          password,
          user.password
        )

      if (!valid) {
        return null
      }

      /*
       * IMPORTANT :
       *
       * On retourne l'ID Prisma.
       */
      return {
        id: String(user.id),

        email: user.email,

        name: user.name,

        role: user.role,

        emailVerifiedAt:
          user.emailVerifiedAt,
      }
    },
  }),
]

/*
 * =========================================================
 * GOOGLE OPTIONNEL
 * =========================================================
 */

if (
  process.env.AUTH_GOOGLE_ID &&
  process.env.AUTH_GOOGLE_SECRET
) {
  providers.push(Google)
}

/*
 * =========================================================
 * NEXT AUTH
 * =========================================================
 */

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers,
})