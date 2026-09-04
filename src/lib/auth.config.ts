import type { NextAuthConfig } from "next-auth"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
  },

  providers: [],

  callbacks: {
    // =========================================================
    // 1. CONNEXION
    // =========================================================

    async signIn({ user, account }) {
      // ---------------------------------------------------------
      // GOOGLE
      // ---------------------------------------------------------

      if (account?.provider === "google") {
        if (!user.email) {
          return false
        }

        const existingUser = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
        })

        // Nouvel utilisateur Google
        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(
            crypto.randomUUID(),
            10,
          )

          await prisma.user.create({
            data: {
              name:
                user.name ??
                user.email.split("@")[0],

              email: user.email,

              password: hashedPassword,

              // Google a déjà vérifié cette adresse.
              emailVerifiedAt: new Date(),

              role: "USER",
            },
          })

          return true
        }

        // -------------------------------------------------------
        // Utilisateur déjà existant
        // -------------------------------------------------------
        // Si l'utilisateur se connecte avec Google,
        // nous pouvons considérer son adresse comme vérifiée.
        // Cela évite de le renvoyer vers /verify-email.

        if (!existingUser.emailVerifiedAt) {
          await prisma.user.update({
            where: {
              id: existingUser.id,
            },

            data: {
              emailVerifiedAt: new Date(),
            },
          })
        }

        return true
      }

      // ---------------------------------------------------------
      // AUTRES MÉTHODES DE CONNEXION
      // ---------------------------------------------------------

      return true
    },

    // =========================================================
    // 2. JWT
    // =========================================================

    async jwt({ token, user }) {
      const email =
        user?.email ??
        token.email

      if (email) {
        const dbUser =
          await prisma.user.findUnique({
            where: {
              email,
            },

            select: {
              id: true,
              role: true,
              email: true,
              name: true,
            },
          })

        if (dbUser) {
          token.id =
            String(dbUser.id)

          token.role =
            dbUser.role

          token.email =
            dbUser.email

          token.name =
            dbUser.name
        }
      }

      return token
    },

    // =========================================================
    // 3. SESSION
    // =========================================================

    async session({
      session,
      token,
    }) {
      if (session.user) {
        if (token.id) {
          session.user.id =
            String(token.id)
        }

        if (
          typeof token.role ===
          "string"
        ) {
          session.user.role =
            token.role
        }
      }

      return session
    },
  },
} satisfies NextAuthConfig