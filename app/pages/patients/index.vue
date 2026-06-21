<script setup lang="ts">
import PatientListItem from '../../components/patients/patient-list-item.vue'
import { usePatientsListScreen } from '../../composables/patients/use-patients-list-screen'

definePageMeta({
  middleware: 'auth',
})

const screen = usePatientsListScreen()
</script>

<template>
  <div class="patients-page">
    <div class="patients-header">
      <div>
        <h1 class="patients-title">Pacientes</h1>
        <p class="patients-subtitle">{{ screen.totalLabel.value }}</p>
      </div>

      <NuxtLink to="/patients/new" class="patients-add-desktop" aria-label="Registrar paciente">
        <UIcon name="i-heroicons-plus-20-solid" />
      </NuxtLink>
    </div>

    <div class="patients-search-shell">
      <UIcon name="i-heroicons-magnifying-glass-20-solid" class="patients-search-icon" />
      <input
        type="text"
        v-model="screen.searchTerm.value"
        placeholder="Nombre o seguimiento..."
        class="patients-search-input"
      >
    </div>

    <div class="patients-chips">
      <button
        v-for="chip in screen.filterChips.value"
        :key="chip.key"
        type="button"
        class="patients-chip"
        :class="{ 'patients-chip-active': screen.selectedFilter.value === chip.key }"
        :aria-pressed="screen.selectedFilter.value === chip.key"
        @click="screen.selectFilter(chip.key)"
      >
        {{ chip.label }}
      </button>
    </div>

    <ClientOnly>
      <p v-if="screen.errorMessage.value" class="patients-message patients-message-error">
        {{ screen.errorMessage.value }}
      </p>

      <section class="patients-list-card">
        <div v-if="screen.loading.value" class="patients-list-state">
          Cargando pacientes...
        </div>

        <div v-else-if="screen.patients.value.length" class="patients-list">
          <PatientListItem
            v-for="patient in screen.patients.value"
            :key="patient.id"
            :patient="patient"
          />
        </div>

        <div v-else class="patients-list-state">
          {{ screen.emptyStateMessage.value }}
        </div>
      </section>

      <div v-if="screen.totalPages.value > 1" class="patients-pagination">
        <div class="patients-pagination-mobile">
          <button
            type="button"
            class="patients-page-button"
            :disabled="!screen.hasPrevious.value"
            @click="screen.goToPreviousPage"
          >
            Anterior
          </button>
          <span class="patients-page-indicator">Página {{ screen.page.value }} de {{ screen.totalPages.value }}</span>
          <button
            type="button"
            class="patients-page-button"
            :disabled="!screen.hasNext.value"
            @click="screen.goToNextPage"
          >
            Siguiente
          </button>
        </div>

        <UPagination
          class="patients-pagination-desktop"
          :page="screen.page.value"
          :items-per-page="screen.pageSize.value"
          :total="screen.total.value"
          :show-controls="true"
          :show-edges="true"
          color="neutral"
          variant="outline"
          active-color="primary"
          active-variant="solid"
          @update:page="screen.goToPage"
        />
      </div>
    </ClientOnly>

    <NuxtLink to="/patients/new" class="patients-fab" aria-label="Registrar paciente">
      <UIcon name="i-heroicons-plus-20-solid" />
    </NuxtLink>
  </div>
</template>

<style scoped>
.patients-page {
  display: grid;
  gap: 1.1rem;
  max-width: 62rem;
}

.patients-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.patients-title {
  margin: 0;
  color: #132b2d;
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.patients-subtitle {
  margin: 0.45rem 0 0;
  color: #7ca0a2;
  font-size: 1.2rem;
}

.patients-add-desktop,
.patients-fab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #1b7676;
  color: white;
  box-shadow: 0 12px 30px rgba(23, 95, 91, 0.18);
}

.patients-add-desktop {
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.75rem;
}

.patients-search-shell {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 4.6rem;
  padding: 0 1.25rem 0 3.9rem;
  border-radius: 1.45rem;
  background: #edf7f5;
  border: 1px solid #d5ebe7;
}

.patients-search-icon {
  position: absolute;
  left: 1.2rem;
  color: #7ca0a2;
  font-size: 1.5rem;
}

.patients-search-input {
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  color: #6e999b;
  font-size: 1.15rem;
  outline: none;
}

.patients-search-input::placeholder {
  color: #7ca0a2;
}

.patients-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.patients-chip {
  flex: 0 0 auto;
  border: 1.5px solid #bddfdf;
  border-radius: 999px;
  padding: 0.9rem 1.55rem;
  background: white;
  color: #305d63;
  font-size: 0.98rem;
  font-weight: 700;
}

.patients-chip-active {
  border-color: #2a7371;
  background: #dff0ee;
  color: #216566;
}

.patients-message {
  margin: 0;
  border-radius: 1.1rem;
  padding: 0.95rem 1rem;
  font-weight: 600;
}

.patients-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.patients-list-card {
  overflow: hidden;
  border-radius: 1.9rem;
  border: 1px solid #bfdedd;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(20, 82, 76, 0.08);
}

.patients-list > :deep(.patient-row-link:not(:last-child)) {
  border-bottom: 1px solid #d4ebe8;
}

.patients-list-state {
  padding: 1.4rem;
  color: #6f9a9d;
  font-size: 0.98rem;
}

.patients-pagination {
  display: grid;
  gap: 0.9rem;
}

.patients-pagination-mobile {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.patients-pagination-desktop {
  justify-self: center;
}

.patients-page-button {
  border: 1px solid #cfe4e1;
  border-radius: 999px;
  padding: 0.8rem 1.1rem;
  background: rgba(255, 255, 255, 0.96);
  color: #1f5f63;
  font-weight: 700;
}

.patients-page-button:disabled {
  opacity: 0.45;
}

.patients-page-indicator {
  color: #6f9a9d;
  font-size: 0.92rem;
  font-weight: 700;
}

.patients-fab {
  position: fixed;
  right: 1.25rem;
  bottom: calc(5.75rem + env(safe-area-inset-bottom));
  z-index: 35;
  width: 4.45rem;
  height: 4.45rem;
  font-size: 2rem;
}

@media (min-width: 961px) {
  .patients-fab {
    display: none;
  }
}

@media (max-width: 960px) {
  .patients-page {
    gap: 1rem;
    padding-bottom: calc(4.45rem + 5.75rem + 1.5rem + env(safe-area-inset-bottom));
  }

  .patients-header {
    display: none;
  }

  .patients-add-desktop {
    display: none;
  }
}

@media (max-width: 640px) {
  .patients-title {
    font-size: 2.35rem;
  }

  .patients-subtitle {
    font-size: 1rem;
  }

  .patients-search-shell {
    min-height: 4.35rem;
    padding-right: 1rem;
    padding-left: 3.6rem;
  }

  .patients-search-input {
    font-size: 1.02rem;
  }

  .patients-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.1rem;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .patients-chips::-webkit-scrollbar {
    display: none;
  }

  .patients-chip {
    padding: 0.82rem 1.25rem;
  }

  .patients-pagination-mobile {
    display: flex;
  }

  .patients-pagination-desktop {
    display: none;
  }
}
</style>
