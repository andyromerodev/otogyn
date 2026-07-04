// Cliente de la API CIE-11 de la OMS.
// El token OAuth2 client-credentials se cachea en memoria del servidor
// y se renueva automáticamente antes de expirar.

export interface IcdSearchResult {
  code: string
  title: string
}

interface CachedToken {
  accessToken: string
  expiresAt: number // epoch ms
}

let cachedToken: CachedToken | null = null

const RENEW_BEFORE_EXPIRY_MS = 5 * 60 * 1000 // renovar 5 min antes

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now()

  if (cachedToken && cachedToken.expiresAt - RENEW_BEFORE_EXPIRY_MS > now) {
    return cachedToken.accessToken
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'icdapi_access',
  })

  const res = await fetch('https://icdaccessmanagement.who.int/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    throw createError({ statusCode: 503, statusMessage: 'WHO ICD token request failed.' })
  }

  const data = await res.json() as { access_token: string; expires_in: number }

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }

  return cachedToken.accessToken
}

// Elimina los tags <em class='found'>…</em> que la OMS usa para
// resaltar coincidencias en los títulos de resultados.
function stripEmTags(text: string): string {
  return text.replace(/<\/?em[^>]*>/g, '')
}

export async function searchIcd11(
  query: string,
  clientId: string,
  clientSecret: string,
): Promise<IcdSearchResult[]> {
  if (!clientId || !clientSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'WHO ICD API credentials not configured.',
    })
  }

  const token = await getAccessToken(clientId, clientSecret)

  const url = new URL('https://id.who.int/icd/release/11/2024-01/mms/search')
  url.searchParams.set('q', query)
  url.searchParams.set('flatResults', 'true')
  url.searchParams.set('useFlexisearch', 'true')

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Accept-Language': 'es',
      'API-Version': 'v2',
    },
  })

  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: 'WHO ICD search request failed.' })
  }

  const data = await res.json() as {
    destinationEntities?: Array<{ theCode?: string; title?: string }>
  }

  return (data.destinationEntities ?? [])
    .filter(e => e.theCode && e.title)
    .map(e => ({
      code: e.theCode!,
      title: stripEmTags(e.title!),
    }))
}
