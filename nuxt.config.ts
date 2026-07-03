// https://nuxt.com/docs/api/configuration/nuxt-config
const runtimeAuthUrl = process.env.AUTH_URL ?? 'http://localhost:3000'
const isProduction = process.env.NODE_ENV === 'production'

// CSP relajada en dev para permitir HMR de Vite y Nuxt Devtools.
// script-src necesita 'unsafe-inline' porque Nuxt SSR inyecta scripts inline
// (payload __NUXT__ y el bootstrap de color-mode) sin nonce configurado.
const contentSecurityPolicy = isProduction
  ? [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "worker-src 'self'",
      "manifest-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  : undefined

const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  ...(isProduction
    ? {
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        'Content-Security-Policy': contentSecurityPolicy!,
      }
    : {}),
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'theme-color', content: '#0f766e' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],
      link: [{ rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' }],
    },
  },
  routeRules: {
    '/**': { headers: securityHeaders },
    '/sw.js': {
      headers: {
        ...securityHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
    '/manifest.webmanifest': {
      headers: {
        ...securityHeaders,
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'no-cache',
      },
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'OtoGyn',
      short_name: 'OtoGyn',
      description: 'Gestión de clínica OtoGyn',
      lang: 'es',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      theme_color: '#0f766e',
      background_color: '#f5fcfb',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      // App SSR: no hay index.html precacheado; un navigateFallback rompería
      // los redirects de auth.
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,png,svg,ico,woff2}'],
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: ({ request, url, sameOrigin }) =>
            sameOrigin && request.mode === 'navigate' && !url.pathname.startsWith('/api/'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages',
            networkTimeoutSeconds: 3,
            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
          },
        },
        {
          // Allowlist de lectura: /api/auth/* y métodos no-GET nunca hacen match.
          urlPattern: ({ request, url, sameOrigin }) =>
            sameOrigin
            && request.method === 'GET'
            && /^\/api\/(appointments|patients|calendar\/(month|week|day)|dashboard\/summary|services)(\/|$)/.test(url.pathname),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-read',
            networkTimeoutSeconds: 5,
            // Datos de pacientes: expiración corta a propósito (menos PHI en reposo).
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
            cacheableResponse: { statuses: [200] },
          },
        },
      ],
    },
    devOptions: {
      enabled: false,
      type: 'module',
    },
  },
  runtimeConfig: {
    public: {
      authEnabled: Boolean(process.env.DATABASE_URL && process.env.AUTH_SECRET),
      authBaseURL: `${runtimeAuthUrl}/api/auth`,
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
