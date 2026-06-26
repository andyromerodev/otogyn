<script setup lang="ts">
import type { MedicalService } from '~~/src/domain/entities/medical-service'

const props = defineProps<{
  service: MedicalService
}>()

const initials = computed(() => {
  const words = props.service.name.trim().split(/\s+/).filter(Boolean)

  if (!words.length) {
    return '?'
  }

  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? words[words.length - 1]?.[0] ?? '' : ''

  return `${first}${last}`.toUpperCase()
})
</script>

<template>
  <NuxtLink :to="`/services/${service.id}`" class="service-row-link">
    <article class="service-row">
      <div class="service-row-content">
        <div class="service-row-main">
          <span class="service-avatar">{{ initials }}</span>

          <div class="service-copy">
            <p class="service-name">{{ service.name }}</p>
            <p class="service-subtitle">{{ service.description ?? 'Sin descripción administrativa' }}</p>
            <div class="service-chips">
              <span class="service-chip">{{ service.defaultDurationMinutes }} min</span>
              <span v-if="service.price !== null" class="service-chip">S/ {{ service.price.toFixed(2) }}</span>
              <span class="service-chip" :class="service.isActive ? 'service-chip-active' : 'service-chip-inactive'">
                {{ service.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
        </div>

        <div class="service-row-side">
          <UIcon name="i-heroicons-chevron-right-20-solid" class="service-chevron" />
        </div>
      </div>
    </article>
  </NuxtLink>
</template>

<style scoped>
.service-row-link {
  display: block;
  color: inherit;
}

.service-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem 1.2rem;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.service-row-link:hover .service-row {
  background: rgba(245, 251, 250, 0.88);
}

.service-row-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.service-row-main,
.service-row-side {
  display: flex;
  align-items: center;
}

.service-row-main {
  min-width: 0;
  gap: 1rem;
}

.service-avatar {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 4.2rem;
  height: 4.2rem;
  border-radius: 999px;
  background: #b7d8d7;
  color: #165f61;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.service-copy {
  min-width: 0;
}

.service-name {
  margin: 0;
  color: #111827;
  font-size: 1.18rem;
  font-weight: 700;
  line-height: 1.15;
}

.service-subtitle {
  margin: 0.35rem 0 0;
  color: #6f9a9d;
  font-size: 1rem;
  line-height: 1.35;
}

.service-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.55rem;
}

.service-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: #e4f3ee;
  color: #21695f;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
}

.service-chip-active {
  background: #e4f3ee;
  color: #21695f;
}

.service-chip-inactive {
  background: #fef3e2;
  color: #b45309;
}

.service-row-side {
  flex: 0 0 auto;
  gap: 0.65rem;
}

.service-chevron {
  color: #80a9a9;
  font-size: 1.35rem;
}

@media (max-width: 640px) {
  .service-row {
    padding: 1.1rem 1rem;
  }

  .service-avatar {
    width: 3.8rem;
    height: 3.8rem;
    font-size: 1.25rem;
  }

  .service-name {
    font-size: 1rem;
  }

  .service-subtitle {
    font-size: 0.95rem;
  }
}
</style>
