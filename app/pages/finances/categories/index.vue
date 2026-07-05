<script setup lang="ts">
import { useExpenseCategoriesViewModel } from '../../../composables/finances/use-expense-categories-view-model'

definePageMeta({
  middleware: 'auth',
})

const vm = useExpenseCategoriesViewModel()
</script>

<template>
  <div class="categories-page">
    <div class="categories-header">
      <div class="categories-header-left">
        <NuxtLink to="/finances/expenses" class="categories-back">
          <UIcon name="i-heroicons-arrow-left-20-solid" />
        </NuxtLink>
        <div>
          <h1 class="categories-title">Categorías de gastos</h1>
          <p class="categories-subtitle">{{ vm.categories.value.length }} categorías</p>
        </div>
      </div>

      <button type="button" class="categories-add-btn" @click="vm.openCreateForm">
        <UIcon name="i-heroicons-plus-20-solid" />
        <span>Nueva</span>
      </button>
    </div>

    <ClientOnly>
      <!-- Create form inline -->
      <div v-if="vm.showCreateForm.value" class="categories-create-card">
        <p class="categories-create-title">Nueva categoría</p>
        <p v-if="vm.createError.value" class="categories-error">{{ vm.createError.value }}</p>
        <div class="categories-create-row">
          <input
            v-model="vm.createForm.name"
            type="text"
            class="categories-input"
            placeholder="Nombre de la categoría"
            maxlength="120"
            autofocus
            @keydown.enter.prevent="vm.submitCreate"
            @keydown.escape="vm.closeCreateForm"
          >
          <button
            type="button"
            class="categories-btn-confirm"
            :disabled="vm.createLoading.value"
            @click="vm.submitCreate"
          >
            {{ vm.createLoading.value ? 'Guardando...' : 'Guardar' }}
          </button>
          <button type="button" class="categories-btn-cancel" @click="vm.closeCreateForm">
            Cancelar
          </button>
        </div>
      </div>

      <p v-if="vm.errorMessage.value" class="categories-error categories-error-global">
        {{ vm.errorMessage.value }}
      </p>

      <section class="categories-list-card">
        <div v-if="vm.loading.value" class="categories-state">
          Cargando categorías...
        </div>

        <div v-else-if="!vm.categories.value.length" class="categories-state">
          Aún no hay categorías. Crea la primera.
        </div>

        <ul v-else class="categories-list">
          <li
            v-for="cat in vm.categories.value"
            :key="cat.id"
            class="categories-item"
            :class="{ 'categories-item-inactive': !cat.isActive }"
          >
            <!-- Edit mode -->
            <template v-if="vm.editingId.value === cat.id">
              <div class="categories-edit-row">
                <input
                  v-model="vm.editForm.name"
                  type="text"
                  class="categories-input"
                  maxlength="120"
                  @keydown.enter.prevent="vm.submitEdit"
                  @keydown.escape="vm.cancelEdit"
                >
                <button
                  type="button"
                  class="categories-btn-confirm"
                  :disabled="vm.editLoading.value"
                  @click="vm.submitEdit"
                >
                  {{ vm.editLoading.value ? '...' : 'OK' }}
                </button>
                <button type="button" class="categories-btn-cancel" @click="vm.cancelEdit">
                  ✕
                </button>
              </div>
              <p v-if="vm.editError.value" class="categories-error">{{ vm.editError.value }}</p>
            </template>

            <!-- View mode -->
            <template v-else>
              <div class="categories-item-info">
                <span class="categories-item-name">{{ cat.name }}</span>
                <span v-if="!cat.isActive" class="categories-item-inactive-badge">Inactiva</span>
              </div>

              <div class="categories-item-actions">
                <button
                  type="button"
                  class="categories-action-btn"
                  title="Editar nombre"
                  @click="vm.startEdit(cat)"
                >
                  <UIcon name="i-heroicons-pencil-square-20-solid" />
                </button>
                <button
                  v-if="cat.isActive"
                  type="button"
                  class="categories-action-btn categories-action-btn-deactivate"
                  title="Desactivar"
                  @click="vm.deactivate(cat.id)"
                >
                  <UIcon name="i-heroicons-eye-slash-20-solid" />
                </button>
                <button
                  v-else
                  type="button"
                  class="categories-action-btn categories-action-btn-reactivate"
                  title="Reactivar"
                  @click="vm.reactivate(cat.id)"
                >
                  <UIcon name="i-heroicons-eye-20-solid" />
                </button>
              </div>
            </template>
          </li>
        </ul>
      </section>
    </ClientOnly>
  </div>
