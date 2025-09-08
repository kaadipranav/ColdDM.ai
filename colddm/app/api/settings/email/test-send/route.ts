import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "../../../../../lib/mail/TransportManager";
import { validateSendTest } from "../../../../../lib/validation";
import { rateLimiters, checkRateLimit } from "../../../../../lib/rate-limit";

export async function POST(req: NextRequest) {
	const ip = req.ip ?? "unknown";
	const { success } = await checkRateLimit(rateLimiters.sendTrigger, `test:${ip}`);
	if (!success) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

	const body = await req.json();
	const result = validateSendTest(body);
	if (!result.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
	const { accountId, to } = result.data;
	const res = await sendEmail({ accountId, from: to, to, subject: "Test from ColdDM.ai", html: "<p>Test OK</p>" });
	return NextResponse.json({ ok: true, providerMessageId: res.providerMessageId });
}
