<script setup lang="ts">
import SharedConfirmDialog from '../shared/confirm-dialog.vue'
import { useSessionContext } from '~/composables/auth/use-session-context'
import { createAppShellSignOutController } from '~~/src/presentation/view-models/layout/app-shell-sign-out'
import { useNetworkStatus } from '~/composables/pwa/use-network-status'
import { resolveRouteLoadingVariant } from '~/utils/route-loading'

const config = useRuntimeConfig()
const isAuthEnabled = computed(() => config.public.authEnabled)
const isRouteLoading = ref(false)
const nuxtApp = useNuxtApp()
const route = useRoute()
const routeLoadingTarget = useState<string>('route-loading-target', () => route.path)
const loadingVariant = computed(() => resolveRouteLoadingVariant(routeLoadingTarget.value || route.path))

const { sessionContext } = useSessionContext()
const { isOnline, setupNetworkListeners } = useNetworkStatus()

onMounted(setupNetworkListeners)

const navigation = computed(() => [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Pacientes', to: '/patients' },
  { label: 'Pre-evaluaciones', to: '/pre-evaluacion-forms' },
  { label: 'Citas', to: '/appointments' },
  { label: 'Calendario', to: '/calendar' },
  { label: 'Servicios', to: '/services' },
  { label: 'Inventario', to: '/inventory' },
  ...(sessionContext.value?.role === 'admin_doctor'
    ? [
        { label: 'Finanzas', to: '/finances' },
        { label: 'Estadísticas', to: '/statistics' },
        { label: 'Disponibilidad', to: '/availability' },
        { label: 'Ajustes', to: '/settings' },
      ]
    : []),
])

const bottomNavigation = [
  { label: 'Inicio', to: '/dashboard', icon: 'i-heroicons-home' },
  { label: 'Pacientes', to: '/patients', icon: 'i-heroicons-users' },
  { label: 'Agenda', to: '/calendar', icon: 'i-heroicons-calendar-days' },
  { label: 'Consultas', to: '/consultations', icon: 'i-heroicons-clipboard-document-list' },
]

const performSignOut = async () => {
  if (!isAuthEnabled.value) {
    return
  }

  const { useAuthClient } = await import('~/utils/auth-client')
  const authClient = useAuthClient()

  await authClient.signOut()
  await clearPwaCaches()

  if (import.meta.client) {
    window.location.replace('/login')
    return
  }

  await navigateTo('/login')
}

