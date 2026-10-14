import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { getStore } from '@netlify/blobs'
import type { AttachmentStoragePort } from '../../application/ports/attachment-storage'

export class NetlifyBlobsAttachmentStorage implements AttachmentStoragePort {
  private readonly localDir: string

  constructor(private readonly storeName: string = 'pre-evaluation-attachments') {
    this.localDir = join(process.cwd(), '.data', 'blobs', this.storeName)
  }

  private getBlobStore() {
    try {
      return getStore({ name: this.storeName, consistency: 'strong' })
    } catch {
      return null
    }
  }

  private saveToLocal(key: string, data: Buffer, contentType: string): void {
    try {
      mkdirSync(this.localDir, { recursive: true })
      const filePath = join(this.localDir, `${key}.json`)
      writeFileSync(filePath, JSON.stringify({ contentType, data: data.toString('base64') }))
    } catch (err) {
      console.warn(`[NetlifyBlobsAttachmentStorage] Failed to save locally to ${this.localDir}:`, err)
    }
  }

  private getFromLocal(key: string): { data: Buffer; contentType: string } | null {
    try {
      const filePath = join(this.localDir, `${key}.json`)
      if (!existsSync(filePath)) return null
      const content = JSON.parse(readFileSync(filePath, 'utf-8'))
      return {
        data: Buffer.from(content.data, 'base64'),
        contentType: content.contentType,
      }
    } catch (err) {
      console.warn(`[NetlifyBlobsAttachmentStorage] Failed to read locally from ${this.localDir}:`, err)
      return null
    }
  }

  async store(key: string, data: Buffer, contentType: string): Promise<void> {
    const store = this.getBlobStore()
    if (!store) {
      this.saveToLocal(key, data, contentType)
      return
    }

    try {
      const blob = new Blob([new Uint8Array(data)], { type: contentType })
      await store.set(key, blob, { metadata: { contentType } })
    } catch (error) {
      console.warn(`[NetlifyBlobsAttachmentStorage] Netlify Blobs set failed; using local fallback.`, error)
      this.saveToLocal(key, data, contentType)
    }
  }

  async get(key: string): Promise<{ data: Buffer; contentType: string } | null> {
    const store = this.getBlobStore()
    if (!store) {
      return this.getFromLocal(key)
    }

    try {
      const arrayBuffer = await store.get(key, { type: 'arrayBuffer' })

      if (!arrayBuffer) {
        return this.getFromLocal(key)
      }

      const metadataResult = await store.getMetadata(key)
      const contentType =
        (metadataResult?.metadata.contentType as string | undefined) ?? 'application/octet-stream'

      return { data: Buffer.from(arrayBuffer), contentType }
    } catch (error) {
      console.warn(`[NetlifyBlobsAttachmentStorage] Netlify Blobs get failed; checking local fallback.`, error)
      return this.getFromLocal(key)
    }
  }
}
