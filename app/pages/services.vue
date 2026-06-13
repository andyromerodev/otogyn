<script setup lang="ts">
import type { MedicalService } from '../../src/domain/entities/medical-service'

definePageMeta({
  middleware: 'auth',
})

const { data: services } = await useFetch<MedicalService[]>('/api/services')
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Servicios"
      title="Catalogo inicial de servicios"
      description="Los servicios demo permiten poblar citas y pruebas sin tocar datos reales."
    />

    <div class="services-grid">
      <article
        v-for="service in services ?? []"
        :key="service.id"
        class="surface-card service-card"
      >
        <div>
          <p class="service-name">{{ service.name }}</p>
          <p class="muted-text">{{ service.description ?? 'Sin descripcion administrativa' }}</p>
        </div>
        <div class="service-meta">
          <span class="pill">{{ service.defaultDurationMinutes }} min</span>
          <span class="pill" v-if="service.price">S/ {{ service.price }}</span>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.services-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.service-card {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
}

.service-name {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  font-weight: 700;
}

.service-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
}
</style>
