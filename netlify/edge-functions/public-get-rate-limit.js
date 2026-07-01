export default async (_request, context) => context.next()

export const config = {
  path: [
    '/api/public/security-token',
    '/api/public/services',
    '/api/public/slots',
  ],
  method: 'GET',
  rateLimit: {
    windowLimit: 45,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
}
