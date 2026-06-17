import { AuthorizeServerActionUseCase } from '../../application/use-cases/auth/authorize-server-action'
import { ResolveServerSessionUseCase } from '../../application/use-cases/auth/resolve-server-session'
import { BetterAuthServerRepository } from './repositories/better-auth-server-repository'

const serverAuthRepository = new BetterAuthServerRepository()

export const serverAuthServiceLocator = {
  resolveServerSessionUseCase: new ResolveServerSessionUseCase(serverAuthRepository),
  authorizeServerActionUseCase: new AuthorizeServerActionUseCase(),
}
