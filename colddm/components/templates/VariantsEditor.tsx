"use client";

import { useState } from "react";

export interface Variant {
	id: string;
	key: string;
	subject: string;
	body: string;
	trafficSplit: number;
	openRate?: number;
	clickRate?: number;
}

export function VariantsEditor({ initial, onChange }: { initial: Variant[]; onChange?: (v: Variant[]) => void }) {
	const [variants, setVariants] = useState<Variant[]>(initial);
	function update(id: string, patch: Partial<Variant>) {
		const next = variants.map((v) => (v.id === id ? { ...v, ...patch } : v));
		setVariants(next);
		onChange?.(next);
	}
	function add() {
		const id = `v-${Date.now()}`;
		const next = [...variants, { id, key: `B${variants.length}`, subject: "", body: "", trafficSplit: 50 }];
		setVariants(next); onChange?.(next);
	}
	function totalSplit() { return variants.reduce((s, v) => s + (v.trafficSplit || 0), 0); }

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h3 className="font-medium">Variants</h3>
				<button onClick={add} className="rounded bg-primary text-primary-foreground px-3 py-1 text-sm">Add</button>
			</div>
			<div className="text-xs text-muted-foreground">Traffic total: {totalSplit()} (aim for 100)</div>
			<div className="space-y-3">
				{variants.map((v) => (
					<div key={v.id} className="rounded border p-3 space-y-2">
						<div className="grid md:grid-cols-2 gap-2">
							<input className="rounded border px-2 py-1 bg-background" placeholder="Key" value={v.key} onChange={(e) => update(v.id, { key: e.target.value })} />
							<input className="rounded border px-2 py-1 bg-background" placeholder="Subject" value={v.subject} onChange={(e) => update(v.id, { subject: e.target.value })} />
						</div>
						<textarea className="w-full rounded border px-2 py-1 bg-background min-h-[120px]" placeholder="Body" value={v.body} onChange={(e) => update(v.id, { body: e.target.value })} />
						<div className="grid md:grid-cols-3 items-center gap-2">
							<label className="text-sm">Traffic: {v.trafficSplit}%</label>
							<input type="range" min={0} max={100} value={v.trafficSplit} onChange={(e) => update(v.id, { trafficSplit: Number(e.target.value) })} />
							<div className="text-xs text-muted-foreground">Open {Math.round((v.openRate ?? 0) * 100)}% · Click {Math.round((v.clickRate ?? 0) * 100)}%</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
