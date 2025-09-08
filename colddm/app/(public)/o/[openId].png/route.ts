import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const png1x1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=", "base64");

export async function GET(_req: NextRequest, { params }: { params: { "openId.png": string } }) {
	const openId = params["openId.png"].replace(/\.png$/i, "");
	try {
		await prisma.event.create({ data: { sendId: openId, type: "OPEN" as any } });
		await prisma.send.update({ where: { id: openId }, data: { status: "DELIVERED" as any } }).catch(() => {});
	} catch {}
	return new NextResponse(png1x1, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
			Pragma: "no-cache",
			Expires: "0",
		},
	});
} 