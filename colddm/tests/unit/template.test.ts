import { describe, it, expect } from "vitest";
import { renderTemplate } from "../../lib/template";

describe("renderTemplate", () => {
	it("renders basic variables", () => {
		const result = renderTemplate("Hi {{firstName}}", { firstName: "John" });
		expect(result).toBe("Hi John");
	});

	it("handles fallback syntax", () => {
		const result = renderTemplate("Hi {{firstName||there}}", {});
		expect(result).toBe("Hi there");
	});

	it("handles dot notation", () => {
		const result = renderTemplate("Hi {{user.name}}", { user: { name: "Jane" } });
		expect(result).toBe("Hi Jane");
	});

	it("uses workspace defaults", () => {
		const result = renderTemplate("From {{company}}", {}, { company: "Acme" });
		expect(result).toBe("From Acme");
	});

	it("handles missing variables gracefully", () => {
		const result = renderTemplate("Hi {{missing}}", {});
		expect(result).toBe("Hi ");
	});

	it("handles empty values with fallback", () => {
		const result = renderTemplate("Hi {{firstName||Guest}}", { firstName: "" });
		expect(result).toBe("Hi Guest");
	});
});



