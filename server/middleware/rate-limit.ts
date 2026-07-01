import { enforcePublicRateLimit } from '../utils/public-security'

const PUBLIC_RATE_LIMIT_BUCKETS: Record<string, Parameters<typeof enforcePublicRateLimit>[1]> = {
  'GET /api/public/security-token': 'public-token',
  'GET /api/public/services': 'public-services',
  'GET /api/public/slots': 'public-slots',
  'POST /api/public/booking': 'public-booking',
  'POST /api/public/pre-evaluacion': 'public-pre-evaluation',
  'POST /api/public/pre-evaluacion/upload': 'public-pre-evaluation-upload',
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/public/')) return

  const method = getMethod(event)
  const bucket = PUBLIC_RATE_LIMIT_BUCKETS[`${method} ${url.pathname}`]

  if (bucket) {
    await enforcePublicRateLimit(event, bucket)
  }
})
