export interface InboundEmail {
	from: string;
	to: string;
	subject?: string;
	text?: string;
	html?: string;
	headers?: Record<string, string>;
}

export async function handleInboundEmail(_email: InboundEmail): Promise<void> {
	// TODO: Parse references and correlate to Send/Lead for reply tracking
	// MVP stub: no-op
}
