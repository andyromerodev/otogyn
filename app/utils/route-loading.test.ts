import { describe, expect, it } from 'vitest'

import { resolveRouteLoadingVariant } from './route-loading'

describe('resolveRouteLoadingVariant', () => {
  it('maps primary dashboard and feature routes', () => {
    expect(resolveRouteLoadingVariant('/dashboard')).toBe('dashboard')
    expect(resolveRouteLoadingVariant('/patients')).toBe('patients')
    expect(resolveRouteLoadingVariant('/calendar')).toBe('calendar')
    expect(resolveRouteLoadingVariant('/appointments')).toBe('consultations')
    expect(resolveRouteLoadingVariant('/consultations')).toBe('consultations')
  })

  it('maps nested feature routes to their module variant', () => {
    expect(resolveRouteLoadingVariant('/patients/123')).toBe('patient-detail')
    expect(resolveRouteLoadingVariant('/services/new')).toBe('services')
    expect(resolveRouteLoadingVariant('/availability/blocks')).toBe('availability')
    expect(resolveRouteLoadingVariant('/settings/assistants')).toBe('settings')
  })

  it('maps public and auth routes', () => {
    expect(resolveRouteLoadingVariant('/book')).toBe('public-booking')
    expect(resolveRouteLoadingVariant('/login')).toBe('auth')
    expect(resolveRouteLoadingVariant('/signup')).toBe('auth')
    expect(resolveRouteLoadingVariant('/auth/callback')).toBe('auth')
  })

  it('falls back for unknown routes', () => {
    expect(resolveRouteLoadingVariant('/')).toBe('default')
    expect(resolveRouteLoadingVariant('/unmapped')).toBe('default')
  })
})
