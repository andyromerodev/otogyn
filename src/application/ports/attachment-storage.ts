export interface AttachmentStoragePort {
  store(key: string, data: Buffer, contentType: string): Promise<void>
  get(key: string): Promise<{ data: Buffer; contentType: string } | null>
}
