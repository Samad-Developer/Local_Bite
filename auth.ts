import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { LoginSchema } from "./lib/validations/auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 2592000
  },
  pages: {
    signIn: "/login",
  },
  providers: [

    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {

        const { email, password } = await LoginSchema.parseAsync(credentials);

        const user = await prisma.user.findUnique({
          where: { email: email },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          password,
          user.password
        )

        if (!passwordMatch) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          restaurantId: user.restaurantId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? ""
        token.role = user.role ?? ""
        token.restaurantId = user.restaurantId ?? ""
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.restaurantId = token.restaurantId as string
      }
      return session
    },
  },
})
