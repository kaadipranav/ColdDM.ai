"use client";

import { useState, useMemo } from "react";
import { extractVariables } from "./variables";

export function TemplateEditor({ initial }: { initial?: { name?: string; subject?: string; body?: string } }) {
	const [name, setName] = useState(initial?.name ?? "");
	const [subject, setSubject] = useState(initial?.subject ?? "");
	const [body, setBody] = useState(initial?.body ?? "");
	const vars = useMemo(() => extractVariables(`${subject}\n${body}`), [subject, body]);

	return (
		<div className="grid gap-4 md:grid-cols-3">
			<div className="md:col-span-2 space-y-3">
				<input className="w-full rounded border px-3 py-2 bg-background" placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} />
				<input className="w-full rounded border px-3 py-2 bg-background" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
				<textarea className="w-full min-h-[240px] rounded border px-3 py-2 bg-background" placeholder="Body (supports {{variables}})" value={body} onChange={(e) => setBody(e.target.value)} />
				<div className="flex gap-2">
					<button className="rounded bg-primary text-primary-foreground px-4 py-2">Save</button>
					<button className="rounded border px-4 py-2">Preview</button>
				</div>
			</div>
			<aside className="space-y-3">
				<div>
					<h3 className="font-medium">Variables</h3>
					{vars.length === 0 ? (
						<p className="text-sm text-muted-foreground">No variables detected.</p>
					) : (
						<ul className="mt-1 space-y-1 text-sm">
							{vars.map((v) => (
								<li key={v}><code>{`{{${v}}}`}</code></li>
							))}
						</ul>
					)}
				</div>
				<div>
					<h3 className="font-medium">Tips</h3>
					<p className="text-sm text-muted-foreground">Use concise subjects and keep body under 150 words.</p>
				</div>
			</aside>
		</div>
	);
} 