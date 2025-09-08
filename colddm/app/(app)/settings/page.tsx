"use client";

import { useState } from "react";

export default function SettingsPage() {
	const [tab, setTab] = useState<"accounts" | "api" | "billing" | "compliance">("accounts");
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Settings</h1>
			<div className="flex gap-2 border-b">
				<TabButton active={tab === "accounts"} onClick={() => setTab("accounts")}>Email Accounts</TabButton>
				<TabButton active={tab === "api"} onClick={() => setTab("api")}>API Keys</TabButton>
				<TabButton active={tab === "billing"} onClick={() => setTab("billing")}>Billing</TabButton>
				<TabButton active={tab === "compliance"} onClick={() => setTab("compliance")}>Compliance</TabButton>
			</div>
			{tab === "accounts" && <AccountsTab />}
			{tab === "api" && <ApiKeysTab />}
			{tab === "billing" && <BillingTab />}
			{tab === "compliance" && <ComplianceTab />}
		</div>
	);
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
	return (
		<button onClick={onClick} className={`px-3 py-2 text-sm border-b-2 ${active ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>{children}</button>
	);
}

function AccountsTab() {
	const [accountId, setAccountId] = useState("");
	const [to, setTo] = useState("");
	const [result, setResult] = useState<string | null>(null);
	async function testSend() {
		setResult(null);
		const res = await fetch("/api/settings/email/test-send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountId, to }) });
		const json = await res.json();
		setResult(res.ok ? `Sent: ${json.providerMessageId}` : `Error: ${json.error}`);
	}
	return (
		<div className="space-y-3">
			<p className="text-sm text-muted-foreground">Connect Gmail, SES, or Mailgun. (UI placeholder)</p>
			<div className="grid md:grid-cols-3 gap-2 max-w-2xl">
				<input className="rounded border px-3 py-2 bg-background" placeholder="EmailAccount ID" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
				<input className="rounded border px-3 py-2 bg-background" placeholder="Send test to (your email)" value={to} onChange={(e) => setTo(e.target.value)} />
				<button onClick={testSend} className="rounded bg-primary text-primary-foreground px-4 py-2">Test send</button>
			</div>
			{result && <div className="text-sm">{result}</div>}
		</div>
	);
}

function ApiKeysTab() {
	return (
		<div className="space-y-3">
			<p className="text-sm text-muted-foreground">Create API keys to integrate with ColdDM.ai</p>
			<button className="rounded bg-primary text-primary-foreground px-4 py-2">New API Key</button>
			<div className="text-sm text-muted-foreground">No API keys yet.</div>
		</div>
	);
}

function BillingTab() {
	return (
		<div className="space-y-2">
			<p className="text-sm text-muted-foreground">Billing coming soon.</p>
		</div>
	);
}

function ComplianceTab() {
	return (
		<div className="space-y-3">
			<p className="text-sm">Include clear sender identity and one-click unsubscribe. Respect all opt-outs immediately.</p>
			<ul className="list-disc ml-6 text-sm text-muted-foreground">
				<li>Show legal company name and address or website in footer</li>
				<li>Include unsubscribe link in every email</li>
				<li>Honor CAN-SPAM / GDPR basics</li>
			</ul>
		</div>
	);
} 