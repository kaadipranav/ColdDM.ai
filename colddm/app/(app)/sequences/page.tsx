"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "../../../components/ui/table";

interface Step { order: number; waitHours: number; templateName: string }
interface Seq { id: string; name: string; status: string; steps: Step[] }

export default function SequencesPage() {
	const [sequences, setSequences] = useState<Seq[]>([
		{ id: "s1", name: "Demo Sequence", status: "ACTIVE", steps: [{ order: 1, waitHours: 0, templateName: "Intro Email" }] },
	]);
	const [activeId, setActiveId] = useState<string | null>("s1");
	const active = sequences.find((s) => s.id === activeId) ?? sequences[0];

	function addStep() {
		setSequences((prev) => prev.map((s) => s.id !== active.id ? s : ({
			...s,
			steps: [...s.steps, { order: s.steps.length + 1, waitHours: 24, templateName: "Intro Email" }],
		})));
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h1 className="text-xl font-semibold">Sequences</h1>
				<button className="rounded bg-primary text-primary-foreground px-4 py-2">New</button>
			</div>
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader><CardTitle>List</CardTitle></CardHeader>
					<CardContent>
						<Table>
							<THead>
								<TR><TH>Name</TH><TH>Status</TH></TR>
							</THead>
							<TBody>
								{sequences.map((s) => (
									<TR key={s.id} onClick={() => setActiveId(s.id)} className="cursor-pointer hover:bg-muted/50">
										<TD>{s.name}</TD>
										<TD>{s.status}</TD>
									</TR>
								))}
							</TBody>
						</Table>
					</CardContent>
				</Card>
				<Card className="md:col-span-2">
					<CardHeader><CardTitle>Builder</CardTitle></CardHeader>
					<CardContent>
						<div className="space-y-3">
							{active?.steps?.length ? (
								<Table>
									<THead><TR><TH>Order</TH><TH>Wait (hours)</TH><TH>Template</TH></TR></THead>
									<TBody>
										{active.steps.map((st) => (
											<TR key={st.order}>
												<TD>{st.order}</TD>
												<TD>{st.waitHours}</TD>
												<TD>{st.templateName}</TD>
											</TR>
										))}
									</TBody>
								</Table>
							) : (
								<div className="text-sm text-muted-foreground">No steps yet. Add your first step.</div>
							)}
							<button onClick={addStep} className="rounded bg-primary text-primary-foreground px-4 py-2">Add step</button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
} 