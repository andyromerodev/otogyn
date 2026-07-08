import { ref, type Ref } from 'vue'

export interface AppShellSignOutController {
  isConfirmOpen: Ref<boolean>
  pending: Ref<boolean>
  requestSignOut: () => void
  cancelSignOut: () => void
  confirmSignOut: () => Promise<void>
}

export const createAppShellSignOutController = (
  performSignOut: () => Promise<void>,
): AppShellSignOutController => {
  const isConfirmOpen = ref(false)
  const pending = ref(false)

  const requestSignOut = () => {
    if (pending.value) return
    isConfirmOpen.value = true
  }

  const cancelSignOut = () => {
    if (pending.value) return
    isConfirmOpen.value = false
  }

  const confirmSignOut = async () => {
    if (pending.value || !isConfirmOpen.value) return

    pending.value = true

    try {
      await performSignOut()
      isConfirmOpen.value = false
    } finally {
      pending.value = false
    }
  }

  return {
    isConfirmOpen,
    pending,
    requestSignOut,
    cancelSignOut,
    confirmSignOut,
  }
}
