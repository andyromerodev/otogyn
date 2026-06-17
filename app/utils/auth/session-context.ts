export interface AppSessionContext {
  name?: string
  role?: 'admin_doctor' | 'assistant'
}

export const getAuthErrorStatus = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
  ) {
    return {
      statusCode: error.statusCode,
      statusMessage:
        'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : undefined,
    }
  }

  return {
    statusCode: 500,
    statusMessage: undefined,
  }
}

export const buildLoginRedirect = (path: string, reason?: 'deactivated') => ({
  path: '/login',
  query: {
    redirect: path,
    ...(reason ? { reason } : {}),
  },
})

export const fetchSessionContext = (headers?: HeadersInit) =>
  $fetch<AppSessionContext>('/api/auth/session-context', { headers })

export const resolveSessionContext = async (
  headers?: HeadersInit,
): Promise<AppSessionContext | null | 'deactivated'> => {
  try {
    return await fetchSessionContext(headers)
  } catch (error) {
    const { statusCode, statusMessage } = getAuthErrorStatus(error)

    if (statusCode === 403 && statusMessage === 'User account is deactivated.') {
      return 'deactivated'
    }

    if (statusCode === 401 || statusCode === 403) {
      return null
    }

    throw error
  }
}
