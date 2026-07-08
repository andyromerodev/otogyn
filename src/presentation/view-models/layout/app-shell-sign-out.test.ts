import { describe, expect, it, vi } from 'vitest'
import { createAppShellSignOutController } from './app-shell-sign-out'

describe('createAppShellSignOutController', () => {
  it('opens the confirmation dialog before signing out', () => {
    const performSignOut = vi.fn().mockResolvedValue(undefined)
    const controller = createAppShellSignOutController(performSignOut)

    controller.requestSignOut()

    expect(controller.isConfirmOpen.value).toBe(true)
    expect(performSignOut).not.toHaveBeenCalled()
  })

  it('cancels the dialog without signing out', () => {
    const performSignOut = vi.fn().mockResolvedValue(undefined)
    const controller = createAppShellSignOutController(performSignOut)

    controller.requestSignOut()
    controller.cancelSignOut()

    expect(controller.isConfirmOpen.value).toBe(false)
    expect(performSignOut).not.toHaveBeenCalled()
  })

  it('signs out only after confirm and closes the dialog', async () => {
    const performSignOut = vi.fn().mockResolvedValue(undefined)
    const controller = createAppShellSignOutController(performSignOut)

    controller.requestSignOut()
    await controller.confirmSignOut()

    expect(performSignOut).toHaveBeenCalledTimes(1)
    expect(controller.isConfirmOpen.value).toBe(false)
    expect(controller.pending.value).toBe(false)
  })
})
