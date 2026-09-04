import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function driveApiDevPlugin(): Plugin {
  return {
    name: 'drive-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/drive-folder')) {
          const url = new URL(req.url, 'http://localhost');
          const folderId = url.searchParams.get('id');
          if (!folderId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Folder ID is required' }));
            return;
          }

          const env = loadEnv('development', process.cwd(), '');
          const apiKey = env.GOOGLE_API_KEY || env.VITE_GOOGLE_API_KEY;

          if (apiKey) {
            try {
              const query = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`);
              const gApiUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType)&pageSize=500&key=${apiKey}`;
              const apiRes = await fetch(gApiUrl);
              if (apiRes.ok) {
                const data: any = await apiRes.json();
                if (data.files && Array.isArray(data.files)) {
                  const images = data.files.map((file: any) => `https://lh3.googleusercontent.com/d/${file.id}=w1200`);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ images }));
                  return;
                }
              }
            } catch (err) {
              console.error('Local dev drive API error:', err);
            }
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), driveApiDevPlugin()],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
          }
        },
      },
    },
  },
})
