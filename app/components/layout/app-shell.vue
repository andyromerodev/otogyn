<script setup lang="ts">
interface SessionContext {
  name?: string
  role?: 'admin_doctor' | 'assistant'
}

const config = useRuntimeConfig()
const isAuthEnabled = computed(() => config.public.authEnabled)
const isRouteLoading = ref(false)
const nuxtApp = useNuxtApp()
const { data: sessionContext } = isAuthEnabled.value
  ? await useFetch<SessionContext | null>('/api/auth/session-context', {
      headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
    })
  : { data: ref<SessionContext | null>(null) }

const navigation = computed(() => [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Pacientes', to: '/patients' },
  { label: 'Citas', to: '/appointments' },
  { label: 'Calendario', to: '/calendar' },
  { label: 'Servicios', to: '/services' },
  ...(sessionContext.value?.role === 'admin_doctor' ? [{ label: 'Ajustes', to: '/settings' }] : []),
])

const handleSignOut = async () => {
  if (!isAuthEnabled.value) {
    return
  }

  const { useAuthClient } = await import('~/utils/auth-client')
  const authClient = useAuthClient()

  await authClient.signOut()

  if (import.meta.client) {
    window.location.replace('/login')
    return
  }

  await navigateTo('/login')
}

if (import.meta.client) {
  let finishTimer: ReturnType<typeof setTimeout> | null = null

  const clearFinishTimer = () => {
    if (!finishTimer) {
      return
    }

    clearTimeout(finishTimer)
    finishTimer = null
  }

  const stopLoading = () => {
    clearFinishTimer()
    finishTimer = setTimeout(() => {
      isRouteLoading.value = false
      finishTimer = null
    }, 140)
  }

  onMounted(() => {
    const removePageStart = nuxtApp.hook('page:start', () => {
      clearFinishTimer()
      isRouteLoading.value = true
    })
    const removePageFinish = nuxtApp.hook('page:finish', stopLoading)
    const removePageLoadingEnd = nuxtApp.hook('page:loading:end', stopLoading)
    const removeAppError = nuxtApp.hook('app:error', () => {
      clearFinishTimer()
      isRouteLoading.value = false
    })

    onBeforeUnmount(() => {
      clearFinishTimer()
      removePageStart()
      removePageFinish()
      removePageLoadingEnd()
      removeAppError()
    })
  })
}
</script>

<template>
  <div class="shell-frame">
    <div class="shell" :class="{ 'shell-loading-active': isRouteLoading }">
      <aside class="surface-card shell-sidebar">
        <div class="brand">
          <span class="brand-mark">ORL</span>
          <div>
            <p class="brand-title">OtoGyn</p>
            <p class="brand-copy">Agenda clinica MVP</p>
          </div>
        </div>

        <nav class="sidebar-nav">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            class="sidebar-link"
            active-class="sidebar-link-active"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="sidebar-foot">
          <span class="pill">Base lista para Better Auth</span>
          <NuxtLink to="/book">
            <UButton color="primary" variant="soft" block>Reserva publica</UButton>
          </NuxtLink>
        </div>
      </aside>

      <main class="shell-main">
        <header class="surface-card shell-topbar">
          <div>
            <p class="topbar-title">Plataforma de citas OtoGyn</p>
            <p class="muted-text topbar-copy">MVP con Clean Architecture, mocks separados y backend Nuxt.</p>
          </div>
          <div class="topbar-actions">
            <span class="pill">
              {{ sessionContext?.name ?? 'Modo MVP' }}
              <template v-if="sessionContext?.role"> · {{ sessionContext.role }}</template>
            </span>
            <UButton
              v-if="sessionContext"
              color="neutral"
              variant="outline"
              @click="handleSignOut"
            >
              Salir
            </UButton>
            <NuxtLink v-else to="/login">
              <UButton color="neutral" variant="outline">Entrar</UButton>
            </NuxtLink>
          </div>
        </header>

        <section class="shell-content">
          <slot />
        </section>
      </main>

      <nav class="surface-card bottom-nav">
        <NuxtLink
          v-for="item in navigation.slice(0, 5)"
          :key="item.to"
          :to="item.to"
          class="bottom-nav-link"
          active-class="bottom-nav-link-active"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>

    <Transition name="shell-loading-fade">
      <LayoutAppShellLoading
        v-if="isRouteLoading"
        class="shell-loading-overlay"
        :show-settings="sessionContext?.role === 'admin_doctor'"
      />
    </Transition>
  </div>
</template>

<style scoped>
.shell-frame {
  position: relative;
}

.shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 1.5rem;
  padding: 1.5rem;
  transition: opacity 160ms ease;
}

.shell-loading-active {
  opacity: 0.3;
  pointer-events: none;
}

.shell-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  padding: 1.5rem;
}

.shell-sidebar {
  position: sticky;
  top: 1.5rem;
  display: flex;
  min-height: calc(100vh - 3rem);
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-mark {
  display: grid;
  height: 3.25rem;
  width: 3.25rem;
  place-items: center;
  border-radius: 1rem;
  background: linear-gradient(135deg, #14b8a6, #0f766e);
  color: white;
  font-weight: 700;
}

.brand-title,
.topbar-title {
  margin: 0;
  font-weight: 700;
}

.brand-copy,
.topbar-copy {
  margin: 0.35rem 0 0;
  color: var(--text-soft);
  font-size: 0.95rem;
}

.sidebar-nav {
  display: grid;
  gap: 0.5rem;
}

.sidebar-link,
.bottom-nav-link {
  border-radius: 1rem;
  padding: 0.8rem 1rem;
  color: var(--text-soft);
  transition:
    background-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.sidebar-link:hover,
.bottom-nav-link:hover {
  color: var(--text-main);
  transform: translateY(-1px);
}

.sidebar-link-active,
.bottom-nav-link-active {
  background: rgba(20, 184, 166, 0.14);
  color: var(--teal-strong);
  font-weight: 600;
}

.sidebar-foot {
  margin-top: auto;
  display: grid;
  gap: 1rem;
}

.shell-main {
  display: grid;
  gap: 1.5rem;
}

.shell-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.shell-content {
  display: grid;
  gap: 1.5rem;
}

.bottom-nav {
  position: sticky;
  bottom: 1rem;
  z-index: 20;
  display: none;
  grid-column: 1 / -1;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.35rem;
  padding: 0.6rem;
}

.bottom-nav-link {
  text-align: center;
  font-size: 0.82rem;
}

.shell-loading-fade-enter-active,
.shell-loading-fade-leave-active {
  transition: opacity 180ms ease;
}

.shell-loading-fade-enter-from,
.shell-loading-fade-leave-to {
  opacity: 0;
}

@media (max-width: 960px) {
  .shell {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .shell-sidebar {
    display: none;
  }

  .shell-topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .bottom-nav {
    display: grid;
  }

  .shell-loading-overlay {
    padding: 1rem;
  }
}
</style>
