"use client";

import { useState } from "react";

interface Props { params: { token: string } }

export default function UnsubscribePage({ params }: Props) {
	const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
	async function confirm() {
		try {
			const res = await fetch("/api/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.token }) });
			if (!res.ok) throw new Error();
			setStatus("done");
		} catch {
			setStatus("error");
		}
	}
	return (
		<div className="max-w-md mx-auto mt-16 space-y-4">
			<h1 className="text-xl font-semibold">Unsubscribe</h1>
			{status === "idle" && (
				<div className="space-y-3">
					<p className="text-sm text-muted-foreground">Confirm to stop receiving emails from this sender.</p>
					<button className="rounded bg-primary text-primary-foreground px-4 py-2" onClick={confirm}>Confirm unsubscribe</button>
				</div>
			)}
			{status === "done" && <p className="text-sm">You have been unsubscribed. Sorry to see you go.</p>}
			{status === "error" && <p className="text-sm text-red-500">Invalid or expired link.</p>}
		</div>
	);
} 