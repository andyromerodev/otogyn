import type { AttachmentStoragePort } from '../../application/ports/attachment-storage'

// Subconjunto del binding R2 que usa la app. Evita depender de @cloudflare/workers-types.
export interface R2ObjectLike {
  arrayBuffer(): Promise<ArrayBuffer>
  httpMetadata?: { contentType?: string }
}

export interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>
  get(key: string): Promise<R2ObjectLike | null>
}

// Adjuntos en R2 (binding ATTACHMENTS). Sin fallback: cualquier error se propaga.
export class R2AttachmentStorage implements AttachmentStoragePort {
  constructor(
    private readonly bucket: R2BucketLike,
    private readonly storeName: string,
  ) {}

  async store(key: string, data: Buffer, contentType: string): Promise<void> {
    await this.bucket.put(this.objectKey(key), new Uint8Array(data), {
      httpMetadata: { contentType },
    })
  }

  async get(key: string): Promise<{ data: Buffer; contentType: string } | null> {
    const object = await this.bucket.get(this.objectKey(key))

    if (!object) {
      return null
    }

    return {
      data: Buffer.from(await object.arrayBuffer()),
      contentType: object.httpMetadata?.contentType ?? 'application/octet-stream',
    }
  }

  private objectKey(key: string): string {
    return `${this.storeName}/${key}`
  }
}
