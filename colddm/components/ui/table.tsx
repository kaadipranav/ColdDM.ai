import { cn } from "../../lib/utils";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
	return <table className={cn("w-full text-sm align-middle", className)} {...props} />;
}
export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
	return <thead {...props} />;
}
export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
	return <tbody {...props} />;
}
export function TR(props: React.HTMLAttributes<HTMLTableRowElement>) {
	return <tr className="border-b last:border-0 hover:bg-muted/40 transition-colors" {...props} />;
}
export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
	return <th className={cn("text-left py-2.5 px-3 text-muted-foreground", className)} {...props} />;
}
export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
	return <td className={cn("py-2.5 px-3", className)} {...props} />;
} 