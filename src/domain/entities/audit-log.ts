export interface AuditLog {
  id: string
  actorUserId: string
  entityName: string
  entityId: string
  action: string
  metadata: Record<string, string | number | boolean | null>
  createdAt: Date
}
