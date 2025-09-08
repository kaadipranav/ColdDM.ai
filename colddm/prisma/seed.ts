import { PrismaClient, Provider, SequenceStatus, EnrollmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	// Workspace & User
	const workspace = await prisma.workspace.create({
		data: { name: "Demo Workspace" },
	});
	const user = await prisma.user.create({
		data: { email: "demo@example.com", name: "Demo User" },
	});
	await prisma.membership.create({
		data: { userId: user.id, workspaceId: workspace.id, role: "OWNER" as any },
	});

	// Email Account
	const account = await prisma.emailAccount.create({
		data: {
			workspaceId: workspace.id,
			provider: Provider.MAILGUN,
			fromName: "Demo",
			fromEmail: "demo@colddm.ai",
			dailyCap: 150,
			warmupStatus: "warm",
		},
	});

	// Lead List + Leads
	const list = await prisma.leadList.create({
		data: { workspaceId: workspace.id, name: "Demo Leads" },
	});
	const leads = await prisma.$transaction(
		[1, 2, 3, 4, 5].map((i) =>
			prisma.lead.create({
				data: {
					leadListId: list.id,
					email: `lead${i}@example.com`,
					firstName: `Lead${i}`,
					lastName: "Test",
					company: "Acme Co",
					title: "Engineer",
					custom: { source: "seed" },
				},
			})
		)
	);

	// Template
	const template = await prisma.template.create({
		data: {
			workspaceId: workspace.id,
			name: "Intro Email",
			subject: "Quick question for {{firstName}}",
			body: "Hi {{firstName}},\n\nI loved what {{company}} is building. — Demo",
			variables: ["firstName", "company"],
		},
	});

	// Sequence + Step
	const sequence = await prisma.sequence.create({
		data: {
			workspaceId: workspace.id,
			name: "Demo Sequence",
			status: SequenceStatus.ACTIVE,
		},
	});
	await prisma.sequenceStep.create({
		data: { sequenceId: sequence.id, order: 1, waitHours: 0, templateId: template.id },
	});

	// Enroll first 3 leads
	for (const lead of leads.slice(0, 3)) {
		await prisma.enrollment.create({
			data: {
				sequenceId: sequence.id,
				leadId: lead.id,
				status: EnrollmentStatus.ACTIVE,
				nextStepOrder: 1,
				nextSendAt: new Date(Date.now() + 5 * 60 * 1000),
			},
		});
	}

	console.log("Seed complete:", { workspace: workspace.id, user: user.id, list: list.id });
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	}); 