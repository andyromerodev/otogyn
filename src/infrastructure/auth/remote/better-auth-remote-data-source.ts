import type {
  AuthAccessStatusDto,
  AuthOperationResult,
  AuthSessionDto,
  SignInInput,
  SignUpInput,
} from '../../../application/dto/auth'
import type { BetterAuthClient } from '../client/better-auth-client'
import type { AuthRemoteDataSource } from './auth-remote-data-source'

const normalizeAuthError = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const authError = error as {
    message?: string
    code?: string
    status?: number
    statusText?: string
  }

  return authError.message ?? authError.statusText ?? authError.code ?? fallback
}

export class BetterAuthRemoteDataSource implements AuthRemoteDataSource {
  constructor(private readonly authClient: BetterAuthClient) {}

  async signIn(input: SignInInput): Promise<AuthOperationResult> {
    try {
      const credentials = {
        email: input.email,
        password: input.password,
        rememberMe: input.rememberMe,
      }
      const result = await this.authClient.signIn.email(credentials)

      if (result.error) {
        return {
          success: false,
          error: normalizeAuthError(result.error, 'No se pudo iniciar sesion.'),
        }
      }

      return {
        success: true,
        data: null,
      }
    } catch (error) {
      return {
        success: false,
        error: normalizeAuthError(error, 'No se pudo iniciar sesion.'),
      }
    }
  }

  async signUp(input: SignUpInput): Promise<AuthOperationResult> {
    try {
      const result = await this.authClient.signUp.email(input)

      if (result.error) {
        return {
          success: false,
          error: normalizeAuthError(result.error, 'No se pudo crear la cuenta.'),
        }
      }

      return {
        success: true,
        data: null,
      }
    } catch (error) {
      return {
        success: false,
        error: normalizeAuthError(error, 'No se pudo crear la cuenta.'),
      }
    }
  }

  async getCurrentSession(): Promise<AuthSessionDto | null> {
    const { data } = await this.authClient.useSession(useFetch)
    const session = data.value

    if (!session?.user) {
      return null
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
    }
  }

  async getAccessStatus(): Promise<AuthAccessStatusDto> {
    try {
      await $fetch('/api/auth/session-context')

      return {
        allowed: true,
      }
    } catch (error) {
      const authError = error as {
        statusCode?: number
        statusMessage?: string
      }

      if (authError.statusCode === 403 && authError.statusMessage === 'User account is deactivated.') {
        return {
          allowed: false,
          reason: 'deactivated',
        }
      }

      if (authError.statusCode === 401 || authError.statusCode === 403) {
        return {
          allowed: false,
          reason: 'missing_role',
        }
      }

      throw error
    }
  }

  async signOut(): Promise<void> {
    await this.authClient.signOut()
  }
}
