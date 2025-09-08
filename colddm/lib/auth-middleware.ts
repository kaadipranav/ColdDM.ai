import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { cookies } from "next/headers";

// Minimal config for middleware: no Credentials/argon2 to avoid node:crypto
export const authMiddlewareConfig: NextAuthConfig = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    session: { strategy: "database" },
    callbacks: {
        async session({ session, user }) {
            (session.user as any).id = user.id;
            const cookie = cookies().get("activeWorkspaceId");
            (session as any).activeWorkspaceId = cookie?.value ?? null;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const { auth } = NextAuth(authMiddlewareConfig);


