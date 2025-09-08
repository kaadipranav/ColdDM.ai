"use client";

import { useMemo, useState } from "react";
import { renderTemplate } from "../../lib/template";
import { extractVariables } from "./variables";

export interface SampleLead {
	id: string;
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	company?: string | null;
	title?: string | null;
	custom?: Record<string, any> | null;
}

function coverageWarning(leads: SampleLead[], variables: string[]): string[] {
	const missing: string[] = [];
	for (const v of variables) {
		const presentInSome = leads.some((l) => {
			const parts = v.split(".");
			let curr: any = { ...l, ...(l.custom ?? {}) };
			for (const p of parts) {
				if (curr == null) return false;
				curr = curr[p];
			}
			return curr != null && String(curr).trim() !== "";
		});
		if (!presentInSome) missing.push(v);
	}
	return missing;
}

export function TemplatePreview({ subject, body, leads, workspaceDefaults }: { subject: string; body: string; leads: SampleLead[]; workspaceDefaults?: Record<string, any> }) {
	const [activeId, setActiveId] = useState<string | null>(leads[0]?.id ?? null);
	const active = leads.find((l) => l.id === activeId) ?? leads[0];
	const variables = useMemo(() => extractVariables(`${subject}\n${body}`), [subject, body]);
	const missingVars = useMemo(() => coverageWarning(leads, variables), [leads, variables]);

	const renderedSubject = useMemo(() => renderTemplate(subject, active, workspaceDefaults ?? {}), [subject, active, workspaceDefaults]);
	const renderedBody = useMemo(() => renderTemplate(body, active, workspaceDefaults ?? {}), [body, active, workspaceDefaults]);

	return (
		<div className="grid gap-3 md:grid-cols-3">
			<div className="md:col-span-1 border rounded">
				<div className="px-3 py-2 text-sm text-muted-foreground">Sample leads</div>
				<div className="max-h-64 overflow-auto text-sm">
					{leads.map((l) => (
						<button key={l.id} onClick={() => setActiveId(l.id)} className={`w-full text-left px-3 py-2 border-t first:border-t-0 ${active?.id === l.id ? "bg-muted/50" : "hover:bg-muted/30"}`}>
							<div className="font-medium">{l.firstName ?? "(no firstName)"} {l.lastName ?? ""}</div>
							<div className="text-xs text-muted-foreground">{l.email}</div>
						</button>
					))}
				</div>
			</div>
			<div className="md:col-span-2 space-y-3">
				{missingVars.length > 0 && (
					<div className="rounded border border-yellow-600/40 bg-yellow-500/10 text-yellow-700 px-3 py-2 text-sm">
						Missing in selected lead list: {missingVars.map((m) => `{{${m}}}`).join(", ")}
					</div>
				)}
				<div className="rounded border p-3">
					<div className="text-sm text-muted-foreground">Subject</div>
					<div className="font-medium">{renderedSubject}</div>
				</div>
				<div className="rounded border p-3">
					<div className="text-sm text-muted-foreground">Body</div>
					<pre className="whitespace-pre-wrap text-sm">{renderedBody}</pre>
				</div>
			</div>
		</div>
	);
}
