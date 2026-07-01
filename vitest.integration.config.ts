import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import { defineConfig } from 'vitest/config'

// Tests de integracion: golpean una base de datos real (TEST_DATABASE_URL, una
// Neon branch dedicada sin datos reales) y, para los smoke tests HTTP, un
// servidor Nitro real via @nuxt/test-utils. Separados del `pnpm test` normal
// porque requieren red y son mas lentos.
export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['**/*.integration.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
})
