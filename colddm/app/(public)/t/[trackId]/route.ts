import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { trackId: string } }) {
	const url = req.nextUrl.searchParams.get("url");
	if (!url) return NextResponse.redirect(new URL("/", req.url));
	try {
		await prisma.event.create({ data: { sendId: params.trackId, type: "CLICK" as any, meta: { url } } });
	} catch {}
	return NextResponse.redirect(url);
} 