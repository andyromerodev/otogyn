// Solo para el build de Cloudflare Workers (ver nitro.alias en nuxt.config.ts).
// El SDK de Resend importa @react-email/render de forma dinamica y solo lo usa al enviar
// componentes React. OtoGyn envia HTML, asi que esta funcion no se ejecuta.
export const render = (): never => {
  throw new Error('React email rendering is not available on Cloudflare Workers.')
}
