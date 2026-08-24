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
    /*
     * =====================================================
     * SIGN IN
     * =====================================================
     */

    async signIn({ user, account }) {
      /*
       * Pour Google :
       * on s'assure que l'utilisateur existe dans Prisma.
       */
      if (account?.provider === "google") {
        if (!user.email) {
          return false
        }

        const existing =
          await prisma.user.findUnique({
            where: {
              email: user.email,
            },
          })

        if (!existing) {
          const hashed =
            await bcrypt.hash(
              crypto.randomUUID(),
              10
            )

          await prisma.user.create({
            data: {
              name:
                user.name ??
                user.email.split("@")[0],

              email: user.email,

              password: hashed,

              emailVerifiedAt:
                new Date(),

              role: "USER",
            },
          })
        }
      }

      return true
    },

    /*
     * =====================================================
     * JWT
     * =====================================================
     *
     * C'est la correction importante.
     *
     * On ne se fie plus uniquement à user.id.
     * On récupère l'utilisateur réel dans Prisma grâce
     * à son email.
     */

    async jwt({ token, user }) {
      const email =
        user?.email ?? token.email

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
          /*
           * ID PRISMA
           *
           * Ex :
           * 1
           * 2
           * 15
           *
           * et non un ID Google.
           */
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

    /*
     * =====================================================
     * SESSION
     * =====================================================
     */

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