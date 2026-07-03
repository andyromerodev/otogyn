<script setup lang="ts">
import { resolveSessionContext } from '~/utils/auth/session-context'

const config = useRuntimeConfig()

if (config.public.authEnabled) {
  if (import.meta.server) {
    const sessionContext = await resolveSessionContext(useRequestHeaders(['cookie']))
    const destination = sessionContext === 'deactivated' ? '/login?reason=deactivated' : sessionContext ? '/dashboard' : '/login'

    await navigateTo(destination)
  } else {
    const sessionContext = await resolveSessionContext()
    const destination = sessionContext === 'deactivated' ? '/login?reason=deactivated' : sessionContext ? '/dashboard' : '/login'

    if (sessionContext === 'deactivated') {
      const { useAuthClient } = await import('~/utils/auth-client')
      await useAuthClient().signOut()
      await clearPwaCaches()
    }

    await navigateTo(destination)
  }
} else {
  await navigateTo('/login')
}
</script>

<template>
  <div />
</template>
