"use client";

import { useState } from "react";
import Papa from "papaparse";

export type CsvRow = Record<string, string>;

export function CsvUpload({ onMapped }: { onMapped: (rows: CsvRow[], mapping: Record<string, string>, custom: string[]) => void }) {
	const [preview, setPreview] = useState<CsvRow[]>([]);
	const [headers, setHeaders] = useState<string[]>([]);
	const [mappingOpen, setMappingOpen] = useState(false);
	const [parsing, setParsing] = useState(false);

	function onFile(file: File) {
		setParsing(true);
		Papa.parse<CsvRow>(file, {
			header: true,
			skipEmptyLines: true,
			complete: (res) => {
				const rows = (res.data as CsvRow[]).slice(0, 100);
				setPreview(rows);
				const cols = rows.length ? Object.keys(rows[0]) : (res.meta.fields ?? []);
				setHeaders(cols);
				setMappingOpen(true);
				setParsing(false);
			},
		});
	}

	return (
		<div className="space-y-3">
			<label className="inline-flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer">
				<input className="sr-only" type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
				<span>Upload CSV</span>
				{parsing && <span className="text-xs text-muted-foreground">Processing…</span>}
			</label>
			{preview.length > 0 && (
				<div className="border rounded">
					<div className="px-3 py-2 text-sm text-muted-foreground">Preview (first 100 rows)</div>
					<div className="max-h-64 overflow-auto text-xs">
						<table className="w-full">
							<thead>
								<tr>
									{headers.map((h) => <th key={h} className="text-left px-2 py-1 border-b">{h}</th>)}
								</tr>
							</thead>
							<tbody>
								{preview.map((r, i) => (
									<tr key={i}>
										{headers.map((h) => <td key={h} className="px-2 py-1 border-b">{r[h]}</td>)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
			{mappingOpen && (
				<MappingModal headers={headers} onClose={() => setMappingOpen(false)} onMap={(mapping, custom) => {
					setMappingOpen(false);
					onMapped(preview, mapping, custom);
				}} />
			)}
		</div>
	);
}

function MappingModal({ headers, onClose, onMap }: { headers: string[]; onClose: () => void; onMap: (mapping: Record<string,string>, custom: string[]) => void }) {
	const fields = ["email","firstName","lastName","company","title"];
	const [map, setMap] = useState<Record<string,string>>({});
	const [custom, setCustom] = useState<string[]>([]);
	const [submitting, setSubmitting] = useState(false);

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center">
			<div className="bg-card rounded shadow p-4 w-full max-w-lg space-y-3">
				<h3 className="font-medium">Map columns</h3>
				<div className="grid grid-cols-2 gap-2">
					{fields.map((f) => (
						<label key={f} className="text-sm">
							<div className="text-muted-foreground">{f}</div>
							<select className="w-full rounded border px-2 py-1 bg-background" value={map[f] ?? ""} onChange={(e) => setMap({ ...map, [f]: e.target.value })}>
								<option value="">—</option>
								{headers.map((h) => <option key={h} value={h}>{h}</option>)}
							</select>
						</label>
					))}
				</div>
				<div className="space-y-2">
					<div className="text-sm">Custom fields (optional)</div>
					<div className="flex flex-wrap gap-2">
						{headers.filter((h) => !Object.values(map).includes(h)).map((h) => (
							<label key={h} className="text-xs inline-flex items-center gap-1">
								<input type="checkbox" checked={custom.includes(h)} onChange={(e) => setCustom((arr) => e.target.checked ? [...arr, h] : arr.filter((x) => x !== h))} /> {h}
							</label>
						))}
					</div>
				</div>
				<div className="flex justify-end gap-2">
					<button className="rounded border px-3 py-1 disabled:opacity-50" onClick={onClose} disabled={submitting}>Cancel</button>
					<button className="rounded bg-primary text-primary-foreground px-3 py-1 disabled:opacity-50" onClick={() => { setSubmitting(true); onMap(map, custom); }} disabled={submitting}>
						{submitting ? "Continuing…" : "Continue"}
					</button>
				</div>
			</div>
		</div>
	);
}
