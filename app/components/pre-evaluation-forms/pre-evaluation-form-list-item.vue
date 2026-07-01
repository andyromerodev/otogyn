<script setup lang="ts">
import type { PreEvaluationForm } from '~~/src/domain/entities/pre-evaluation-form'

const props = defineProps<{
  form: PreEvaluationForm
}>()

const initials = computed(() => {
  const words = props.form.fullName.trim().split(/\s+/).filter(Boolean)

  if (!words.length) {
    return '?'
  }

  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? words[words.length - 1]?.[0] ?? '' : ''

  return `${first}${last}`.toUpperCase()
})

const statusLabel = computed(() => {
  switch (props.form.status) {
    case 'pending_review': return 'Pendiente'
    case 'reviewed': return 'Revisado'
    case 'scheduled': return 'Agendado'
    case 'dismissed': return 'Descartado'
    default: return props.form.status
  }
})

const formattedDate = computed(() =>
  new Date(props.form.createdAt).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }),
)
</script>

<template>
  <NuxtLink :to="`/pre-evaluacion-forms/${form.id}`" class="preeval-row-link">
    <article class="preeval-row">
      <div class="preeval-row-content">
        <div class="preeval-row-main">
          <span class="preeval-avatar">{{ initials }}</span>

          <div class="preeval-copy">
            <p class="preeval-name">{{ form.fullName }}</p>
            <p class="preeval-subtitle">{{ form.phone }} · {{ formattedDate }}</p>
          </div>
        </div>

        <div class="preeval-row-side">
          <span
            class="preeval-status"
            :class="{ 'preeval-status-pending': form.status === 'pending_review', 'preeval-status-reviewed': form.status === 'reviewed' }"
          >
            {{ statusLabel }}
          </span>
          <UIcon name="i-heroicons-chevron-right-20-solid" class="preeval-chevron" />
        </div>
      </div>
    </article>
  </NuxtLink>
</template>

<style scoped>
.preeval-row-link {
  display: block;
  color: inherit;
}

.preeval-row {
  padding: 1.25rem 1.2rem;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.preeval-row-link:hover .preeval-row {
  background: rgba(245, 251, 250, 0.88);
}

.preeval-row-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.preeval-row-main,
.preeval-row-side {
  display: flex;
  align-items: center;
}

.preeval-row-main {
  min-width: 0;
  gap: 1rem;
}

.preeval-avatar {
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

.preeval-copy {
  min-width: 0;
}

.preeval-name {
  margin: 0;
  color: #111827;
  font-size: 1.18rem;
  font-weight: 700;
  line-height: 1.15;
}

.preeval-subtitle {
  margin: 0.35rem 0 0;
  color: #6f9a9d;
  font-size: 1rem;
  line-height: 1.35;
}

.preeval-row-side {
  flex: 0 0 auto;
  gap: 0.65rem;
}

.preeval-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 5.5rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: #fbe8eb;
  color: #b4233c;
  font-size: 0.92rem;
  font-weight: 700;
}

.preeval-status-pending {
  background: #fef3e2;
  color: #b45309;
}

.preeval-status-reviewed {
  background: #e4f3ee;
  color: #21695f;
}

.preeval-chevron {
  color: #80a9a9;
  font-size: 1.35rem;
}

@media (max-width: 640px) {
  .preeval-row {
    padding: 1.1rem 1rem;
  }

  .preeval-avatar {
    width: 3.8rem;
    height: 3.8rem;
    font-size: 1.25rem;
  }

  .preeval-name {
    font-size: 1rem;
  }

  .preeval-subtitle {
    font-size: 0.95rem;
  }

  .preeval-row-side {
    align-self: stretch;
    flex-direction: column;
  }
}
</style>
