import type {
  ServerAuthRequestContextDto,
  ServerSessionContextDto,
} from '../../application/dto/server-auth'

export interface ServerAuthRepository {
  resolveSession(input: ServerAuthRequestContextDto): Promise<ServerSessionContextDto>
}

