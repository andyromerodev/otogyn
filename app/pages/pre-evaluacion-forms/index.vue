<script setup lang="ts">
import PreEvaluationFormListItem from '../../components/pre-evaluation-forms/pre-evaluation-form-list-item.vue'
import { usePreEvaluationFormsListViewModel } from '../../composables/pre-evaluation-forms/use-pre-evaluation-forms-list-view-model'

definePageMeta({
  middleware: 'auth',
})

const viewModel = usePreEvaluationFormsListViewModel()
</script>

<template>
  <div class="preeval-list-page">
    <div class="preeval-list-header">
      <div>
        <h1 class="preeval-list-title">Pre-evaluaciones</h1>
        <p class="preeval-list-subtitle">{{ viewModel.totalLabel.value }}</p>
      </div>
    </div>

    <div class="preeval-list-search-shell">
      <UIcon name="i-heroicons-magnifying-glass-20-solid" class="preeval-list-search-icon" />
      <input
        v-model="viewModel.searchTerm.value"
        type="text"
        placeholder="Nombre, telefono o email..."
        class="preeval-list-search-input"
      >
    </div>

    <div class="preeval-list-chips">
      <button
        v-for="chip in viewModel.filterChips.value"
        :key="chip.key"
        type="button"
        class="preeval-list-chip"
        :class="{ 'preeval-list-chip-active': viewModel.selectedFilter.value === chip.key }"
        :aria-pressed="viewModel.selectedFilter.value === chip.key"
        @click="viewModel.selectFilter(chip.key)"
      >
        {{ chip.label }}
      </button>
    </div>

    <ClientOnly>
      <p v-if="viewModel.errorMessage.value" class="preeval-list-message preeval-list-message-error">
        {{ viewModel.errorMessage.value }}
      </p>

      <section class="preeval-list-card">
        <div v-if="viewModel.loading.value" class="preeval-list-state">
          Cargando formularios...
        </div>

        <div v-else-if="viewModel.forms.value.length" class="preeval-list">
          <PreEvaluationFormListItem
            v-for="form in viewModel.forms.value"
            :key="form.id"
            :form="form"
          />
        </div>

        <div v-else class="preeval-list-state">
          {{ viewModel.emptyStateMessage.value }}
        </div>
      </section>

      <div v-if="viewModel.totalPages.value > 1" class="preeval-list-pagination">
        <div class="preeval-list-pagination-mobile">
          <button
            type="button"
            class="preeval-list-page-button"
            :disabled="!viewModel.hasPrevious.value"
            @click="viewModel.goToPreviousPage"
          >
            Anterior
          </button>
          <span class="preeval-list-page-indicator">
            Página {{ viewModel.page.value }} de {{ viewModel.totalPages.value }}
          </span>
          <button
            type="button"
            class="preeval-list-page-button"
            :disabled="!viewModel.hasNext.value"
            @click="viewModel.goToNextPage"
          >
            Siguiente
          </button>
        </div>

        <UPagination
          class="preeval-list-pagination-desktop"
          :page="viewModel.page.value"
          :items-per-page="viewModel.pageSize.value"
          :total="viewModel.total.value"
          :show-controls="true"
          :show-edges="true"
          color="neutral"
          variant="outline"
          active-color="primary"
          active-variant="solid"
          @update:page="viewModel.goToPage"
        />
      </div>
    </ClientOnly>
  </div>
</template>

<style scoped>
.preeval-list-page {
  display: grid;
  gap: 1.1rem;
  max-width: 62rem;
}

.preeval-list-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.preeval-list-title {
  margin: 0;
  color: #132b2d;
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.preeval-list-subtitle {
  margin: 0.45rem 0 0;
  color: #7ca0a2;
  font-size: 1.2rem;
}

.preeval-list-search-shell {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 4.6rem;
  padding: 0 1.25rem 0 3.9rem;
  border-radius: 1.45rem;
  background: #edf7f5;
  border: 1px solid #d5ebe7;
}

.preeval-list-search-icon {
  position: absolute;
  left: 1.2rem;
  color: #7ca0a2;
  font-size: 1.5rem;
}

.preeval-list-search-input {
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  color: #6e999b;
  font-size: 1.15rem;
  outline: none;
}

.preeval-list-search-input::placeholder {
  color: #7ca0a2;
}

.preeval-list-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.preeval-list-chip {
  flex: 0 0 auto;
  border: 1.5px solid #bddfdf;
  border-radius: 999px;
  padding: 0.9rem 1.55rem;
  background: white;
  color: #305d63;
  font-size: 0.98rem;
  font-weight: 700;
}

.preeval-list-chip-active {
  border-color: #2a7371;
  background: #dff0ee;
  color: #216566;
}

.preeval-list-message {
  margin: 0;
  border-radius: 1.1rem;
  padding: 0.95rem 1rem;
  font-weight: 600;
}

.preeval-list-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.preeval-list-card {
  overflow: hidden;
  border-radius: 1.9rem;
  border: 1px solid #bfdedd;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(20, 82, 76, 0.08);
}

.preeval-list > :deep(.preeval-row-link:not(:last-child)) {
  border-bottom: 1px solid #d4ebe8;
}

.preeval-list-state {
  padding: 1.4rem;
  color: #6f9a9d;
  font-size: 0.98rem;
}

.preeval-list-pagination {
  display: grid;
  gap: 0.9rem;
}

.preeval-list-pagination-mobile {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.preeval-list-pagination-desktop {
  justify-self: center;
}

.preeval-list-page-button {
  border: 1px solid #cfe4e1;
  border-radius: 999px;
  padding: 0.8rem 1.1rem;
  background: rgba(255, 255, 255, 0.96);
  color: #1f5f63;
  font-weight: 700;
}

.preeval-list-page-button:disabled {
  opacity: 0.45;
}

.preeval-list-page-indicator {
  color: #6f9a9d;
  font-size: 0.92rem;
  font-weight: 700;
}

@media (max-width: 960px) {
  .preeval-list-page {
    gap: 1rem;
    padding-bottom: calc(4.45rem + 5.75rem + 1.5rem + env(safe-area-inset-bottom));
  }
}

@media (max-width: 640px) {
  .preeval-list-title {
    font-size: 2.35rem;
  }

  .preeval-list-subtitle {
    font-size: 1rem;
  }

  .preeval-list-search-shell {
    min-height: 4.35rem;
    padding-right: 1rem;
    padding-left: 3.6rem;
  }

  .preeval-list-search-input {
    font-size: 1.02rem;
  }

  .preeval-list-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.1rem;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .preeval-list-chips::-webkit-scrollbar {
    display: none;
  }

  .preeval-list-chip {
    padding: 0.82rem 1.25rem;
  }

  .preeval-list-pagination-mobile {
    display: flex;
  }

  .preeval-list-pagination-desktop {
    display: none;
  }
}
</style>
