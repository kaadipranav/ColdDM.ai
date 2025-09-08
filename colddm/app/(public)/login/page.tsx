"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [mode, setMode] = useState<"login" | "signup">("login");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			if (mode === "login") {
				const res = await signIn("credentials", { email, password, redirect: true, callbackUrl: "/dashboard" });
				if (res?.error) setError(res.error);
			} else {
				const resp = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
				if (!resp.ok) throw new Error("Signup failed");
				await signIn("credentials", { email, password, redirect: true, callbackUrl: "/dashboard" });
			}
		} catch (err: any) {
			setError(err.message ?? "Error");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-sm mx-auto mt-16 space-y-4">
			<h1 className="text-xl font-semibold">{mode === "login" ? "Log in" : "Sign up"}</h1>
			<form onSubmit={onSubmit} className="space-y-3">
				<input className="w-full rounded border px-3 py-2 bg-background" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
				<input className="w-full rounded border px-3 py-2 bg-background" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				<button disabled={loading} className="w-full rounded bg-primary text-primary-foreground py-2">{loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}</button>
			</form>
			{error && <p className="text-sm text-red-500">{error}</p>}
			<div className="flex items-center gap-2 text-sm"><span>or</span><button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="underline">Continue with Google</button></div>
			<button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-sm underline">
				{mode === "login" ? "Create an account" : "Have an account? Log in"}
			</button>
		</div>
	);
} 