"use server";

import { prisma } from "../../lib/prisma";
import { validateCSVRow } from "../../lib/validation";
import { rateLimiters, checkRateLimit } from "../../lib/rate-limit";

export async function createLeadListAndInsert(workspaceId: string, name: string, leads: { email: string; firstName?: string | null; lastName?: string | null; company?: string | null; title?: string | null; custom?: any }[]) {
	// Rate limit CSV uploads
	const { success } = await checkRateLimit(rateLimiters.csvUpload, `upload:${workspaceId}`);
	if (!success) throw new Error("Rate limited");

	// Validate each lead
	const validLeads = [];
	const errors = [];
	for (const lead of leads) {
		const result = validateCSVRow(lead);
		if (result.success) {
			validLeads.push(result.data);
		} else {
			errors.push({ lead, error: result.error });
		}
	}

	if (validLeads.length === 0) throw new Error("No valid leads");
	const list = await prisma.leadList.create({ data: { workspaceId, name } });
	if (validLeads.length === 0) return { listId: list.id, inserted: 0, errors };
	// dedupe against existing by (leadListId, email) handled by unique constraint; use skipDuplicates
	const result = await prisma.lead.createMany({
		data: validLeads.map((l) => ({ ...l, leadListId: list.id })),
		skipDuplicates: true,
	});
	return { listId: list.id, inserted: result.count, errors };
}
