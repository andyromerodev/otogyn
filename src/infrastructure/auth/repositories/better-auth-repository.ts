import type {
  AuthOperationResult,
  AuthSessionDto,
  SignInInput,
  SignUpInput,
} from '../../../application/dto/auth'
import type { AuthRepository } from '../../../domain/repositories/auth-repository'
import type { AuthRemoteDataSource } from '../remote/auth-remote-data-source'

export class BetterAuthRepository implements AuthRepository {
  constructor(private readonly remoteDataSource: AuthRemoteDataSource) {}

  async signIn(input: SignInInput): Promise<AuthOperationResult> {
    return this.remoteDataSource.signIn(input)
  }

  async signUp(input: SignUpInput): Promise<AuthOperationResult> {
    return this.remoteDataSource.signUp(input)
  }

  async getCurrentSession(): Promise<AuthSessionDto | null> {
    return this.remoteDataSource.getCurrentSession()
  }
}
