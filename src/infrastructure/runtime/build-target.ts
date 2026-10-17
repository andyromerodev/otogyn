// Destino de compilacion del servidor. `pnpm build:cf` (NITRO_PRESET=cloudflare_module) lo
// sustituye por `true` con nitro.replace en nuxt.config.ts. Netlify, nuxt dev y los tests no
// lo sustituyen, asi que la constante vale false. Nunca se lee process.env en runtime.
declare const __CLOUDFLARE_BUILD__: boolean | undefined

export const IS_CLOUDFLARE_BUILD: boolean =
  typeof __CLOUDFLARE_BUILD__ !== 'undefined' && __CLOUDFLARE_BUILD__ === true
