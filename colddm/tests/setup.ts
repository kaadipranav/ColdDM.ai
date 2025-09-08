import { beforeAll, afterAll } from "vitest";
import { prisma } from "../lib/prisma";

beforeAll(async () => {
	// Setup test database if needed
});

afterAll(async () => {
	await prisma.$disconnect();
});



