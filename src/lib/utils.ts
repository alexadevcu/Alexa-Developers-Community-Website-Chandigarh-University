export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  // Requires username, @, domain name, dot, and at least 2-letter TLD (e.g. name@example.com or student@cuchd.in)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};
