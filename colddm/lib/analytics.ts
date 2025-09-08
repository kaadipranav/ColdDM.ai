import { prisma } from "./prisma";
import { unstable_cache as cache } from "next/cache";

export const ANALYTICS_TAG = {
	DASHBOARD: "analytics:dashboard",
	SEQUENCE: (id: string) => `analytics:sequence:${id}`,
	TEMPLATE: (id: string) => `analytics:template:${id}`,
};

async function _getDashboardTimeseries(workspaceId: string, days: number = 7) {
	const since = new Date(Date.now() - days * 24 * 3600 * 1000);
	const sends = await prisma.$queryRaw<any[]>`
		SELECT date_trunc('day', "sentAt") as day, count(*)::int AS count
		FROM "Send"
		WHERE "sentAt" IS NOT NULL AND "createdAt" >= ${since}
		GROUP BY 1 ORDER BY 1 ASC;
	`;
	const opens = await prisma.$queryRaw<any[]>`
		SELECT date_trunc('day', e."createdAt") as day, count(*)::int AS count
		FROM "Event" e
		JOIN "Send" s ON s.id = e."sendId"
		WHERE e.type = 'OPEN' AND e."createdAt" >= ${since}
		GROUP BY 1 ORDER BY 1 ASC;
	`;
	const clicks = await prisma.$queryRaw<any[]>`
		SELECT date_trunc('day', e."createdAt") as day, count(*)::int AS count
		FROM "Event" e
		JOIN "Send" s ON s.id = e."sendId"
		WHERE e.type = 'CLICK' AND e."createdAt" >= ${since}
		GROUP BY 1 ORDER BY 1 ASC;
	`;
	const delivered = await prisma.$queryRaw<any[]>`
		SELECT date_trunc('day', s."sentAt") as day, count(*)::int AS count
		FROM "Send" s
		WHERE s.status = 'SENT' AND s."sentAt" >= ${since}
		GROUP BY 1 ORDER BY 1 ASC;
	`;
	return { sends, delivered, opens, clicks };
}
export const getDashboardTimeseries = cache(_getDashboardTimeseries, ["dashboard:timeseries"], { tags: [ANALYTICS_TAG.DASHBOARD] });

async function _getErrorRate(workspaceId: string, days: number = 7) {
	const since = new Date(Date.now() - days * 24 * 3600 * 1000);
	const rows = await prisma.$queryRaw<any[]>`
		SELECT
			SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END)::int AS failed,
			COUNT(*)::int AS total
		FROM "Send"
		WHERE "createdAt" >= ${since};
	`;
	const { failed = 0, total = 0 } = rows[0] ?? {};
	return { failed, total, rate: total ? failed / total : 0 };
}
export const getErrorRate = cache(_getErrorRate, ["dashboard:errorRate"], { tags: [ANALYTICS_TAG.DASHBOARD] });

async function _getCapsUsedToday(workspaceId: string) {
	const since = new Date(); since.setHours(0,0,0,0);
	const rows = await prisma.$queryRaw<any[]>`
		SELECT a.id as "accountId", a."fromEmail", a."dailyCap", COALESCE(cnt.cnt,0)::int AS used
		FROM "EmailAccount" a
		LEFT JOIN (
			SELECT "emailAccountId", COUNT(*)::int AS cnt
			FROM "Send"
			WHERE "createdAt" >= ${since}
			GROUP BY 1
		) cnt ON cnt."emailAccountId" = a.id
		WHERE a."workspaceId" = ${workspaceId};
	`;
	return rows as { accountId: string; fromEmail: string; dailyCap: number; used: number }[];
}
export const getCapsUsedToday = cache(_getCapsUsedToday, ["dashboard:caps"], { tags: [ANALYTICS_TAG.DASHBOARD] });

export async function getSequenceFunnel(sequenceId: string) {
	const steps = await prisma.sequenceStep.findMany({ where: { sequenceId }, orderBy: { order: 'asc' } });
	const data = [] as { step: number; sent: number; opens: number; clicks: number }[];
	for (const st of steps) {
		const sent = await prisma.send.count({ where: { stepOrder: st.order, enrollment: { sequenceId } } });
		const opens = await prisma.event.count({ where: { type: 'OPEN', send: { enrollment: { sequenceId }, stepOrder: st.order } as any } });
		const clicks = await prisma.event.count({ where: { type: 'CLICK', send: { enrollment: { sequenceId }, stepOrder: st.order } as any } });
		data.push({ step: st.order, sent, opens, clicks });
	}
	return data;
}

async function _getTemplatePerformance(workspaceId: string) {
	const rows = await prisma.$queryRaw<any[]>`
		SELECT t.id, t.name,
			SUM(CASE WHEN e.type = 'OPEN' THEN 1 ELSE 0 END)::int AS opens,
			SUM(CASE WHEN e.type = 'CLICK' THEN 1 ELSE 0 END)::int AS clicks,
			COUNT(s.id)::int AS sent
		FROM "Template" t
		LEFT JOIN "SequenceStep" ss ON ss."templateId" = t.id
		LEFT JOIN "Send" s ON s."stepOrder" = ss."order"
		LEFT JOIN "Event" e ON e."sendId" = s.id
		WHERE t."workspaceId" = ${workspaceId}
		GROUP BY t.id, t.name
		ORDER BY sent DESC
		LIMIT 10;
	`;
	return rows as { id: string; name: string; sent: number; opens: number; clicks: number }[];
}
export const getTemplatePerformance = cache(_getTemplatePerformance, ["dashboard:templates"], { tags: [ANALYTICS_TAG.DASHBOARD] });
