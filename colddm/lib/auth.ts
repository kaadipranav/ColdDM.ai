import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import argon2 from "argon2";
import { cookies } from "next/headers";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
	? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
	: undefined;

const loginLimiter = redis
	? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") })
	: undefined;

export const authConfig: NextAuthConfig = {
	adapter: PrismaAdapter(prisma),
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		}),
		Credentials({
			name: "Email and Password",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials, req) {
				if (!credentials?.email || !credentials.password) return null;
				// rate limit by ip
				try {
					if (loginLimiter) {
						const ip = (req as any)?.ip ?? "unknown";
						const { success } = await loginLimiter.limit(`login:${ip}`);
						if (!success) return null;
					}
				} catch {}
				const user = await prisma.user.findUnique({ where: { email: credentials.email } });
				if (!user?.passwordHash) return null;
				const ok = await argon2.verify(user.passwordHash, credentials.password);
				return ok ? { id: user.id, email: user.email, name: user.name } : null;
			},
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

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig); 