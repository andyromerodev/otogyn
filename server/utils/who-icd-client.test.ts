import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Stub Nitro globals before any dynamic imports of who-icd-client.ts
const mockCreateError = vi.fn((opts: { statusCode: number; statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
})

const mockFetch = vi.fn()

vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('fetch', mockFetch)

// ——— Helpers ———

const tokenResponse = (expiresIn = 3600) => ({
  ok: true,
  json: async () => ({ access_token: 'test_token', expires_in: expiresIn }),
})

const searchResponse = (entities: Array<{ theCode: string; title: string }>) => ({
  ok: true,
  json: async () => ({ destinationEntities: entities }),
})

// ——— Tests ———

describe('searchIcd11', () => {
  beforeEach(() => {
    vi.resetModules()
    mockFetch.mockReset()
    mockCreateError.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches a token on the first call and returns mapped results', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(searchResponse([
        { theCode: 'AB01', title: 'Otitis media' },
        { theCode: 'AB02', title: 'Otitis externa' },
      ]))

    const { searchIcd11 } = await import('./who-icd-client')
    const results = await searchIcd11('otitis', 'client_id', 'client_secret')

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ code: 'AB01', title: 'Otitis media' })
    expect(results[1]).toEqual({ code: 'AB02', title: 'Otitis externa' })
  })

  it('strips <em> highlight tags from titles', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(searchResponse([
        { theCode: 'X01', title: "<em class='found'>vert</em>igo postural" },
      ]))

    const { searchIcd11 } = await import('./who-icd-client')
    const [result] = await searchIcd11('vertigo', 'id', 'secret')

    expect(result?.title).toBe('vertigo postural')
  })

  it('reuses the cached token on consecutive calls', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenResponse())  // token fetch (only once)
      .mockResolvedValue(searchResponse([]))    // all subsequent searches

    const { searchIcd11 } = await import('./who-icd-client')
    await searchIcd11('a', 'id', 'secret')
    await searchIcd11('b', 'id', 'secret')

    // 1 token fetch + 2 searches = 3 total; no second token request
    expect(mockFetch).toHaveBeenCalledTimes(3)
    const firstCall = mockFetch.mock.calls[0]?.[0] as string
    expect(firstCall).toContain('icdaccessmanagement.who.int')
  })

  it('renews the token when it is about to expire', async () => {
    // First token expires in 1 second (< 5 min threshold → needs renewal)
    mockFetch
      .mockResolvedValueOnce(tokenResponse(1))      // first token: expires_in=1s
      .mockResolvedValueOnce(searchResponse([]))     // first search
      .mockResolvedValueOnce(tokenResponse(3600))    // renewed token
      .mockResolvedValueOnce(searchResponse([]))     // second search

    const { searchIcd11 } = await import('./who-icd-client')
    await searchIcd11('a', 'id', 'secret')
    await searchIcd11('b', 'id', 'secret')

    // 2 token fetches + 2 searches = 4 calls
    expect(mockFetch).toHaveBeenCalledTimes(4)
  })

  it('throws 503 when credentials are empty', async () => {
    const { searchIcd11 } = await import('./who-icd-client')

    await expect(searchIcd11('query', '', '')).rejects.toMatchObject({ statusCode: 503 })
    expect(mockCreateError).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 503 }),
    )
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('throws 503 when the token endpoint returns an error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 })

    const { searchIcd11 } = await import('./who-icd-client')

    await expect(searchIcd11('query', 'id', 'secret')).rejects.toMatchObject({ statusCode: 503 })
    expect(mockCreateError).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 503 }),
    )
  })

  it('throws 502 when the WHO search endpoint returns an error', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce({ ok: false, status: 500 })

    const { searchIcd11 } = await import('./who-icd-client')

    await expect(searchIcd11('query', 'id', 'secret')).rejects.toMatchObject({ statusCode: 502 })
    expect(mockCreateError).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 502 }),
    )
  })

  it('returns an empty array when destinationEntities is absent', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })

    const { searchIcd11 } = await import('./who-icd-client')
    const results = await searchIcd11('query', 'id', 'secret')

    expect(results).toEqual([])
  })

  it('filters out entities with missing code or title', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(searchResponse([
        { theCode: 'AB01', title: 'Valid' },
        { theCode: '', title: 'No code' },
        { theCode: 'AB03', title: '' },
      ] as Array<{ theCode: string; title: string }>))

    const { searchIcd11 } = await import('./who-icd-client')
    const results = await searchIcd11('query', 'id', 'secret')

    expect(results).toHaveLength(1)
    expect(results[0]?.code).toBe('AB01')
  })
})
