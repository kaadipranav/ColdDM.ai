import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
	const body = await req.formData();
	const event = body.get("event")?.toString();
	const messageId = body.get("message-id")?.toString() ?? body.get("Message-Id")?.toString();
	const sendId = body.get("sendId")?.toString();
	if (event === "bounced" || event === "failed") {
		const sid = sendId ?? (messageId ?? "");
		if (sid) {
			await prisma.event.create({ data: { sendId: sid, type: "BOUNCE" as any, meta: Object.fromEntries(body.entries()) } }).catch(() => {});
		}
	}
	return NextResponse.json({ ok: true });
}
