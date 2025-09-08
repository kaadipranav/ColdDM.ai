import { describe, it, expect } from "vitest";
import { extractVariables, missingVariables } from "../../components/templates/variables";

describe("extractVariables", () => {
	it("extracts simple variables", () => {
		const result = extractVariables("Hi {{firstName}} from {{company}}");
		expect(result).toEqual(["firstName", "company"]);
	});

	it("handles whitespace", () => {
		const result = extractVariables("Hi {{ firstName }} from {{  company  }}");
		expect(result).toEqual(["firstName", "company"]);
	});

	it("deduplicates variables", () => {
		const result = extractVariables("Hi {{firstName}} {{firstName}}");
		expect(result).toEqual(["firstName"]);
	});

	it("handles dot notation", () => {
		const result = extractVariables("Hi {{user.name}} from {{user.company}}");
		expect(result).toEqual(["user.name", "user.company"]);
	});

	it("returns empty array for no variables", () => {
		const result = extractVariables("No variables here");
		expect(result).toEqual([]);
	});
});

describe("missingVariables", () => {
	it("finds missing variables", () => {
		const vars = ["firstName", "company"];
		const provided = { firstName: "John" };
		const result = missingVariables(vars, provided);
		expect(result).toEqual(["company"]);
	});

	it("handles dot notation", () => {
		const vars = ["user.name", "user.email"];
		const provided = { user: { name: "John" } };
		const result = missingVariables(vars, provided);
		expect(result).toEqual(["user.email"]);
	});

	it("returns empty when all provided", () => {
		const vars = ["firstName", "company"];
		const provided = { firstName: "John", company: "Acme" };
		const result = missingVariables(vars, provided);
		expect(result).toEqual([]);
	});
});




