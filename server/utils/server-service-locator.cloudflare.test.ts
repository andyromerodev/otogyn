import { describe, expect, it, vi } from 'vitest'
import { registerRequestScopeResolver } from '../../src/infrastructure/runtime/request-scope'
import { serverServiceLocator } from './server-service-locator'

vi.mock('../../src/infrastructure/runtime/build-target', () => ({
  IS_CLOUDFLARE_BUILD: true,
}))

describe('serverServiceLocator on the Cloudflare build', () => {
  it('throws instead of using the Node container when the request scope is missing', () => {
    registerRequestScopeResolver(() => null)

    expect(() => serverServiceLocator.preEvaluationForms).toThrow(
      'Request scope is missing on Cloudflare',
    )
  })
})
