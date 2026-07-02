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
      <div class="appointments-search-shell">
        <UIcon name="i-heroicons-magnifying-glass-20-solid" class="appointments-search-icon" />
        <input
          v-model="viewModel.searchTerm.value"
          class="appointments-search-input"
          type="search"
          placeholder="Buscar por paciente, servicio, motivo o notas"
          autocomplete="off"
        >
      </div>

      <div class="appointments-chips">
        <button
          v-for="chip in viewModel.filterChips.value"
          :key="chip.key"
          class="appointments-chip"
          :class="{ 'appointments-chip-active': viewModel.selectedFilter.value === chip.key }"
          type="button"
          @click="viewModel.selectFilter(chip.key)"
        >
          {{ chip.label }}
        </button>
      </div>

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

      <div v-if="viewModel.totalPages.value > 1" class="appointments-pagination">
        <div class="appointments-pagination-mobile">
          <button
            class="appointments-page-button"
            type="button"
            :disabled="!viewModel.hasPrevious.value"
            @click="viewModel.goToPreviousPage"
          >
            Anterior
          </button>
          <span class="appointments-page-indicator">Página {{ viewModel.page.value }} de {{ viewModel.totalPages.value }}</span>
          <button
            class="appointments-page-button"
            type="button"
            :disabled="!viewModel.hasNext.value"
            @click="viewModel.goToNextPage"
          >
            Siguiente
          </button>
        </div>

        <UPagination
          class="appointments-pagination-desktop"
          :page="viewModel.page.value"
          :items-per-page="viewModel.pageSize.value"
          :total="viewModel.total.value"
          @update:page="viewModel.goToPage"
        />
      </div>
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

.appointments-search-shell {
  position: relative;
}

.appointments-search-icon {
  position: absolute;
  left: 1.05rem;
  top: 50%;
  width: 1.2rem;
  height: 1.2rem;
  transform: translateY(-50%);
  color: #7ca0a2;
}

.appointments-search-input {
  width: 100%;
  border: 1px solid #bfdedd;
  border-radius: 1.4rem;
  background: rgba(255, 255, 255, 0.96);
  color: #132b2d;
  padding: 0.95rem 1rem 0.95rem 3rem;
  font-size: 1rem;
  font-weight: 700;
  outline: none;
  box-shadow: 0 12px 28px rgba(20, 82, 76, 0.06);
}

.appointments-search-input::placeholder {
  color: #8ba8aa;
  font-weight: 600;
}

.appointments-search-input:focus {
  border-color: #1b7676;
  box-shadow: 0 0 0 3px rgba(27, 118, 118, 0.12);
}

.appointments-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.appointments-chip {
  border: 1px solid #bfdedd;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #52797c;
  padding: 0.6rem 0.95rem;
  font-size: 0.9rem;
  font-weight: 800;
  transition: border-color 160ms ease, background 160ms ease, color 160ms ease;
}

.appointments-chip-active {
  border-color: #1b7676;
  background: #1b7676;
  color: #fff;
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

.appointments-pagination {
  display: flex;
  justify-content: center;
}

.appointments-pagination-mobile {
  display: none;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.appointments-pagination-desktop {
  display: flex;
}

.appointments-page-button {
  border: 1px solid #bfdedd;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #1b7676;
  padding: 0.7rem 1rem;
  font-weight: 800;
}

.appointments-page-button:disabled {
  cursor: not-allowed;
  color: #9dbabd;
  opacity: 0.65;
}

.appointments-page-indicator {
  color: #668b8e;
  font-weight: 800;
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

  .appointments-search-shell {
    margin-top: 0.25rem;
  }

  .appointments-search-input {
    min-height: 3.35rem;
    font-size: 0.95rem;
  }

  .appointments-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    margin-right: -1rem;
    padding-right: 1rem;
    scrollbar-width: none;
  }

  .appointments-chips::-webkit-scrollbar {
    display: none;
  }

  .appointments-chip {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .appointments-pagination-mobile {
    display: flex;
  }

  .appointments-pagination-desktop {
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
