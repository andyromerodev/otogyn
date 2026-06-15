const waitForAuthSignal = () => new Promise((resolve) => window.setTimeout(resolve, 75))

export const navigateAfterAuth = async (to: string) => {
  if (import.meta.client) {
    await waitForAuthSignal()
    window.location.assign(to)
    return
  }

  await navigateTo(to)
}
