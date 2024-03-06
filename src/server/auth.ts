import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import EmailProvider from "next-auth/providers/email";
import crypto from "node:crypto";
import { db } from "@/server/db";
import { Resend } from "resend";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const resend = new Resend("re_jkp1CHXF_9VwdjEjziwkf9fkLNRcPpXC6");

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    EmailProvider({
      from: "onboarding@resend.dev",
      generateVerificationToken: () => {
        // Generate a random 6-digit code (OTP)
        return crypto.randomInt(100000, 999999).toString();
      },
      sendVerificationRequest: async ({ identifier, url, token }) => {
        const user = await db.user.findUnique({
          where: {
            email: identifier,
          },
          select: {
            emailVerified: true,
          },
        });

        const sendTitle = user ? "Sign in" : "Sign up";

        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: identifier,
          subject: `Next Auth OTP - ${sendTitle}`,
          html: `<p>This is your ${sendTitle} code: <strong>${token}</strong> magic link: <a href="${url}">${url}</a></p>`,
        });
      },
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions);
