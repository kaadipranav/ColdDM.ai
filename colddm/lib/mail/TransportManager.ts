import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { prisma } from "../../lib/prisma";
import { Provider } from "@prisma/client";

export type SendInput = {
	accountId: string;
	from: string;
	to: string;
	subject: string;
	html: string;
	headers?: Record<string, string>;
};

export async function sendEmail(input: SendInput): Promise<{ providerMessageId: string }> {
	const account = await prisma.emailAccount.findUnique({ where: { id: input.accountId } });
	if (!account) throw new Error("Email account not found");

	await enforceDailyCap(account.id, account.dailyCap);

	const transporter = await buildTransport(account);
	const info = await transporter.sendMail({
		from: input.from,
		to: input.to,
		subject: input.subject,
		html: input.html,
		headers: input.headers,
	});
	const providerMessageId = info.messageId ?? (info as any).response ?? "";
	return { providerMessageId };
}

async function buildTransport(account: { provider: Provider; oauthJson: any | null; fromEmail: string }): Promise<Transporter> {
	switch (account.provider) {
		case "GMAIL":
			return gmailOAuthTransport(account);
		case "SES":
			return sesSmtpTransport();
		case "MAILGUN":
			return mailgunSmtpTransport();
		default:
			return genericSmtpTransport();
	}
}

async function gmailOAuthTransport(account: { oauthJson: any | null; fromEmail: string }) {
	if (!account.oauthJson) throw new Error("Missing Gmail OAuth credentials");
	const { clientId, clientSecret, refreshToken } = account.oauthJson;
	return nodemailer.createTransport({
		service: "gmail",
		auth: { type: "OAuth2", user: account.fromEmail, clientId, clientSecret, refreshToken },
	} as SMTPTransport.Options);
}

function sesSmtpTransport() {
	return nodemailer.createTransport({
		host: process.env.MAIL_SES_HOST ?? "email-smtp." + (process.env.SES_REGION ?? "us-east-1") + ".amazonaws.com",
		port: Number(process.env.MAIL_SES_PORT ?? 587),
		secure: false,
		auth: { user: process.env.SES_ACCESS_KEY_ID, pass: process.env.SES_SECRET_ACCESS_KEY },
	} as SMTPTransport.Options);
}

function mailgunSmtpTransport() {
	return nodemailer.createTransport({
		host: process.env.MAILGUN_SMTP_HOST,
		port: Number(process.env.MAILGUN_SMTP_PORT ?? 587),
		secure: false,
		auth: { user: process.env.MAILGUN_SMTP_USER, pass: process.env.MAILGUN_SMTP_PASS },
	} as SMTPTransport.Options);
}

function genericSmtpTransport() {
	return nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT ?? 587),
		secure: false,
		auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
	} as SMTPTransport.Options);
}

async function enforceDailyCap(providerAccountId: string, dailyCap: number) {
	// Simplified: count sends today from DB; block if exceeded
	const since = new Date();
	since.setHours(0, 0, 0, 0);
	const count = await prisma.send.count({
		where: { emailAccountId: providerAccountId, createdAt: { gte: since } },
	});
	if (count >= dailyCap) throw new Error("Daily cap exceeded");
}

export async function healthCheck(accountId: string): Promise<{ ok: boolean; error?: string }> {
	try {
		const account = await prisma.emailAccount.findUnique({ where: { id: accountId } });
		if (!account) return { ok: false, error: "Account not found" };
		const transporter = await buildTransport(account);
		await transporter.verify();
		return { ok: true };
	} catch (e: any) {
		return { ok: false, error: e?.message ?? String(e) };
	}
}
