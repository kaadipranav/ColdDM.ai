"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

const items = [
	{ href: "/dashboard", label: "Dashboard" },
	{ href: "/leads", label: "Leads" },
	{ href: "/templates", label: "Templates" },
	{ href: "/sequences", label: "Sequences" },
	{ href: "/settings", label: "Settings" },
];

export function Sidebar() {
	const pathname = usePathname();
	return (
		<aside className="hidden md:flex md:w-64 border-r bg-card">
			<nav className="flex-1 p-4 space-y-1">
				{items.map((item) => (
					<Link key={item.href} href={item.href} className={cn(
						"block rounded-md px-3 py-2 text-sm",
						pathname?.startsWith(item.href) ? "bg-accent text-accent-foreground" : "hover:bg-muted"
					)}>
						{item.label}
					</Link>
				))}
			</nav>
		</aside>
	);
} 