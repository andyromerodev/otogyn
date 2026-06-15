import type {
  AuthOperationResult,
  AuthSessionDto,
  SignInInput,
  SignUpInput,
} from '../../../application/dto/auth'

export interface AuthRemoteDataSource {
  signIn(input: SignInInput): Promise<AuthOperationResult>
  signUp(input: SignUpInput): Promise<AuthOperationResult>
  getCurrentSession(): Promise<AuthSessionDto | null>
}