const signOutController = createAppShellSignOutController(performSignOut)

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
      routeLoadingTarget.value = route.path
      finishTimer = null
    }, 140)
  }

  onMounted(() => {
    const removePageStart = nuxtApp.hook('page:start', () => {
      clearFinishTimer()
      routeLoadingTarget.value ||= route.path
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
    <Transition name="offline-fade">
      <div v-if="!isOnline" class="offline-banner" role="status">
        <UIcon name="i-heroicons-signal-slash" class="offline-banner-icon" />
        <span>Sin conexión — mostrando datos guardados</span>
      </div>
    </Transition>

    <div class="shell">
      <aside class="surface-card shell-sidebar">
        <div class="brand">
          <span class="brand-mark">ORL</span>
          <div>
            <p class="brand-title">OtoGyn</p>
            <p class="brand-copy">Agenda clínica</p>
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
          <NuxtLink to="/book" class="sidebar-external-link sidebar-external-link-primary">
            <UIcon name="i-heroicons-calendar-days-20-solid" />
            <span>Reserva pública</span>
          </NuxtLink>
          <NuxtLink to="/pre-evaluacion" class="sidebar-external-link sidebar-external-link-secondary">
            <UIcon name="i-heroicons-clipboard-document-check-20-solid" />
            <span>Pre-evaluación</span>
          </NuxtLink>
        </div>
      </aside>

      <main class="shell-main">
        <ClientOnly>
          <PwaUpdatePrompt />
          <PwaInstallBanner />
        </ClientOnly>

        <header class="surface-card shell-topbar">
          <div class="topbar-actions">
            <span class="pill">
              {{ sessionContext?.name ?? 'OtoGyn' }}
            </span>
            <UButton
              v-if="sessionContext"
              color="neutral"
              variant="outline"
              @click="signOutController.requestSignOut"
            >
              Salir
            </UButton>
            <NuxtLink v-else to="/login">
              <UButton color="neutral" variant="outline">Entrar</UButton>
            </NuxtLink>
          </div>
        </header>

        <section class="shell-content">
          <div
            class="shell-content-body"
            :class="{ 'shell-content-body-loading': isRouteLoading }"
          >
            <slot />
          </div>

          <Transition name="shell-loading-fade">
            <LayoutAppShellLoading
              v-if="isRouteLoading"
              class="shell-loading-overlay"
              :variant="loadingVariant"
            />
          </Transition>
        </section>
      </main>
    </div>

    <SharedConfirmDialog
      v-model="signOutController.isConfirmOpen.value"
      title="Cerrar sesión"
      message="¿Seguro que quieres salir de tu sesión ahora?"
      confirm-label="Salir"
      :pending="signOutController.pending.value"
      @cancel="signOutController.cancelSignOut"
      @confirm="signOutController.confirmSignOut"
    />

    <nav class="surface-card bottom-nav" aria-label="Navegacion principal">
      <NuxtLink
        v-for="item in bottomNavigation"
        :key="item.to"
        :to="item.to"
        class="bottom-nav-link"
        active-class="bottom-nav-link-active"
      >
        <UIcon :name="item.icon" class="bottom-nav-icon" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.shell-frame {
  position: relative;
}

.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: calc(0.45rem + env(safe-area-inset-top)) 1rem 0.45rem;
  background: #b45309;
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
}

.offline-banner-icon {
  font-size: 1rem;
}

.offline-fade-enter-active,
.offline-fade-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.offline-fade-enter-from,
.offline-fade-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 1.5rem;
  padding: 1.5rem;
  transition: opacity 160ms ease;
}

.shell-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  padding: 0;
  border-radius: inherit;
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

.sidebar-link {
  border-radius: 1rem;
  padding: 0.8rem 1rem;
  color: var(--text-soft);
  user-select: none;
  -webkit-user-select: none;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.sidebar-link:hover {
  color: var(--text-main);
  transform: translateY(-1px);
}

.sidebar-link-active {
  background: rgba(20, 184, 166, 0.14);
  color: var(--teal-strong);
  font-weight: 600;
}

.sidebar-foot {
  margin-top: auto;
  display: grid;
  gap: 0.75rem;
}

.sidebar-external-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border-radius: 1rem;
  padding: 0.85rem 1rem;
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.15;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.sidebar-external-link:hover {
  transform: translateY(-1px);
}

.sidebar-external-link-primary {
  background: #176f6d;
  color: white;
  box-shadow: 0 10px 24px rgba(23, 111, 109, 0.22);
}

.sidebar-external-link-secondary {
  background: rgba(23, 111, 109, 0.08);
  color: #176f6d;
  border: 1px solid rgba(23, 111, 109, 0.18);
}

.shell-main {
  display: grid;
  gap: 1.5rem;
}

.shell-topbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.shell-content {
  position: relative;
  display: grid;
  gap: 1.5rem;
  min-height: 28rem;
}

.shell-content-body {
  transition: opacity 160ms ease;
}

.shell-content-body-loading {
  opacity: 0.16;
  pointer-events: none;
}

.shell-loading-fade-enter-active,
.shell-loading-fade-leave-active {
  transition: opacity 180ms ease;
}

.shell-loading-fade-enter-from,
.shell-loading-fade-leave-to {
  opacity: 0;
}

.bottom-nav {
  display: none;
}

@media (max-width: 960px) {
  .shell {
    grid-template-columns: 1fr;
    padding: 1rem;
    /* Con viewport-fit=cover el contenido queda bajo el notch sin este padding. */
    padding-top: calc(1rem + env(safe-area-inset-top));
    padding-bottom: calc(5.5rem + env(safe-area-inset-bottom));
  }

  .shell-sidebar {
    display: none;
  }

  .shell-topbar {
    justify-content: flex-start;
    align-items: center;
    padding: 0.25rem 0.1rem 1rem;
    background: transparent;
    border: none;
    box-shadow: none;
    backdrop-filter: none;
  }

  .topbar-actions {
    width: 100%;
    justify-content: space-between;
  }

  .topbar-text {
    order: 2;
    flex: 1 0 100%;
    margin-top: 0.9rem;
  }

  .topbar-copy {
    display: none;
  }

  .topbar-title {
    font-size: 1.05rem;
  }

  .shell-loading-overlay {
    inset: 0;
  }

  .bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.25rem;
    padding: 0.6rem 0.5rem calc(0.6rem + env(safe-area-inset-bottom));
    border-radius: 0;
  }

  .bottom-nav-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding: 0.4rem 0.2rem;
    border-radius: 0.85rem;
    color: var(--text-soft);
    font-size: 0.72rem;
    font-weight: 600;
    text-align: center;
    user-select: none;
    -webkit-user-select: none;
  }

  .bottom-nav-icon {
    font-size: 1.4rem;
  }

  .bottom-nav-link-active {
    color: var(--teal-strong);
    background: rgba(20, 184, 166, 0.12);
  }
}
</style>
