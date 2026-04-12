import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Wisconsin Asian Hub',
        short_name: 'WI Asian Hub',
        description: 'Wisconsin Asian Community Directory & Resource Hub',
        theme_color: '#B91C1C',
        background_color: '#1a1714',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Never cache admin or anthem pages
        navigateFallbackDenylist: [/^\/admin/, /^\/anthem/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/docs\.google\.com\/spreadsheets/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-sheets-cache',
              expiration: { maxAgeSeconds: 60 * 60 }
            }
          }
        ]
      }
    })
  ]
})
