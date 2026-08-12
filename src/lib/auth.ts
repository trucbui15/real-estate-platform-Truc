import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "minhdungland-secret-key-2026",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const rawEmail = credentials.email.trim();
          const rawPassword = credentials.password.trim();

          const user = await prisma.user.findFirst({
            where: {
              email: {
                equals: rawEmail,
                mode: "insensitive",
              },
            },
          });

          if (!user || !user.active) {
            console.warn(`[AUTH] User not found or inactive: ${rawEmail}`);
            return null;
          }

          const valid = await bcrypt.compare(rawPassword, user.passwordHash);
          if (!valid) {
            console.warn(`[AUTH] Password mismatch for: ${rawEmail}`);
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          } as any;
        } catch (error) {
          console.error("[AUTH] Database error during authorize:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        const dbUser = await prisma.user.findUnique({
          where: { id: (user as any).id },
          select: { phone: true, referralCode: true },
        });
        if (dbUser?.phone) {
          token.phone = dbUser.phone;
        }
        if (dbUser?.referralCode) {
          token.referralCode = dbUser.referralCode;
        }
        const collaborator = await prisma.collaborator.findFirst({
          where: { userId: (user as any).id },
          select: { publicReferralToken: true },
        });
        if (collaborator) {
          token.publicReferralToken = collaborator.publicReferralToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).referralCode = token.referralCode;
        (session.user as any).publicReferralToken = token.publicReferralToken;
      }
      return session;
    },
  },
};
