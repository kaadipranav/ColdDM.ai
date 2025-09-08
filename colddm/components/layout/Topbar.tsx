"use client";

import Link from "next/link";
import { Breadcrumb } from "./Breadcrumb";

export function Topbar() {
	return (
		<header className="h-12 border-b flex items-center px-4 justify-between bg-background/60 backdrop-blur">
			<div className="flex items-center gap-3">
				<button className="md:hidden rounded border px-2 py-1 text-sm">Menu</button>
				<Link href="/" className="font-semibold">ColdDM.ai</Link>
				<div className="hidden md:block">
					<Breadcrumb items={[{ label: "Home", href: "/dashboard" }]} />
				</div>
			</div>
			<div className="text-sm text-muted-foreground">MVP</div>
		</header>
	);
} 