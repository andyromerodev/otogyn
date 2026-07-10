<script setup lang="ts">
import PaymentListItem from '../../../components/finances/payment-list-item.vue'
import { usePaymentsViewModel } from '../../../composables/finances/use-payments-view-model'

definePageMeta({
  middleware: 'auth',
})

const viewModel = usePaymentsViewModel()
</script>

<template>
  <div class="payments-page">
    <div class="payments-header">
      <div>
        <h1 class="payments-title">Pagos</h1>
        <p class="payments-subtitle">{{ viewModel.total.value }} registros</p>
      </div>

      <div class="payments-header-actions">
        <a :href="viewModel.exportHref.value" class="payments-export-link">
          <UIcon name="i-heroicons-arrow-down-tray-20-solid" />
          <span>Exportar CSV</span>
        </a>

        <NuxtLink to="/finances/payments/new" class="payments-add-desktop" aria-label="Registrar pago">
          <UIcon name="i-heroicons-plus-20-solid" />
        </NuxtLink>
      </div>
    </div>

    <div class="payments-search">
      <UIcon name="i-heroicons-magnifying-glass-20-solid" class="payments-search-icon" />
      <input
        v-model="viewModel.searchTerm.value"
        type="search"
        placeholder="Buscar por paciente, concepto o nota…"
        class="payments-search-input"
        aria-label="Buscar pagos"
      />
    </div>

    <div class="payments-chips">
      <button
        v-for="chip in viewModel.methodChips.value"
        :key="String(chip.key)"
        type="button"
        class="payments-chip"
        :class="{ 'payments-chip-active': viewModel.methodFilter.value === chip.key }"
        :aria-pressed="viewModel.methodFilter.value === chip.key"
        @click="viewModel.selectMethod(chip.key)"
      >
        {{ chip.label }}
      </button>
    </div>

    <div class="payments-tools">
      <a :href="viewModel.exportHref.value" class="payments-export-link">
        <UIcon name="i-heroicons-arrow-down-tray-20-solid" />
        <span>Exportar CSV</span>
      </a>
    </div>

    <ClientOnly>
      <p v-if="viewModel.errorMessage.value" class="payments-message payments-message-error">
        {{ viewModel.errorMessage.value }}
      </p>

      <section class="payments-list-card">
        <div v-if="viewModel.loading.value" class="payments-list-state">
          Cargando pagos...
        </div>

        <div v-else-if="viewModel.payments.value.length" class="payments-list">
          <PaymentListItem
            v-for="payment in viewModel.payments.value"
            :key="payment.id"
            :payment="payment"
          />
        </div>

        <div v-else class="payments-list-state">
          {{ viewModel.emptyStateMessage.value }}
        </div>
      </section>

      <div v-if="viewModel.totalPages.value > 1" class="payments-pagination">
        <div class="payments-pagination-mobile">
          <button
            type="button"
            class="payments-page-button"
            :disabled="!viewModel.hasPrevious.value"
            @click="viewModel.goToPreviousPage"
          >
            Anterior
          </button>
          <span class="payments-page-indicator">Página {{ viewModel.page.value }} de {{ viewModel.totalPages.value }}</span>
          <button
            type="button"
            class="payments-page-button"
            :disabled="!viewModel.hasNext.value"
            @click="viewModel.goToNextPage"
          >
            Siguiente
          </button>
        </div>

        <UPagination
          class="payments-pagination-desktop"
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

    <NuxtLink to="/finances/payments/new" class="payments-fab" aria-label="Registrar pago">
      <UIcon name="i-heroicons-plus-20-solid" />
    </NuxtLink>
  </div>
</template>

<style scoped>
.payments-page {
  display: grid;
  gap: 1.1rem;
  max-width: 62rem;
}

.payments-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.payments-title {
  margin: 0;
  color: #132b2d;
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.payments-subtitle {
  margin: 0.45rem 0 0;
  color: #7ca0a2;
  font-size: 1.2rem;
}

.payments-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.payments-add-desktop,
.payments-fab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #1b7676;
  color: white;
  box-shadow: 0 12px 30px rgba(23, 95, 91, 0.18);
}

