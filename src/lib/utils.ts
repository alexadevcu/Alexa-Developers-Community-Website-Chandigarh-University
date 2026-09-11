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

export const getEventWebsite = (event?: { website_url?: string | null; description?: string | null } | null): string | null => {
  if (!event) return null;
  if (event.website_url && typeof event.website_url === 'string' && event.website_url.trim()) {
    return event.website_url.trim();
  }
  if (event.description && typeof event.description === 'string') {
    const match = event.description.match(/<!--\s*website:\s*([^\s|>]+)(?:\s*\|\s*([^>]+))?\s*-->/i)
      || event.description.match(/<!--\s*website:\s*([^\s>]+)\s*-->/i)
      || event.description.match(/(?:🌐\s*)?Website:\s*(https?:\/\/[^\s]+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

export const getEventWebsiteLabel = (event?: { website_label?: string | null; website_url?: string | null; description?: string | null } | null): string => {
  if (!event) return 'Official Event Website';
  if (event.website_label && typeof event.website_label === 'string' && event.website_label.trim()) {
    return event.website_label.trim();
  }
  if (event.description && typeof event.description === 'string') {
    const match = event.description.match(/<!--\s*website:\s*[^\s|>]+(?:\s*\|\s*([^>]+))\s*-->/i)
      || event.description.match(/<!--\s*website_label:\s*([^>]+)\s*-->/i);
    if (match && match[1] && match[1].trim()) {
      return match[1].trim();
    }
  }
  return 'Official Event Website';
};

export const getCleanDescription = (description?: string | null): string => {
  if (!description) return '';
  return description
    .replace(/<!--\s*website:\s*[^>]+-->/gi, '')
    .replace(/<!--\s*website_label:\s*[^>]+-->/gi, '')
    .replace(/(?:🌐\s*)?Website:\s*https?:\/\/[^\s]+/gi, '')
    .trim();
};


