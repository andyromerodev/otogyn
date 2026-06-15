<script setup lang="ts">
import { useAuthClient } from '~/utils/auth-client'

const config = useRuntimeConfig()

if (config.public.authEnabled) {
  if (import.meta.server) {
    const session = await $fetch<{ user?: unknown } | null>('/api/auth/get-session', {
      headers: useRequestHeaders(['cookie']),
    }).catch(() => null)

    await navigateTo(session?.user ? '/dashboard' : '/login')
  } else {
    const authClient = useAuthClient()
    const { data: session } = await authClient.useSession(useFetch)

    await navigateTo(session.value?.user ? '/dashboard' : '/login')
  }
} else {
  await navigateTo('/login')
}
</script>

<template>
  <div />
</template>
