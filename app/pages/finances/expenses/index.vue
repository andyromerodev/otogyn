<script setup lang="ts">
import ExpenseListItem from '../../../components/finances/expense-list-item.vue'
import { useExpensesViewModel } from '../../../composables/finances/use-expenses-view-model'

definePageMeta({
  middleware: 'auth',
})

const viewModel = useExpensesViewModel()
</script>

<template>
  <div class="expenses-page">
    <div class="expenses-header">
      <div>
        <h1 class="expenses-title">Gastos</h1>
        <p class="expenses-subtitle">{{ viewModel.total.value }} registros</p>
      </div>

      <div class="expenses-header-actions">
        <NuxtLink to="/finances/categories" class="expenses-categories-link">
          Categorías
        </NuxtLink>
        <NuxtLink to="/finances/expenses/new" class="expenses-add-desktop" aria-label="Registrar gasto">
          <UIcon name="i-heroicons-plus-20-solid" />
        </NuxtLink>
      </div>
    </div>

    <div class="expenses-chips">
      <button
        v-for="chip in viewModel.categoryChips.value"
        :key="String(chip.key)"
        type="button"
        class="expenses-chip"
        :class="{ 'expenses-chip-active': viewModel.categoryFilter.value === chip.key }"
        :aria-pressed="viewModel.categoryFilter.value === chip.key"
        @click="viewModel.selectCategory(chip.key)"
      >
        {{ chip.label }}
      </button>
    </div>

    <ClientOnly>
      <p v-if="viewModel.errorMessage.value" class="expenses-message expenses-message-error">
        {{ viewModel.errorMessage.value }}
      </p>

      <section class="expenses-list-card">
        <div v-if="viewModel.loading.value" class="expenses-list-state">
          Cargando gastos...
        </div>

        <div v-else-if="viewModel.expenses.value.length" class="expenses-list">
          <ExpenseListItem
            v-for="expense in viewModel.expenses.value"
            :key="expense.id"
            :expense="expense"
          />
        </div>

        <div v-else class="expenses-list-state">
          {{ viewModel.emptyStateMessage.value }}
        </div>
      </section>

      <div v-if="viewModel.totalPages.value > 1" class="expenses-pagination">
        <div class="expenses-pagination-mobile">
          <button
            type="button"
            class="expenses-page-button"
            :disabled="!viewModel.hasPrevious.value"
            @click="viewModel.goToPreviousPage"
          >
            Anterior
          </button>
          <span class="expenses-page-indicator">Página {{ viewModel.page.value }} de {{ viewModel.totalPages.value }}</span>
          <button
            type="button"
            class="expenses-page-button"
            :disabled="!viewModel.hasNext.value"
            @click="viewModel.goToNextPage"
          >
            Siguiente
          </button>
        </div>

        <UPagination
          class="expenses-pagination-desktop"
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

    <NuxtLink to="/finances/expenses/new" class="expenses-fab" aria-label="Registrar gasto">
      <UIcon name="i-heroicons-plus-20-solid" />
    </NuxtLink>
  </div>
</template>

<style scoped>
.expenses-page {
  display: grid;
  gap: 1.1rem;
  max-width: 62rem;
}

.expenses-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.expenses-title {
  margin: 0;
  color: #132b2d;
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.expenses-subtitle {
  margin: 0.45rem 0 0;
  color: #7ca0a2;
  font-size: 1.2rem;
}

.expenses-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.expenses-categories-link {
  border: 1.5px solid #bddfdf;
  border-radius: 999px;
  padding: 0.7rem 1.25rem;
  color: #305d63;
  font-size: 0.92rem;
  font-weight: 700;
  transition: background-color 160ms ease;
}

.expenses-categories-link:hover {
  background: #edf7f5;
}

.expenses-add-desktop,
.expenses-fab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #1b7676;
  color: white;
  box-shadow: 0 12px 30px rgba(23, 95, 91, 0.18);
}

.expenses-add-desktop {
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.75rem;
}

.expenses-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.expenses-chip {
  flex: 0 0 auto;
  border: 1.5px solid #bddfdf;
  border-radius: 999px;
  padding: 0.9rem 1.55rem;
  background: white;
  color: #305d63;
  font-size: 0.98rem;
  font-weight: 700;
}

.expenses-chip-active {
  border-color: #2a7371;
  background: #dff0ee;
  color: #216566;
}

.expenses-message {
  margin: 0;
  border-radius: 1.1rem;
  padding: 0.95rem 1rem;
  font-weight: 600;
}

.expenses-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.expenses-list-card {
  overflow: hidden;
  border-radius: 1.9rem;
  border: 1px solid #bfdedd;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(20, 82, 76, 0.08);
}

.expenses-list > :deep(.expense-row:not(:last-child)) {
  border-bottom: 1px solid #d4ebe8;
}

.expenses-list-state {
  padding: 1.4rem;
  color: #6f9a9d;
  font-size: 0.98rem;
}

.expenses-pagination {
  display: grid;
  gap: 0.9rem;
}

.expenses-pagination-mobile {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.expenses-pagination-desktop {
  justify-self: center;
}

.expenses-page-button {
  border: 1px solid #cfe4e1;
  border-radius: 999px;
  padding: 0.8rem 1.1rem;
  background: rgba(255, 255, 255, 0.96);
  color: #1f5f63;
  font-weight: 700;
}

.expenses-page-button:disabled {
  opacity: 0.45;
}

.expenses-page-indicator {
  color: #6f9a9d;
  font-size: 0.92rem;
  font-weight: 700;
}

.expenses-fab {
  position: fixed;
  right: 1.25rem;
  bottom: calc(5.75rem + env(safe-area-inset-bottom));
  z-index: 35;
  width: 4.45rem;
  height: 4.45rem;
  font-size: 2rem;
}

@media (min-width: 961px) {
  .expenses-fab {
    display: none;
  }
}

@media (max-width: 960px) {
  .expenses-page {
    gap: 1rem;
    padding-bottom: calc(4.45rem + 5.75rem + 1.5rem + env(safe-area-inset-bottom));
  }

  .expenses-header {
    display: none;
  }

  .expenses-add-desktop {
    display: none;
  }
}

@media (max-width: 640px) {
  .expenses-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.1rem;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .expenses-chips::-webkit-scrollbar {
    display: none;
  }

  .expenses-chip {
    padding: 0.82rem 1.25rem;
  }

  .expenses-pagination-mobile {
    display: flex;
  }

  .expenses-pagination-desktop {
    display: none;
  }
}
</style>
