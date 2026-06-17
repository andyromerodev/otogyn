import type {
  ServerAuthRequestContextDto,
  ServerSessionContextDto,
} from '../../dto/server-auth'
import type { ServerAuthRepository } from '../../../domain/repositories/server-auth-repository'

export class ResolveServerSessionUseCase {
  constructor(private readonly serverAuthRepository: ServerAuthRepository) {}

  execute(input: ServerAuthRequestContextDto): Promise<ServerSessionContextDto> {
    return this.serverAuthRepository.resolveSession(input)
  }
}

