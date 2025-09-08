import { test, expect } from "@playwright/test";

test.describe("Full ColdDM Flow", () => {
	test("complete user journey", async ({ page }) => {
		// Login
		await page.goto("/login");
		await page.fill('input[type="email"]', "test@example.com");
		await page.fill('input[type="password"]', "password123");
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL("/dashboard");

		// Create lead list
		await page.goto("/leads");
		await page.click("text=Upload CSV");
		await expect(page).toHaveURL("/lists/new");

		// Upload CSV (mock file)
		const csvContent = "email,firstName,company\ntest@example.com,John,Acme";
		await page.setInputFiles('input[type="file"]', {
			name: "leads.csv",
			mimeType: "text/csv",
			buffer: Buffer.from(csvContent),
		});

		// Wait for preview and mapping
		await expect(page.locator("text=Preview")).toBeVisible();
		await page.selectOption('select[name="email"]', "email");
		await page.selectOption('select[name="firstName"]', "firstName");
		await page.selectOption('select[name="company"]', "company");
		await page.click("text=Continue");

		// Create template
		await page.goto("/templates");
		await page.click("text=New");
		await page.fill('input[placeholder="Template name"]', "Test Template");
		await page.fill('input[placeholder="Subject"]', "Hi {{firstName}}");
		await page.fill('textarea[placeholder*="Body"]', "Hello {{firstName}} from {{company}}");
		await page.click("text=Save");

		// Create sequence
		await page.goto("/sequences");
		await page.click("text=New");
		await page.fill('input[placeholder="Sequence name"]', "Test Sequence");
		await page.click("text=Add step");
		await page.selectOption('select[name="template"]', "Test Template");
		await page.fill('input[name="waitHours"]', "24");
		await page.click("text=Save");

		// Enroll leads
		await page.goto("/sequences");
		await page.click("text=Enroll");
		await page.check('input[type="checkbox"]');
		await page.click("text=Enroll Selected");

		// Start sequence
		await page.click("text=Start");

		// Verify queued send
		await page.goto("/dashboard");
		await expect(page.locator("text=Today's scheduled sends")).toBeVisible();
		// Note: In a real test, you'd check the database for a queued Send record
	});
});



