export function isValidEmail(email: string): boolean {
	if (!email) return false;
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email.trim());
}
