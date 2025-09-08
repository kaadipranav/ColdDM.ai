import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendEmail } from "../../lib/mail/TransportManager";
import { prisma } from "../../lib/prisma";

// Mock nodemailer
vi.mock("nodemailer", () => ({
	default: {
		createTransport: vi.fn(() => ({
			sendMail: vi.fn().mockResolvedValue({ messageId: "test-123" }),
			verify: vi.fn().mockResolvedValue(true),
		})),
	},
}));

// Mock prisma
vi.mock("../../lib/prisma", () => ({
	prisma: {
		emailAccount: {
			findUnique: vi.fn(),
		},
		send: {
			count: vi.fn(),
		},
	},
}));

describe("sendEmail integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("sends email with mock transport", async () => {
		const mockAccount = {
			id: "test-account",
			provider: "MAILGUN",
			fromEmail: "test@example.com",
			oauthJson: null,
		};

		vi.mocked(prisma.emailAccount.findUnique).mockResolvedValue(mockAccount as any);
		vi.mocked(prisma.send.count).mockResolvedValue(0);

		const result = await sendEmail({
			accountId: "test-account",
			from: "test@example.com",
			to: "recipient@example.com",
			subject: "Test",
			html: "<p>Test</p>",
		});

		expect(result.providerMessageId).toBe("test-123");
	});

	it("respects daily cap", async () => {
		const mockAccount = {
			id: "test-account",
			provider: "MAILGUN",
			fromEmail: "test@example.com",
			oauthJson: null,
			dailyCap: 100,
		};

		vi.mocked(prisma.emailAccount.findUnique).mockResolvedValue(mockAccount as any);
		vi.mocked(prisma.send.count).mockResolvedValue(100); // At cap

		await expect(
			sendEmail({
				accountId: "test-account",
				from: "test@example.com",
				to: "recipient@example.com",
				subject: "Test",
				html: "<p>Test</p>",
			})
		).rejects.toThrow("Daily cap exceeded");
	});
});




