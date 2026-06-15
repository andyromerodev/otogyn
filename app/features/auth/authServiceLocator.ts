import { GetCurrentSessionUseCase } from '~~/src/application/use-cases/auth/get-current-session'
import { SignInUseCase } from '~~/src/application/use-cases/auth/sign-in'
import { SignUpUseCase } from '~~/src/application/use-cases/auth/sign-up'
import { BetterAuthRemoteDataSource } from '~~/src/infrastructure/auth/remote/better-auth-remote-data-source'
import { BetterAuthRepository } from '~~/src/infrastructure/auth/repositories/better-auth-repository'
import { useAuthClient } from '~/utils/auth-client'

interface AuthServices {
  getCurrentSessionUseCase: GetCurrentSessionUseCase
  signInUseCase: SignInUseCase
  signUpUseCase: SignUpUseCase
}

let authServices: AuthServices | null = null

export const useAuthServices = (): AuthServices => {
  if (authServices) {
    return authServices
  }

  const authClient = useAuthClient()
  const remoteDataSource = new BetterAuthRemoteDataSource(authClient)
  const authRepository = new BetterAuthRepository(remoteDataSource)

  authServices = {
    getCurrentSessionUseCase: new GetCurrentSessionUseCase(authRepository),
    signInUseCase: new SignInUseCase(authRepository),
    signUpUseCase: new SignUpUseCase(authRepository),
  }

  return authServices
}
