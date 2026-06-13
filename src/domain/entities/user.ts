import type { Role } from '../value-objects/role'

export interface User {
  id: string
  email: string
  name: string
  role: Role
}
