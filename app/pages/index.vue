<script setup lang="ts">
const resolveLoginPath = (reason?: 'deactivated') =>
  reason ? `/login?reason=${reason}` : '/login'

const config = useRuntimeConfig()

if (config.public.authEnabled) {
  if (import.meta.server) {
    const destination = await $fetch('/api/auth/session-context', {
      headers: useRequestHeaders(['cookie']),
    })
      .then(() => '/dashboard')
      .catch((error) => {
        if (
          error &&
          typeof error === 'object' &&
          'statusCode' in error &&
          error.statusCode === 403 &&
          'statusMessage' in error &&
          error.statusMessage === 'User account is deactivated.'
        ) {
          return resolveLoginPath('deactivated')
        }

        return resolveLoginPath()
      })

    await navigateTo(destination)
  } else {
    const destination = await $fetch('/api/auth/session-context')
      .then(() => '/dashboard')
      .catch(async (error) => {
        if (
          error &&
          typeof error === 'object' &&
          'statusCode' in error &&
          error.statusCode === 403 &&
          'statusMessage' in error &&
          error.statusMessage === 'User account is deactivated.'
        ) {
          const { useAuthClient } = await import('~/utils/auth-client')
          await useAuthClient().signOut()
          return resolveLoginPath('deactivated')
        }

        return resolveLoginPath()
      })

    await navigateTo(destination)
  }
} else {
  await navigateTo('/login')
}
</script>

<template>
  <div />
</template>
