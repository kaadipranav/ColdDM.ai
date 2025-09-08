import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window as any);

export function sanitizeHTML(html: string): string {
	return purify.sanitize(html, {
		ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "a", "ul", "ol", "li"],
		ALLOWED_ATTR: ["href", "target"],
		ALLOW_DATA_ATTR: false,
	});
}

export function sanitizeTemplatePreview(html: string): string {
	// More permissive for template previews but still safe
	return purify.sanitize(html, {
		ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "a", "ul", "ol", "li", "div", "span", "h1", "h2", "h3", "h4", "h5", "h6"],
		ALLOWED_ATTR: ["href", "target", "class", "style"],
		ALLOW_DATA_ATTR: false,
	});
}

