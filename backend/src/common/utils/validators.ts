export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+84|84|0)[0-9]{9}$/;
  return phoneRegex.test(phone);
}

export function isValidVietnameseId(id: string): boolean {
  return /^[0-9]{9,12}$/.test(id);
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

export function validatePaginationParams(page: number, limit: number): { page: number; limit: number } {
  return {
    page: Math.max(1, Math.floor(page)),
    limit: Math.min(100, Math.max(1, Math.floor(limit))),
  };
}
