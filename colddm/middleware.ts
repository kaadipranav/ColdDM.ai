import { auth } from "./lib/auth-middleware";
import { NextResponse } from "next/server";

export default auth((req) => {
	const { nextUrl } = req;
	const isAuth = !!req.auth;
	const isLogin = nextUrl.pathname.startsWith("/login");
	const protectedPaths = [
		"/dashboard",
		"/leads",
		"/templates",
		"/sequences",
		"/settings",
	];
	const isProtected = protectedPaths.some((p) => nextUrl.pathname.startsWith(p));
	if (isProtected && !isAuth) {
		const url = new URL("/login", nextUrl.origin);
		url.searchParams.set("from", nextUrl.pathname);
		return NextResponse.redirect(url);
	}
	if (isLogin && isAuth) {
		return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
	}
	return NextResponse.next();
});

export const config = {
	matcher: ["/((?!_next|api/t|api/o|t/|o/|favicon.ico|.*\\.png$).*)"],
};