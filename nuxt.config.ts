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
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  routeRules: {
    '/**': { headers: securityHeaders },
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
