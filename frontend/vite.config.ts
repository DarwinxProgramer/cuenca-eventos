import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'LogoPrincipal.png'],
            manifest: {
                name: 'Cuenca Eventos',
                short_name: 'CuencaEventos',
                description: 'Tu guía de eventos culturales en Cuenca, Ecuador. Descubre festivales, conciertos y tradiciones.',
                theme_color: '#f97316',
                background_color: '#0f172a',
                display: 'standalone',
                orientation: 'any',
                scope: '/',
                start_url: '/',
                categories: ['entertainment', 'travel', 'lifestyle'],
                lang: 'es',
                icons: [
                    {
                        src: 'LogoPrincipal.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'LogoPrincipal.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'LogoPrincipal.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                screenshots: [
                    {
                        src: 'LogoPrincipal.png',
                        sizes: '512x512',
                        type: 'image/png',
                        form_factor: 'wide',
                        label: 'Cuenca Eventos - Versión Escritorio'
                    },
                    {
                        src: 'LogoPrincipal.png',
                        sizes: '512x512',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: 'Cuenca Eventos - Versión Móvil'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            },
            devOptions: {
                enabled: true
            }
        })
    ],
    server: {
        host: '0.0.0.0', // Required for Docker
        port: 5173,
        watch: {
            usePolling: true // Required for hot-reload in Docker on Windows
        }
    }
})
