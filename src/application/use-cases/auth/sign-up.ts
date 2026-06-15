import type { AuthOperationResult, SignUpInput } from '../../dto/auth'
import type { AuthRepository } from '../../../domain/repositories/auth-repository'

export class SignUpUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: SignUpInput): Promise<AuthOperationResult> {
    return this.authRepository.signUp(input)
  }
}
