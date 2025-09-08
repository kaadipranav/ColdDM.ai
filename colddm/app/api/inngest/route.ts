// Temporary stub to avoid missing @inngest/next package during install.
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ status: "ok" });
}

export const POST = GET;
export const PUT = GET;
