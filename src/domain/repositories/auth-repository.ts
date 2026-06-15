import type {
  AuthOperationResult,
  AuthSessionDto,
  SignInInput,
  SignUpInput,
} from '../../application/dto/auth'

export interface AuthRepository {
  signIn(input: SignInInput): Promise<AuthOperationResult>
  signUp(input: SignUpInput): Promise<AuthOperationResult>
  getCurrentSession(): Promise<AuthSessionDto | null>
}
