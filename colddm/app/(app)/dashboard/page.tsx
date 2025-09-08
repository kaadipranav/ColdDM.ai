import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export default async function DashboardPage() {
	// Sample data; replace with real queries later
	const todayScheduled = 42;
	const deliverability = { openRate: 0.42, clickRate: 0.07 };
	const errorRate = 0.01;

	return (
		<div className="grid gap-4 md:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle>Today’s scheduled sends</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-semibold">{todayScheduled}</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Deliverability (7d)</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-sm">Open rate</div>
					<div className="text-2xl">{Math.round(deliverability.openRate * 100)}%</div>
					<div className="mt-2 text-sm">Click rate</div>
					<div className="text-2xl">{Math.round(deliverability.clickRate * 100)}%</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Error rate</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-semibold">{(errorRate * 100).toFixed(1)}%</div>
				</CardContent>
			</Card>
		</div>
	);
} 