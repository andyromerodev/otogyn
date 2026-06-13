// https://nuxt.com/docs/api/configuration/nuxt-config
const runtimeAuthUrl = process.env.AUTH_URL ?? 'http://localhost:3000'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
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
