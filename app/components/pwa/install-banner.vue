<script setup lang="ts">
const DISMISS_KEY = 'otogyn-install-dismissed'
const DISMISS_DAYS = 30

const { $pwa } = useNuxtApp()

const isStandalone = ref(true)
const isIos = ref(false)
const dismissed = ref(true)
const showIosGuide = ref(false)

onMounted(() => {
  isStandalone.value =
    window.matchMedia('(display-mode: standalone)').matches
    // Safari expone navigator.standalone solo en iOS.
    || ('standalone' in navigator && Boolean((navigator as { standalone?: boolean }).standalone))

  isIos.value = /iphone|ipad|ipod/i.test(navigator.userAgent)

  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0)
  dismissed.value = dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000
})

const canInstallNative = computed(() => Boolean($pwa?.showInstallPrompt))

const isVisible = computed(
  () => !isStandalone.value && !dismissed.value && (isIos.value || canInstallNative.value),
)

const dismiss = () => {
  localStorage.setItem(DISMISS_KEY, String(Date.now()))
  dismissed.value = true
  showIosGuide.value = false
}

const handleInstall = async () => {
  if (isIos.value) {
    showIosGuide.value = true
    return
  }

  await $pwa?.install()
  dismiss()
}
</script>

<template>
  <div v-if="isVisible" class="surface-card install-banner">
    <template v-if="!showIosGuide">
      <div class="install-banner-text">
        <p class="install-banner-title">Instala OtoGyn en tu celular</p>
        <p class="install-banner-copy">Acceso directo, pantalla completa y soporte sin conexión.</p>
      </div>
      <div class="install-banner-actions">
        <UButton size="sm" color="primary" @click="handleInstall">Instalar</UButton>
        <UButton size="sm" color="neutral" variant="ghost" @click="dismiss">Ahora no</UButton>
      </div>
    </template>

    <template v-else>
      <div class="install-banner-text">
        <p class="install-banner-title">Para instalar en iPhone</p>
        <ol class="install-banner-steps">
          <li>Toca el ícono de compartir <UIcon name="i-heroicons-arrow-up-on-square" class="install-banner-step-icon" /> en Safari.</li>
          <li>Elige <strong>"Añadir a pantalla de inicio"</strong>.</li>
        </ol>
      </div>
      <div class="install-banner-actions">
        <UButton size="sm" color="neutral" variant="ghost" @click="dismiss">Entendido</UButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.install-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.9rem 1.1rem;
}

.install-banner-title {
  margin: 0;
  font-weight: 700;
  font-size: 0.95rem;
}

.install-banner-copy {
  margin: 0.2rem 0 0;
  color: var(--text-soft);
  font-size: 0.85rem;
}

.install-banner-steps {
  margin: 0.35rem 0 0;
  padding-left: 1.1rem;
  color: var(--text-soft);
  font-size: 0.85rem;
  display: grid;
  gap: 0.2rem;
}

.install-banner-step-icon {
  vertical-align: text-bottom;
  color: var(--teal-strong);
}

.install-banner-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
