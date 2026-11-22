import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
        port: 5173,
        strictPort: true,
        // Mesmo caminho de produção: /api/* vai para a API local (sem CORS nem cookie de outro site)
        proxy: {
            '/api': {
                target: process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
});
