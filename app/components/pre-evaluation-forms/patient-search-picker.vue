<script setup lang="ts">
import type { PatientListItem } from '~~/src/domain/repositories/patient-repository'

defineProps<{
  modelValue: boolean
  searchTerm: string
  results: PatientListItem[]
  loading: boolean
  pending: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:searchTerm': [value: string]
  select: [patientId: string]
}>()

const close = () => emit('update:modelValue', false)
</script>

<template>
  <div v-if="modelValue" class="picker-overlay" @click.self="close">
    <div class="surface-card picker-card" role="dialog" aria-modal="true" aria-label="Vincular a paciente existente">
      <div class="picker-header">
        <h2 class="picker-title">Vincular a paciente existente</h2>
        <button type="button" class="picker-close" aria-label="Cerrar" @click="close">
          <UIcon name="i-heroicons-x-mark-20-solid" />
        </button>
      </div>

      <div class="picker-search-shell">
        <UIcon name="i-heroicons-magnifying-glass-20-solid" class="picker-search-icon" />
        <input
          type="text"
          :value="searchTerm"
          placeholder="Buscar por nombre..."
          class="picker-search-input"
          @input="emit('update:searchTerm', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <div class="picker-results">
        <p v-if="loading" class="picker-state">Buscando...</p>
        <p v-else-if="results.length === 0" class="picker-state">
          No se encontraron pacientes.
        </p>
        <ul v-else class="picker-list">
          <li v-for="patient in results" :key="patient.id" class="picker-item">
            <div class="picker-item-copy">
              <p class="picker-item-name">{{ patient.fullName }}</p>
              <p class="picker-item-phone">{{ patient.phone }}</p>
            </div>
            <button
              type="button"
              class="picker-select-button"
              :disabled="pending"
              @click="emit('select', patient.id)"
            >
              Seleccionar
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.picker-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 59, 57, 0.35);
  z-index: 50;
  padding: 1rem;
}

.picker-card {
  width: 100%;
  max-width: 30rem;
  max-height: 80vh;
  padding: 1.4rem;
  display: grid;
  gap: 1rem;
  grid-template-rows: auto auto 1fr;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
}

.picker-close {
  color: var(--text-soft);
  font-size: 1.3rem;
}

.picker-search-shell {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 3.4rem;
  padding: 0 1rem 0 3rem;
  border-radius: 1.1rem;
  background: #edf7f5;
  border: 1px solid #d5ebe7;
}

.picker-search-icon {
  position: absolute;
  left: 0.9rem;
  color: #7ca0a2;
  font-size: 1.25rem;
}

.picker-search-input {
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  color: #305d63;
  font-size: 1rem;
  outline: none;
}

.picker-results {
  overflow-y: auto;
}

.picker-state {
  margin: 0;
  padding: 1rem 0;
  color: #6f9a9d;
  font-size: 0.95rem;
}

.picker-list {
  display: grid;
  gap: 0.6rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  border: 1px solid #d2e8e5;
  border-radius: 1rem;
  padding: 0.8rem 1rem;
  background: rgba(248, 252, 251, 0.96);
}

.picker-item-copy {
  min-width: 0;
}

.picker-item-name {
  margin: 0;
  color: #111827;
  font-weight: 700;
  font-size: 0.98rem;
}

.picker-item-phone {
  margin: 0.15rem 0 0;
  color: #6f9a9d;
  font-size: 0.88rem;
}

.picker-select-button {
  flex-shrink: 0;
  border: 0;
  border-radius: 999px;
  padding: 0.55rem 1rem;
  background: #176f6d;
  color: white;
  font-weight: 700;
  font-size: 0.88rem;
}

.picker-select-button:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
