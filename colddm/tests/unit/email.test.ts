import { describe, it, expect } from "vitest";
import { isValidEmail } from "../../lib/email";

describe("isValidEmail", () => {
	it("validates common emails", () => {
		expect(isValidEmail("test@example.com")).toBe(true);
		expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
		expect(isValidEmail("user+tag@example.org")).toBe(true);
	});

	it("rejects invalid emails", () => {
		expect(isValidEmail("")).toBe(false);
		expect(isValidEmail("notanemail")).toBe(false);
		expect(isValidEmail("@example.com")).toBe(false);
		expect(isValidEmail("test@")).toBe(false);
		expect(isValidEmail("test@.com")).toBe(false);
		expect(isValidEmail(".test@example.com")).toBe(false);
	});

	it("handles edge cases", () => {
		expect(isValidEmail("test@example")).toBe(false);
		expect(isValidEmail("test@example.")).toBe(false);
		expect(isValidEmail("test@.example.com")).toBe(false);
	});
});




