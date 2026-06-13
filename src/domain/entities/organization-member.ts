import type { Role } from '../value-objects/role'

export interface OrganizationMember {
  organizationId: string
  userId: string
  role: Role
}
