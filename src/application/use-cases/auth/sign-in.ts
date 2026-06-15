import type { AuthOperationResult, SignInInput } from '../../dto/auth'
import type { AuthRepository } from '../../../domain/repositories/auth-repository'

export class SignInUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: SignInInput): Promise<AuthOperationResult> {
    return this.authRepository.signIn(input)
  }
}
