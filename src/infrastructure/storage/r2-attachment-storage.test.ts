import { describe, expect, it } from 'vitest'
import { R2AttachmentStorage, type R2BucketLike } from './r2-attachment-storage'

interface StoredObject {
  body: Uint8Array
  contentType?: string
}

// Bucket en memoria: guarda los objetos tal cual y los devuelve como R2.
class InMemoryR2Bucket implements R2BucketLike {
  readonly objects = new Map<string, StoredObject>()
  failNextPut: Error | null = null

  async put(
    key: string,
    value: ArrayBuffer | ArrayBufferView,
    options?: { httpMetadata?: { contentType?: string } },
  ) {
    if (this.failNextPut) {
      throw this.failNextPut
    }

    const bytes =
      value instanceof ArrayBuffer
        ? new Uint8Array(value).slice()
        : new Uint8Array(value.buffer, value.byteOffset, value.byteLength).slice()

    this.objects.set(key, { body: bytes, contentType: options?.httpMetadata?.contentType })
  }

  async get(key: string) {
    const stored = this.objects.get(key)

    if (!stored) {
      return null
    }

    return {
      arrayBuffer: async () => stored.body.slice().buffer as ArrayBuffer,
      httpMetadata: { contentType: stored.contentType },
    }
  }
}

describe('R2AttachmentStorage', () => {
  it('stores attachments under the store prefix and returns the same bytes and content type', async () => {
    const bucket = new InMemoryR2Bucket()
    const storage = new R2AttachmentStorage(bucket, 'pre-evaluation-attachments')

    await storage.store('form-1.pdf', Buffer.from('%PDF-1.7 test'), 'application/pdf')

    expect(bucket.objects.has('pre-evaluation-attachments/form-1.pdf')).toBe(true)

    const result = await storage.get('form-1.pdf')

    expect(result?.data.toString()).toBe('%PDF-1.7 test')
    expect(result?.contentType).toBe('application/pdf')
  })

  it('keeps each store in its own prefix', async () => {
    const bucket = new InMemoryR2Bucket()
    const preEvaluation = new R2AttachmentStorage(bucket, 'pre-evaluation-attachments')
    const consultation = new R2AttachmentStorage(bucket, 'consultation-attachments')

    await consultation.store('visit.jpg', Buffer.from('jpg-bytes'), 'image/jpeg')

    expect(await preEvaluation.get('visit.jpg')).toBeNull()
    expect((await consultation.get('visit.jpg'))?.contentType).toBe('image/jpeg')
  })

  it('returns null for a missing key', async () => {
    const storage = new R2AttachmentStorage(new InMemoryR2Bucket(), 'consultation-attachments')

    expect(await storage.get('missing.png')).toBeNull()
  })

  it('propagates bucket errors instead of falling back', async () => {
    const bucket = new InMemoryR2Bucket()
    bucket.failNextPut = new Error('R2 unavailable')
    const storage = new R2AttachmentStorage(bucket, 'pre-evaluation-attachments')

    await expect(storage.store('form-2.png', Buffer.from('png'), 'image/png')).rejects.toThrow(
      'R2 unavailable',
    )
    expect(bucket.objects.size).toBe(0)
  })
})