</template>

<style scoped>
.categories-page {
  display: grid;
  gap: 1.25rem;
  max-width: 40rem;
}

.categories-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.categories-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.categories-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 999px;
  border: 1px solid #d4ebe8;
  color: #305d63;
  font-size: 1.25rem;
  transition: background-color 160ms ease;
}

.categories-back:hover {
  background: #edf7f5;
}

.categories-title {
  margin: 0;
  color: #132b2d;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.categories-subtitle {
  margin: 0.25rem 0 0;
  color: #7ca0a2;
  font-size: 1rem;
}

.categories-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  padding: 0.75rem 1.35rem;
  background: #1b7676;
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: 0 8px 22px rgba(23, 95, 91, 0.16);
  transition: transform 160ms ease;
}

.categories-add-btn:hover {
  transform: translateY(-1px);
}

.categories-create-card {
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem 1.4rem;
  border-radius: 1.25rem;
  border: 1.5px solid #2a7371;
  background: #f9fdfc;
}

.categories-create-title {
  margin: 0;
  color: #132b2d;
  font-size: 0.95rem;
  font-weight: 700;
}

.categories-create-row,
.categories-edit-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.categories-input {
  flex: 1;
  border: 1.5px solid #bddfdf;
  border-radius: 0.75rem;
  padding: 0.7rem 0.9rem;
  background: white;
  color: #132b2d;
  font-size: 1rem;
  outline: none;
  transition: border-color 160ms ease;
}

.categories-input:focus {
  border-color: #2a7371;
}

.categories-btn-confirm {
  border-radius: 999px;
  padding: 0.65rem 1.1rem;
  background: #1b7676;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.categories-btn-confirm:disabled {
  opacity: 0.6;
}

.categories-btn-cancel {
  border-radius: 999px;
  padding: 0.65rem 1rem;
  border: 1px solid #d4ebe8;
  color: #6f9a9d;
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.categories-error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.88rem;
  font-weight: 600;
}

.categories-error-global {
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  background: #fff1f2;
}

.categories-list-card {
  overflow: hidden;
  border-radius: 1.75rem;
  border: 1px solid #bfdedd;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 32px rgba(20, 82, 76, 0.07);
}

.categories-state {
  padding: 1.4rem;
  color: #6f9a9d;
  font-size: 0.98rem;
}

.categories-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.categories-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.05rem 1.2rem;
  flex-direction: column;
  align-items: stretch;
}

.categories-item:not(:last-child) {
  border-bottom: 1px solid #d4ebe8;
}

.categories-item:not(.categories-item-inactive) .categories-item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.categories-item:not(.categories-item-inactive) {
  flex-direction: row;
}

.categories-item-inactive {
  opacity: 0.55;
  flex-direction: row;
}

.categories-item-inactive .categories-item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.categories-item-name {
  color: #111827;
  font-size: 1.02rem;
  font-weight: 600;
}

.categories-item-inactive-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 0.8rem;
  font-weight: 700;
}

.categories-item-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex: 0 0 auto;
}

.categories-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  color: #6f9a9d;
  font-size: 1.15rem;
  transition: background-color 160ms ease, color 160ms ease;
}

.categories-action-btn:hover {
  background: #edf7f5;
  color: #305d63;
}

.categories-action-btn-deactivate:hover {
  background: #fff1f2;
  color: #b91c1c;
}

.categories-action-btn-reactivate:hover {
  background: #d1fae5;
  color: #065f46;
}
</style>
