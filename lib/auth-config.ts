import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

// Asegurar que la variable de entorno esté disponible antes de usar Prisma
// Mapear desde diferentes variantes de nombres de variables
if (!process.env.activenglish_PRISMA_DATABASE_URL) {
  if (process.env.DATABASE_URL) {
    process.env.activenglish_PRISMA_DATABASE_URL = process.env.DATABASE_URL;
  }
  else if (process.env.activenglish_POSTGRES_URL) {
    process.env.activenglish_PRISMA_DATABASE_URL = process.env.activenglish_POSTGRES_URL;
  }
  else if (process.env.activeenglish_DATABASE_URL) {
    process.env.activenglish_PRISMA_DATABASE_URL = process.env.activeenglish_DATABASE_URL;
  }
}

// Validar NEXTAUTH_SECRET
if (!process.env.NEXTAUTH_SECRET) {
  console.error('⚠️  WARNING: NEXTAUTH_SECRET no está configurada. NextAuth puede no funcionar correctamente.');
  console.error('   Configura NEXTAUTH_SECRET en Vercel (Settings → Environment Variables)');
}

export const authOptions = {
  // No usar adapter con JWT strategy - el adapter es solo para database sessions
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Type assertion: credentials are validated above
        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // Type assertion: After null check, password is guaranteed to be string
        const isPasswordValid = await bcrypt.compare(
          password,
          user.password as string
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = (user as User & { role?: UserRole }).role as UserRole;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

