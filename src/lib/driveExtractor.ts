/**
 * Extracts individual photo URLs from a public Google Drive folder link or folder ID.
 */

export const extractFolderId = (urlOrId: string): string | null => {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  
  // Direct folder ID (25+ alphanumeric/dash/underscore characters without slashes)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed) && !trimmed.includes('/')) {
    return trimmed;
  }
  
  // URL matching: /folders/ID or ?id=ID
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

export const fetchDriveFolderImages = async (folderUrlOrId: string): Promise<string[]> => {
  const folderId = extractFolderId(folderUrlOrId);
  if (!folderId) return [];

  // 1. Try serverless API route (/api/drive-folder) where GOOGLE_API_KEY is securely kept on server
  try {
    const apiRes = await fetch(`/api/drive-folder?id=${folderId}`);
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        return data.images;
      }
    }
  } catch {
    // Continue to client fallback
  }

  // 2. Client-side fallback if VITE_GOOGLE_API_KEY is available (e.g. local development)
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_API_KEY;
  if (apiKey) {
    try {
      // Query for image files or non-folder files inside this public folder
      const query = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`);
      const gApiUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType)&pageSize=500&key=${apiKey}`;
      const res = await fetch(gApiUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.files && Array.isArray(data.files) && data.files.length > 0) {
          return data.files.map((file: any) => {
            return `https://lh3.googleusercontent.com/d/${file.id}=w1200`;
          });
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn("Google Drive API response error:", res.status, errData);
      }
    } catch (err) {
      console.warn("Google Drive API v3 fetch failed:", err);
    }
  }

  // 2. Serverless / Proxy Fallback
  const targetUrl = `https://drive.google.com/drive/folders/${folderId}`;
  const proxies = [
    `/api/drive-folder?id=${folderId}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
  ];

  let html = '';
  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy, { headers: { Accept: 'text/html,application/json' } });
      if (res.ok) {
        const text = await res.text();
        // Ensure it's not the SPA index.html fallback
        if (text && text.length > 500 && !text.includes('<div id="root">') && text.includes('google')) {
          html = text;
          break;
        }
      }
    } catch {
      // Try next proxy
    }
  }

  if (!html) return [];

  const fileIds = new Set<string>();

  // Extract any 28-45 char Google Drive IDs embedded in script tags
  const idMatches = html.matchAll(/["']([a-zA-Z0-9_-]{28,45})["']/g);
  for (const match of idMatches) {
    const id = match[1];
    if (id && id !== folderId && !id.includes('http') && !id.includes('google')) {
      fileIds.add(id);
    }
  }

  return Array.from(fileIds).map(id => `https://lh3.googleusercontent.com/d/${id}=w1200`);
};
