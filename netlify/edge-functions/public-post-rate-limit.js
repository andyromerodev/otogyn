export default async (_request, context) => context.next()

export const config = {
  path: [
    '/api/public/booking',
    '/api/public/pre-evaluacion',
    '/api/public/pre-evaluacion/upload',
  ],
  method: 'POST',
  rateLimit: {
    windowLimit: 6,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
}
