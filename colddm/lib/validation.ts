import { z } from "zod";

export const csvImportSchema = z.object({
	email: z.string().email(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	company: z.string().optional(),
	title: z.string().optional(),
	custom: z.record(z.any()).optional(),
});

export const templateSchema = z.object({
	name: z.string().min(1).max(100),
	subject: z.string().min(1).max(200),
	body: z.string().min(1).max(10000),
	variables: z.array(z.string()).optional(),
});

export const sequenceEnrollSchema = z.object({
	sequenceId: z.string().cuid(),
	leadIds: z.array(z.string().cuid()).min(1).max(1000),
});

export const sequenceControlSchema = z.object({
	sequenceId: z.string().cuid(),
	action: z.enum(["start", "pause", "stop"]),
});

export const aiGhostwriterSchema = z.object({
	persona: z.string().min(1).max(200),
	product: z.string().min(1).max(500),
	leadData: z.record(z.any()).optional(),
	tone: z.enum(["professional", "casual", "friendly", "urgent"]).optional(),
	cta: z.string().min(1).max(200),
	wordCount: z.number().min(50).max(1000).optional(),
	sentences: z.number().min(1).max(20).optional(),
	avoidSpam: z.boolean().optional(),
});

export const sendTestSchema = z.object({
	accountId: z.string().cuid(),
	to: z.string().email(),
});

export function validateCSVRow(row: Record<string, string>) {
	return csvImportSchema.safeParse(row);
}

export function validateTemplate(data: unknown) {
	return templateSchema.safeParse(data);
}

export function validateSequenceEnroll(data: unknown) {
	return sequenceEnrollSchema.safeParse(data);
}

export function validateSequenceControl(data: unknown) {
	return sequenceControlSchema.safeParse(data);
}

export function validateAIGhostwriter(data: unknown) {
	return aiGhostwriterSchema.safeParse(data);
}

export function validateSendTest(data: unknown) {
	return sendTestSchema.safeParse(data);
}

