export type RouteLoadingVariant =
  | 'dashboard'
  | 'patients'
  | 'patient-detail'
  | 'calendar'
  | 'consultations'
  | 'services'
  | 'availability'
  | 'settings'
  | 'public-booking'
  | 'auth'
  | 'default'

export const resolveRouteLoadingVariant = (path: string): RouteLoadingVariant => {
  if (path === '/dashboard') {
    return 'dashboard'
  }

  if (path.startsWith('/patients/')) {
    return 'patient-detail'
  }

  if (path.startsWith('/patients')) {
    return 'patients'
  }

  if (path.startsWith('/calendar')) {
    return 'calendar'
  }

  if (path.startsWith('/appointments') || path.startsWith('/consultations')) {
    return 'consultations'
  }

  if (path.startsWith('/services')) {
    return 'services'
  }

  if (path.startsWith('/availability')) {
    return 'availability'
  }

  if (path.startsWith('/settings')) {
    return 'settings'
  }

  if (path.startsWith('/book')) {
    return 'public-booking'
  }

  if (path === '/login' || path === '/signup' || path.startsWith('/auth')) {
    return 'auth'
  }

  return 'default'
}
