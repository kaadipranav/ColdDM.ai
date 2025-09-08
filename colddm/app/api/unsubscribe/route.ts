import { NextRequest, NextResponse } from "next/server";
import { applyUnsubscribeToken } from "../../../lib/unsubscribe";

export async function POST(req: NextRequest) {
	const { token } = await req.json();
	if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
	try {
		const res = await applyUnsubscribeToken(token);
		return NextResponse.json({ ok: true, ...res });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Invalid" }, { status: 400 });
	}
}
