import { describe, it, expect } from "vitest";
import { isValidEmail } from "../lib/email";

describe("isValidEmail", () => {
	it("validates common emails", () => {
		expect(isValidEmail("a@b.com")).toBe(true);
		expect(isValidEmail("first.last@domain.co.uk")).toBe(true);
	});
	it("rejects invalid emails", () => {
		expect(isValidEmail("")).toBe(false);
		expect(isValidEmail("notanemail")).toBe(false);
		expect(isValidEmail("a@b")).toBe(false);
	});
});
