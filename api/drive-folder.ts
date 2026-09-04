export default async function handler(req: any, res: any) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Folder ID is required' });
  }

  // Server-side private API key (never exposed to the browser)
  const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;

  // 1. If Google API Key is set in server environment, use Drive API v3
  if (apiKey) {
    try {
      const query = encodeURIComponent(`'${id}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`);
      const gApiUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType)&pageSize=500&key=${apiKey}`;
      const apiRes = await fetch(gApiUrl);
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.files && Array.isArray(data.files) && data.files.length > 0) {
          const images = data.files.map((file: any) => `https://lh3.googleusercontent.com/d/${file.id}=w1200`);
          res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
          return res.status(200).json({ images });
        }
      }
    } catch (err: any) {
      console.error("Google Drive API v3 failed in serverless handler:", err);
    }
  }

  // 2. Fallback: Parse embedded folder view
  try {
    const targetUrl = `https://drive.google.com/embeddedfolderview?id=${id}#grid`;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch drive folder' });
    }

    const html = await response.text();
    const fileIds = new Set<string>();
    const idMatches = html.matchAll(/["']([a-zA-Z0-9_-]{28,45})["']/g);
    for (const match of idMatches) {
      const fId = match[1];
      if (fId && fId !== id && !fId.includes('http') && !fId.includes('google')) {
        fileIds.add(fId);
      }
    }

    const images = Array.from(fileIds).map(fId => `https://lh3.googleusercontent.com/d/${fId}=w1200`);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({ images });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
