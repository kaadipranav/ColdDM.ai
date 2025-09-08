export const UPLOAD_LIMITS = {
	CSV_MAX_SIZE: 10 * 1024 * 1024, // 10MB
	CSV_MAX_ROWS: 10000,
	IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
	TEMPLATE_MAX_SIZE: 100 * 1024, // 100KB
} as const;

export function validateUploadSize(file: File, type: keyof typeof UPLOAD_LIMITS): boolean {
	const limit = UPLOAD_LIMITS[type];
	return file.size <= limit;
}

export function getUploadErrorMessage(type: keyof typeof UPLOAD_LIMITS): string {
	const limits = {
		CSV_MAX_SIZE: "CSV file too large (max 10MB)",
		CSV_MAX_ROWS: "Too many rows (max 10,000)",
		IMAGE_MAX_SIZE: "Image too large (max 5MB)",
		TEMPLATE_MAX_SIZE: "Template too large (max 100KB)",
	};
	return limits[type];
}

