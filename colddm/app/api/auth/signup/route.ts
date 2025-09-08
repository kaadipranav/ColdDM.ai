import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { rateLimiters, checkRateLimit } from "../../../../lib/rate-limit";
import { z } from "zod";
import argon2 from "argon2";

const signupSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
	const ip = req.ip ?? "unknown";
	const { success } = await checkRateLimit(rateLimiters.login, `signup:${ip}`);
	if (!success) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

	const body = await req.json();
	const result = signupSchema.safeParse(body);
	if (!result.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
	const { email, password } = result.data;
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing?.passwordHash) return NextResponse.json({ error: "User exists" }, { status: 409 });
	const hash = await argon2.hash(password);
	const txResult = await prisma.$transaction(async (tx) => {
		const user = existing ?? (await tx.user.create({ data: { email } }));
		await tx.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
		const ws = await tx.workspace.create({ data: { name: "My Workspace" } });
		await tx.membership.create({ data: { userId: user.id, workspaceId: ws.id, role: "OWNER" } });
		return { userId: user.id, workspaceId: ws.id };
	});
	// set activeWorkspaceId cookie
	const res = NextResponse.json({ ok: true });
	res.cookies.set("activeWorkspaceId", txResult.workspaceId, { httpOnly: false, path: "/", secure: true, sameSite: "lax" });
	return res;
} 