<script setup lang="ts">
import ServiceListItem from '../../components/services/service-list-item.vue'
import { useServicesListViewModel } from '../../composables/services/use-services-list-view-model'

definePageMeta({
  middleware: 'auth',
})

const viewModel = useServicesListViewModel()
</script>

<template>
  <div class="services-page">
    <div class="services-header">
      <div>
        <h1 class="services-title">Servicios</h1>
        <p class="services-subtitle">{{ viewModel.totalLabel.value }}</p>
      </div>

      <NuxtLink
        v-if="viewModel.canManageServices.value"
        to="/services/new"
        class="services-add-desktop"
        aria-label="Registrar servicio"
      >
        <UIcon name="i-heroicons-plus-20-solid" />
      </NuxtLink>
    </div>

    <ClientOnly>
      <p v-if="viewModel.errorMessage.value" class="services-message services-message-error">
        {{ viewModel.errorMessage.value }}
      </p>

      <section class="services-list-card">
        <div v-if="viewModel.loading.value" class="services-list-state">
          Cargando servicios...
        </div>

        <div v-else-if="viewModel.services.value.length" class="services-list">
          <ServiceListItem
            v-for="service in viewModel.services.value"
            :key="service.id"
            :service="service"
          />
        </div>

        <div v-else class="services-list-state">
          {{ viewModel.emptyStateMessage.value }}
        </div>
      </section>
    </ClientOnly>

    <NuxtLink
      v-if="viewModel.canManageServices.value"
      to="/services/new"
      class="services-fab"
      aria-label="Registrar servicio"
    >
      <UIcon name="i-heroicons-plus-20-solid" />
    </NuxtLink>
  </div>
</template>

<style scoped>
.services-page {
  display: grid;
  gap: 1.1rem;
  max-width: 62rem;
}

.services-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.services-title {
  margin: 0;
  color: #132b2d;
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.services-subtitle {
  margin: 0.45rem 0 0;
  color: #7ca0a2;
  font-size: 1.2rem;
}

.services-add-desktop,
.services-fab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #1b7676;
  color: white;
  box-shadow: 0 12px 30px rgba(23, 95, 91, 0.18);
}

.services-add-desktop {
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.75rem;
}

.services-message {
  margin: 0;
  border-radius: 1.1rem;
  padding: 0.95rem 1rem;
  font-weight: 600;
}

.services-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.services-list-card {
  overflow: hidden;
  border-radius: 1.9rem;
  border: 1px solid #bfdedd;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(20, 82, 76, 0.08);
}

.services-list > :deep(.service-row-link:not(:last-child)) {
  border-bottom: 1px solid #d4ebe8;
}

.services-list-state {
  padding: 1.4rem;
  color: #6f9a9d;
  font-size: 0.98rem;
}

.services-fab {
  position: fixed;
  right: 1.25rem;
  bottom: calc(5.75rem + env(safe-area-inset-bottom));
  z-index: 35;
  width: 4.45rem;
  height: 4.45rem;
  font-size: 2rem;
}

@media (min-width: 961px) {
  .services-fab {
    display: none;
  }
}

@media (max-width: 960px) {
  .services-page {
    gap: 1rem;
    padding-bottom: calc(4.45rem + 5.75rem + 1.5rem + env(safe-area-inset-bottom));
  }

  .services-header {
    display: none;
  }

  .services-add-desktop {
    display: none;
  }
}

@media (max-width: 640px) {
  .services-title {
    font-size: 2.35rem;
  }

  .services-subtitle {
    font-size: 1rem;
  }
}
</style>
