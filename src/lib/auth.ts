import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

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
            phone: user.phone || "",
            referralCode: user.referralCode || "",
            active: user.active,
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
        token.active = (user as any).active ?? true;
        token.phone = (user as any).phone;
        token.referralCode = (user as any).referralCode;
      }

      // Luôn kiểm tra database fresh để không bao giờ tin dữ liệu stale trong cookie
      if (token.id) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              role: true,
              active: true,
              name: true,
              email: true,
              phone: true,
              referralCode: true,
            },
          });

          if (!freshUser || !freshUser.active) {
            token.active = false;
            token.isInactive = true;
            token.role = freshUser?.role || "CUSTOMER";
          } else {
            token.role = freshUser.role;
            token.active = true;
            token.isInactive = false;
            token.name = freshUser.name;
            token.email = freshUser.email;
            token.phone = freshUser.phone;
            token.referralCode = freshUser.referralCode;
          }
        } catch (err) {
          console.error("[AUTH] Error checking fresh user in jwt callback:", err);
        }
      }

      if (token.id && token.publicReferralToken === undefined) {
        try {
          const collab = await prisma.collaborator.findUnique({
            where: { userId: token.id as string },
            select: { publicReferralToken: true },
          });
          token.publicReferralToken = collab?.publicReferralToken || null;
        } catch {
          token.publicReferralToken = null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).active = token.active ?? true;
        (session.user as any).isInactive = token.isInactive ?? false;
        (session.user as any).phone = token.phone;
        (session.user as any).referralCode = token.referralCode;
        (session.user as any).publicReferralToken = token.publicReferralToken || null;
      }
      return session;
    },
  },
};

export interface FreshAuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  phone: string | null;
  referralCode: string | null;
}

/**
 * Central helper kiểm tra người dùng hiện tại từ Database thực tế (Source of Truth).
 * Tuyệt đối không dựa vào cookie hay token stale.
 * Nếu user bị khóa (active = false) hoặc bị xóa khỏi DB, trả về null ngay lập tức.
 */
export async function getCurrentAuthUser(): Promise<FreshAuthUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return null;
  }

  const userId = (session.user as any).id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        phone: true,
        referralCode: true,
      },
    });

    if (!user || !user.active) {
      return null;
    }

    return user as FreshAuthUser;
  } catch (err) {
    console.error("[AUTH] Error in getCurrentAuthUser:", err);
    return null;
  }
}
