import type { AuthSessionDto } from '../../dto/auth'
import type { AuthRepository } from '../../../domain/repositories/auth-repository'

export class GetCurrentSessionUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<AuthSessionDto | null> {
    return this.authRepository.getCurrentSession()
  }
}
