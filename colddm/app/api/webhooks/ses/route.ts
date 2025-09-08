import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
	try {
		const json = await req.json();
		const notificationType = json?.notificationType ?? json?.Type;
		if (notificationType === "Bounce" || json?.bounce) {
			const messageId = json?.mail?.messageId ?? json?.MessageId ?? "";
			const sendId = json?.sendId ?? messageId;
			if (sendId) await prisma.event.create({ data: { sendId, type: "BOUNCE" as any, meta: json } }).catch(() => {});
		}
	} catch {}
	return NextResponse.json({ ok: true });
}
