"use client";

import { useState } from "react";
import { CsvUpload, type CsvRow } from "../../../../components/leads/CsvUpload";
import { isValidEmail } from "../../../../lib/email";

export default function NewListPage() {
	const [stage, setStage] = useState<"upload" | "importing" | "done">("upload");
	const [progress, setProgress] = useState(0);
	const [summary, setSummary] = useState<{ inserted: number; skipped: number; errorsUrl?: string } | null>(null);

	async function onMapped(rows: CsvRow[], mapping: Record<string, string>, custom: string[]) {
		setStage("importing");
		const emailsSeen = new Set<string>();
		const valid: any[] = [];
		const errors: string[] = [];
		for (const r of rows) {
			const email = r[mapping.email ?? "email"]?.trim();
			if (!email || !isValidEmail(email)) {
				errors.push(JSON.stringify({ row: r, reason: "invalid email" }));
				continue;
			}
			if (emailsSeen.has(email)) {
				errors.push(JSON.stringify({ row: r, reason: "duplicate in file" }));
				continue;
			}
			emailsSeen.add(email);
			valid.push({
				email,
				firstName: r[mapping.firstName ?? ""] ?? null,
				lastName: r[mapping.lastName ?? ""] ?? null,
				company: r[mapping.company ?? ""] ?? null,
				title: r[mapping.title ?? ""] ?? null,
				custom: Object.fromEntries(custom.map((h) => [h, r[h]])),
			});
		}
		const blob = new Blob([errors.join("\n")], { type: "text/plain" });
		const errorsUrl = errors.length ? URL.createObjectURL(blob) : undefined;
		// Simulate progress and call server action
		const batchSize = 200;
		let inserted = 0;
		for (let i = 0; i < valid.length; i += batchSize) {
			const batch = valid.slice(i, i + batchSize);
			// TODO: call server action
			await new Promise((r) => setTimeout(r, 50));
			inserted += batch.length;
			setProgress(Math.round((inserted / valid.length) * 100));
		}
		setSummary({ inserted, skipped: errors.length, errorsUrl });
		setStage("done");
	}

	return (
		<div className="space-y-4">
			<h1 className="text-xl font-semibold">Upload CSV</h1>
			{stage === "upload" && <CsvUpload onMapped={onMapped} />}
			{stage === "importing" && (
				<div className="space-y-2">
					<div className="h-2 bg-muted rounded">
						<div className="h-2 bg-primary rounded" style={{ width: `${progress}%` }} />
					</div>
					<div className="text-sm text-muted-foreground">Importing... {progress}%</div>
				</div>
			)}
			{stage === "done" && summary && (
				<div className="space-y-2 text-sm">
					<div>Inserted: {summary.inserted}</div>
					<div>Skipped: {summary.skipped}</div>
					{summary.errorsUrl && <a className="underline" href={summary.errorsUrl} download>Download error report</a>}
				</div>
			)}
		</div>
	);
}
