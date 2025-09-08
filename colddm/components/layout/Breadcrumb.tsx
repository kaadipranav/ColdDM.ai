import Link from "next/link";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
	return (
		<nav className="text-sm text-muted-foreground">
			<ol className="flex items-center gap-2">
				{items.map((item, i) => (
					<li key={i} className="flex items-center gap-2">
						{item.href ? <Link className="hover:underline" href={item.href}>{item.label}</Link> : <span className="text-foreground">{item.label}</span>}
						{i < items.length - 1 && <span>/</span>}
					</li>
				))}
			</ol>
		</nav>
	);
} 