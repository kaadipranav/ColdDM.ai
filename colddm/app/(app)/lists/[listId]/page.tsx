export default function ListDetailPage({ params }: { params: { listId: string } }) {
	return (
		<div className="space-y-2">
			<h1 className="text-xl font-semibold">List {params.listId}</h1>
			<p className="text-sm text-muted-foreground">This list is empty — import leads to see them here.</p>
		</div>
	);
}
