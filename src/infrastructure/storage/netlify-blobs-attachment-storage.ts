import { getStore } from '@netlify/blobs'
import type { AttachmentStoragePort } from '../../application/ports/attachment-storage'

export class NetlifyBlobsAttachmentStorage implements AttachmentStoragePort {
  private getBlobStore() {
    return getStore({ name: 'pre-evaluation-attachments', consistency: 'strong' })
  }

  async store(key: string, data: Buffer, contentType: string): Promise<void> {
    const store = this.getBlobStore()
    const blob = new Blob([new Uint8Array(data)], { type: contentType })
    await store.set(key, blob, { metadata: { contentType } })
  }

  async get(key: string): Promise<{ data: Buffer; contentType: string } | null> {
    const store = this.getBlobStore()
    const arrayBuffer = await store.get(key, { type: 'arrayBuffer' })

    if (!arrayBuffer) {
      return null
    }

    const metadataResult = await store.getMetadata(key)
    const contentType =
      (metadataResult?.metadata.contentType as string | undefined) ?? 'application/octet-stream'

    return { data: Buffer.from(arrayBuffer), contentType }
  }
}
