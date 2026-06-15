export interface SignInInput {
  email: string
  password: string
  callbackURL: string
  rememberMe: boolean
}

export interface SignUpInput {
  name: string
  email: string
  password: string
}

export interface AuthSessionDto {
  userId: string
  email: string
  name: string | null
}

export type AuthResult<T = null> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }

export type AuthOperationResult = AuthResult<null>
