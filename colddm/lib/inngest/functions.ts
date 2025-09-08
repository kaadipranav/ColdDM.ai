import { inngest } from "./client";
import { prisma } from "../prisma";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { renderTemplate } from "../template";
import { sendEmail } from "../mail/TransportManager";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
	? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
	: undefined;
const rpsLimiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.tokenBucket(10, "10 s") }) : undefined;

function pickVariant<T extends { id: string; trafficSplit: number }>(variants: T[]): T | null {
	if (!variants.length) return null;
	const total = variants.reduce((s, v) => s + Math.max(0, v.trafficSplit), 0) || 0;
	if (total <= 0) return variants[0];
	let r = Math.random() * total;
	for (const v of variants) {
		r -= Math.max(0, v.trafficSplit);
		if (r <= 0) return v;
	}
	return variants[0];
}

export const pollAndSend = inngest.createFunction({ id: "poll-and-send" }, { cron: "*/3 * * * *" }, async ({ step }) => {
	// Find due enrollments
	const due = await prisma.enrollment.findMany({
		where: { status: "ACTIVE", nextSendAt: { lte: new Date() } },
		include: { sequence: { include: { steps: true } }, lead: true },
		take: 50,
	});

	for (const e of due) {
		await step.run("process-enrollment", async () => {
			// pick step
			const stepOrder = e.nextStepOrder ?? 1;
			const stepDef = e.sequence.steps.find((s) => s.order === stepOrder);
			if (!stepDef) return;
			// pick an account (simplified: first account in workspace)
			const account = await prisma.emailAccount.findFirst({ where: { workspaceId: e.sequence.workspaceId } });
			if (!account) return;
			// daily cap
			const since = new Date(); since.setHours(0,0,0,0);
			const sentToday = await prisma.send.count({ where: { emailAccountId: account.id, createdAt: { gte: since } } });
			if (sentToday >= account.dailyCap) return;
			// rps limit
			if (rpsLimiter) {
				const { success } = await rpsLimiter.limit(`send:${account.id}`);
				if (!success) return;
			}
			// fetch template + variants
			const tpl = await prisma.template.findUnique({ where: { id: stepDef.templateId }, include: { variants: true } });
			if (!tpl) return;
			const chosen = pickVariant(tpl.variants);
			const subjectRaw = chosen ? chosen.subject : tpl.subject;
			const bodyRaw = chosen ? chosen.body : tpl.body;
			const subject = renderTemplate(subjectRaw, e.lead, {});
			const html = renderTemplate(bodyRaw, e.lead, {});
			// create send
			const send = await prisma.send.create({ data: { enrollmentId: e.id, stepOrder, emailAccountId: account.id, status: "QUEUED", templateVariantId: chosen?.id } });
			try {
				const info = await sendEmail({ accountId: account.id, from: account.fromEmail, to: e.lead.email, subject, html });
				await prisma.send.update({ where: { id: send.id }, data: { status: "SENT", providerMessageId: info.providerMessageId, sentAt: new Date() } });
				// schedule next
				const nextStep = e.sequence.steps.find((s) => s.order === stepOrder + 1);
				await prisma.enrollment.update({ where: { id: e.id }, data: {
					status: nextStep ? "ACTIVE" : "COMPLETED",
					nextStepOrder: nextStep ? nextStep.order : null,
					nextSendAt: nextStep ? new Date(Date.now() + nextStep.waitHours * 3600 * 1000) : null,
					lastSentAt: new Date(),
				} });
			} catch (err) {
				const retryCount = 1;
				await prisma.send.update({ where: { id: send.id }, data: { status: "FAILED", error: String(err) } });
				// backoff: push nextSendAt into future
				await prisma.enrollment.update({ where: { id: e.id }, data: { nextSendAt: new Date(Date.now() + Math.min(60, Math.pow(2, retryCount)) * 1000) } });
			}
		});
	}
});
