import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "../../../components/ui/table";

export default async function LeadsPage() {
	// Sample lead lists
	const lists = [
		{ id: "1", name: "Demo Leads", rowCount: 5, createdAt: new Date(), lastEvent: "BOUNCE" as const },
	];

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h1 className="text-xl font-semibold">Lead Lists</h1>
				<Link href="/lists/new" className="rounded bg-primary text-primary-foreground px-4 py-2">Upload CSV</Link>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Lists</CardTitle>
				</CardHeader>
				<CardContent>
					{lists.length === 0 ? (
						<div className="text-sm text-muted-foreground">No lists yet — upload a CSV to get started.</div>
					) : (
						<Table>
							<THead>
								<TR>
									<TH>Name</TH>
									<TH>Rows</TH>
									<TH>Created</TH>
									<TH>Last event</TH>
									<TH></TH>
								</TR>
							</THead>
							<TBody>
								{lists.map((l) => (
									<TR key={l.id}>
										<TD>{l.name}</TD>
										<TD>{l.rowCount}</TD>
										<TD>{l.createdAt.toLocaleDateString()}</TD>
										<TD>{l.lastEvent ? <span className={`inline-block rounded px-2 py-0.5 text-xs ${l.lastEvent === "BOUNCE" ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600"}`}>{l.lastEvent}</span> : <span className="text-xs text-muted-foreground">—</span>}</TD>
										<TD className="text-right"><Link className="underline" href={`/lists/${l.id}`}>View</Link></TD>
									</TR>
								))}
							</TBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
} 