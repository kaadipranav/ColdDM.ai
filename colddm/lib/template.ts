type AnyRecord = Record<string, any>;

function getPath(obj: AnyRecord | undefined, path: string): any {
	if (!obj) return undefined;
	const parts = path.split(".");
	let curr: any = obj;
	for (const p of parts) {
		if (curr == null) return undefined;
		curr = curr[p];
	}
	return curr;
}

export function renderTemplate(
	body: string,
	lead: AnyRecord = {},
	workspaceDefaults: AnyRecord = {}
): string {
	if (!body) return "";
	// Replace tokens including fallback syntax {{key||fallback}}
	return body.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_m, inner) => {
		const [rawKey, ...fallbackParts] = String(inner).split("||");
		const key = rawKey.trim();
		const fallback = fallbackParts.join("||").trim();

		// Lookup order: lead direct, lead.custom, workspace defaults
		let value = getPath(lead, key);
		if (value === undefined) value = getPath(lead?.custom, key);
		if (value === undefined) value = getPath(workspaceDefaults, key);

		if (value === undefined || value === null || String(value).trim() === "") {
			return fallback || "";
		}
		return String(value);
	});
}
