import { prisma } from "./prisma";
import { randomUUID } from "crypto";

export async function createUnsubscribeToken(workspaceId: string, leadEmail: string) {
	const token = randomUUID().replace(/-/g, "");
	await prisma.unsubscribeToken.create({ data: { workspaceId, leadEmail, token } });
	return token;
}

export async function applyUnsubscribeToken(token: string) {
	const rec = await prisma.unsubscribeToken.findUnique({ where: { token }, include: { workspace: true } });
	if (!rec) throw new Error("Invalid token");
	const now = new Date();
	await prisma.lead.updateMany({
		where: { email: rec.leadEmail, list: { workspaceId: rec.workspaceId } },
		data: { unsubscribedAt: now },
	});
	return { workspaceId: rec.workspaceId, email: rec.leadEmail };
}

export async function isEmailUnsubscribed(workspaceId: string, email: string) {
	const found = await prisma.lead.findFirst({ where: { email, list: { workspaceId }, unsubscribedAt: { not: null } }, select: { id: true } });
	return !!found;
}
