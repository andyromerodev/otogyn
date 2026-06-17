import type { AuthAccessStatusDto } from '../../dto/auth'
import type { AuthRepository } from '../../../domain/repositories/auth-repository'

export class GetAccessStatusUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<AuthAccessStatusDto> {
    return this.authRepository.getAccessStatus()
  }
}
