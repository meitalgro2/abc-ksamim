import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/abc-ksamim/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'ABC קסמים',
        short_name: 'ABC קסמים',
        description: 'מתכוננים למבדק באנגלית ולומדים את צלילי האותיות',
        lang: 'he',
        dir: 'rtl',
        start_url: '/abc-ksamim/',
        scope: '/abc-ksamim/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#eef6ff',
        theme_color: '#3a7bd5',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
    }),
  ],
  test: { environment: 'node' },
});
