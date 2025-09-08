"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "../../../components/ui/table";
import { useHotkeys } from "../../../components/hooks/use-hotkeys";
import { TemplateEditor } from "../../../components/templates/TemplateEditor";

export default function TemplatesPage() {
	const [templates, setTemplates] = useState([
		{ id: "t1", name: "Intro Email", subject: "Quick question for {{firstName}}", body: "Hi {{firstName}},\n\nI loved what {{company}} is building. — Demo" },
	]);
	const [activeId, setActiveId] = useState<string | null>(null);
	useHotkeys(() => onNew());

	function onNew() {
		const id = `tmp-${Date.now()}`;
		setTemplates((t) => [{ id, name: "New Template", subject: "", body: "" }, ...t]);
		setActiveId(id);
	}

	const active = templates.find((t) => t.id === activeId) ?? undefined;

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h1 className="text-xl font-semibold">Templates</h1>
				<button onClick={onNew} className="rounded bg-primary text-primary-foreground px-4 py-2">New</button>
			</div>
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="md:col-span-1">
					<CardHeader><CardTitle>List</CardTitle></CardHeader>
					<CardContent>
						{templates.length === 0 ? (
							<div className="text-sm text-muted-foreground">No templates yet — press N or click New.</div>
						) : (
							<Table>
								<THead>
									<TR>
										<TH>Name</TH>
									</TR>
								</THead>
								<TBody>
									{templates.map((t) => (
										<TR key={t.id} onClick={() => setActiveId(t.id)} className="cursor-pointer hover:bg-muted/50">
											<TD>{t.name}</TD>
										</TR>
									))}
								</TBody>
							</Table>
						)}
					</CardContent>
				</Card>
				<Card className="md:col-span-2">
					<CardHeader><CardTitle>Editor</CardTitle></CardHeader>
					<CardContent>
						<TemplateEditor initial={active} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
} 