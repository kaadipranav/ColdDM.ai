import { NextRequest, NextResponse } from "next/server";
import { handleInboundEmail } from "../../../lib/inbound";

export async function POST(req: NextRequest) {
	try {
		const payload = await req.json();
		await handleInboundEmail(payload);
		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Invalid" }, { status: 400 });
	}
}
