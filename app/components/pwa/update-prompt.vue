<script setup lang="ts">
const { $pwa } = useNuxtApp()

const needRefresh = computed(() => Boolean($pwa?.needRefresh))
const updating = ref(false)

const applyUpdate = async () => {
  updating.value = true
  // Activa el SW en espera y recarga la página con los assets nuevos.
  await $pwa?.updateServiceWorker(true)
}

const postpone = () => {
  $pwa?.cancelPrompt()
}
</script>

<template>
  <div v-if="needRefresh" class="surface-card update-prompt" role="status">
    <div>
      <p class="update-prompt-title">Nueva versión disponible</p>
      <p class="update-prompt-copy">Hay una actualización de OtoGyn lista para usarse.</p>
    </div>
    <div class="update-prompt-actions">
      <UButton size="sm" color="primary" :loading="updating" @click="applyUpdate">
        Actualizar ahora
      </UButton>
      <UButton size="sm" color="neutral" variant="ghost" :disabled="updating" @click="postpone">
        Después
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.update-prompt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.9rem 1.1rem;
  border: 1px solid rgba(20, 184, 166, 0.35);
}

.update-prompt-title {
  margin: 0;
  font-weight: 700;
  font-size: 0.95rem;
}

.update-prompt-copy {
  margin: 0.2rem 0 0;
  color: var(--text-soft);
  font-size: 0.85rem;
}

.update-prompt-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
