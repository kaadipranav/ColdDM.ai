export function extractVariables(text: string): string[] {
	if (!text) return [];
	const matches = Array.from(text.matchAll(/\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}/g)).map((m) => m[1]);
	return Array.from(new Set(matches));
}

export function missingVariables(vars: string[], provided: Record<string, unknown>): string[] {
	return vars.filter((v) => !(v in provided));
} 