.payments-add-desktop {
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.75rem;
}

.payments-export-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1.5px solid #bddfdf;
  border-radius: 999px;
  padding: 0.82rem 1.2rem;
  background: rgba(255, 255, 255, 0.96);
  color: #1f5f63;
  font-size: 0.94rem;
  font-weight: 700;
}

.payments-search {
  position: relative;
  display: flex;
  align-items: center;
}

.payments-search-icon {
  position: absolute;
  left: 1rem;
  color: #7ca0a2;
  font-size: 1.1rem;
  pointer-events: none;
}

.payments-search-input {
  width: 100%;
  border: 1.5px solid #bddfdf;
  border-radius: 999px;
  padding: 0.85rem 1.2rem 0.85rem 2.75rem;
  background: rgba(255, 255, 255, 0.96);
  color: #132b2d;
  font-size: 0.97rem;
  outline: none;
}

.payments-search-input:focus {
  border-color: #2a7371;
  box-shadow: 0 0 0 3px rgba(42, 115, 113, 0.12);
}

.payments-search-input::placeholder {
  color: #7ca0a2;
}

.payments-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.payments-tools {
  display: flex;
  justify-content: flex-end;
}

.payments-chip {
  flex: 0 0 auto;
  border: 1.5px solid #bddfdf;
  border-radius: 999px;
  padding: 0.9rem 1.55rem;
  background: white;
  color: #305d63;
  font-size: 0.98rem;
  font-weight: 700;
}

.payments-chip-active {
  border-color: #2a7371;
  background: #dff0ee;
  color: #216566;
}

.payments-message {
  margin: 0;
  border-radius: 1.1rem;
  padding: 0.95rem 1rem;
  font-weight: 600;
}

.payments-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.payments-list-card {
  overflow: hidden;
  border-radius: 1.9rem;
  border: 1px solid #bfdedd;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(20, 82, 76, 0.08);
}

.payments-list > :deep(.payment-row:not(:last-child)) {
  border-bottom: 1px solid #d4ebe8;
}

.payments-list-state {
  padding: 1.4rem;
  color: #6f9a9d;
  font-size: 0.98rem;
}

.payments-pagination {
  display: grid;
  gap: 0.9rem;
}

.payments-pagination-mobile {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.payments-pagination-desktop {
  justify-self: center;
}

.payments-page-button {
  border: 1px solid #cfe4e1;
  border-radius: 999px;
  padding: 0.8rem 1.1rem;
  background: rgba(255, 255, 255, 0.96);
  color: #1f5f63;
  font-weight: 700;
}

.payments-page-button:disabled {
  opacity: 0.45;
}

.payments-page-indicator {
  color: #6f9a9d;
  font-size: 0.92rem;
  font-weight: 700;
}

.payments-fab {
  position: fixed;
  right: 1.25rem;
  bottom: calc(5.75rem + env(safe-area-inset-bottom));
  z-index: 35;
  width: 4.45rem;
  height: 4.45rem;
  font-size: 2rem;
}

@media (min-width: 961px) {
  .payments-fab {
    display: none;
  }
}

@media (max-width: 960px) {
  .payments-page {
    gap: 1rem;
    padding-bottom: calc(4.45rem + 5.75rem + 1.5rem + env(safe-area-inset-bottom));
  }

  .payments-header {
    display: none;
  }

  .payments-add-desktop {
    display: none;
  }
}

@media (max-width: 640px) {
  .payments-tools {
    justify-content: stretch;
  }

  .payments-export-link {
    width: 100%;
    justify-content: center;
  }

  .payments-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.1rem;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .payments-chips::-webkit-scrollbar {
    display: none;
  }

  .payments-chip {
    padding: 0.82rem 1.25rem;
  }

  .payments-pagination-mobile {
    display: flex;
  }

  .payments-pagination-desktop {
    display: none;
  }
}
</style>
