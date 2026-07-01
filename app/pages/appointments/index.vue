<script setup lang="ts">
import AppointmentListItem from '../../components/appointments/appointment-list-item.vue'
import { useAppointmentsListViewModel } from '../../composables/appointments/use-appointments-list-view-model'

definePageMeta({
  middleware: 'auth',
})

const viewModel = useAppointmentsListViewModel()
</script>

<template>
  <div class="appointments-page">
    <div class="appointments-header">
      <div>
        <h1 class="appointments-title">Citas</h1>
        <p class="appointments-subtitle">{{ viewModel.totalLabel.value }}</p>
      </div>

      <NuxtLink to="/appointments/new" class="appointments-add-desktop" aria-label="Registrar cita">
        <UIcon name="i-heroicons-plus-20-solid" />
      </NuxtLink>
    </div>

    <ClientOnly>
      <p v-if="viewModel.errorMessage.value" class="appointments-message appointments-message-error">
        {{ viewModel.errorMessage.value }}
      </p>

      <section class="appointments-list-card">
        <div v-if="viewModel.loading.value" class="appointments-list-state">
          Cargando citas...
        </div>

        <div v-else-if="viewModel.appointments.value.length" class="appointments-list">
          <AppointmentListItem
            v-for="appointment in viewModel.appointments.value"
            :key="appointment.id"
            :appointment="appointment"
          />
        </div>

        <div v-else class="appointments-list-state">
          {{ viewModel.emptyStateMessage.value }}
        </div>
      </section>
    </ClientOnly>

    <NuxtLink to="/appointments/new" class="appointments-fab" aria-label="Registrar cita">
      <UIcon name="i-heroicons-plus-20-solid" />
    </NuxtLink>
  </div>
</template>

<style scoped>
.appointments-page {
  display: grid;
  gap: 1.1rem;
  max-width: 62rem;
}

.appointments-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.appointments-title {
  margin: 0;
  color: #132b2d;
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.appointments-subtitle {
  margin: 0.45rem 0 0;
  color: #7ca0a2;
  font-size: 1.2rem;
}

.appointments-add-desktop,
.appointments-fab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #1b7676;
  color: white;
  box-shadow: 0 12px 30px rgba(23, 95, 91, 0.18);
}

.appointments-add-desktop {
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.75rem;
}

.appointments-message {
  margin: 0;
  border-radius: 1.1rem;
  padding: 0.95rem 1rem;
  font-weight: 600;
}

.appointments-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.appointments-list-card {
  overflow: hidden;
  border-radius: 1.9rem;
  border: 1px solid #bfdedd;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(20, 82, 76, 0.08);
}

.appointments-list > :deep(.appointment-row-link:not(:last-child)) {
  border-bottom: 1px solid #d4ebe8;
}

.appointments-list-state {
  padding: 1.4rem;
  color: #6f9a9d;
  font-size: 0.98rem;
}

.appointments-fab {
  position: fixed;
  right: 1.25rem;
  bottom: calc(5.75rem + env(safe-area-inset-bottom));
  z-index: 35;
  width: 4.45rem;
  height: 4.45rem;
  font-size: 2rem;
}

@media (min-width: 961px) {
  .appointments-fab {
    display: none;
  }
}

@media (max-width: 960px) {
  .appointments-page {
    gap: 1rem;
    padding-bottom: calc(4.45rem + 5.75rem + 1.5rem + env(safe-area-inset-bottom));
  }

  .appointments-header {
    display: none;
  }

  .appointments-add-desktop {
    display: none;
  }
}

@media (max-width: 640px) {
  .appointments-title {
    font-size: 2.35rem;
  }

  .appointments-subtitle {
    font-size: 1rem;
  }
}
</style>
