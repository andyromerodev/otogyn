<script setup lang="ts">
import type { PreEvaluationForm } from '~~/src/domain/entities/pre-evaluation-form'

const props = defineProps<{
  form: PreEvaluationForm
}>()

const emit = defineEmits<{
  delete: [form: PreEvaluationForm]
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
  <div class="preeval-card">
    <NuxtLink :to="`/pre-evaluacion-forms/${form.id}`" class="preeval-card-link">
      <span class="preeval-avatar">{{ initials }}</span>

      <div class="preeval-info">
        <p class="preeval-name">{{ form.fullName }}</p>
        <p class="preeval-subtitle">{{ form.phone }} · {{ formattedDate }}</p>

        <!-- Badge for mobile view (stacked below phone/date) -->
        <div class="preeval-mobile-badge">
          <span
            class="preeval-status"
            :class="{
              'preeval-status-pending': form.status === 'pending_review',
              'preeval-status-reviewed': form.status === 'reviewed',
            }"
          >
            {{ statusLabel }}
          </span>
        </div>
      </div>

      <!-- Badge and chevron for desktop view -->
      <div class="preeval-desktop-side">
        <span
          class="preeval-status"
          :class="{
            'preeval-status-pending': form.status === 'pending_review',
            'preeval-status-reviewed': form.status === 'reviewed',
          }"
        >
          {{ statusLabel }}
        </span>
        <UIcon name="i-heroicons-chevron-right-20-solid" class="preeval-chevron" />
      </div>
    </NuxtLink>

    <div class="preeval-action">
      <button
        type="button"
        class="preeval-delete-btn"
        title="Eliminar paciente"
        aria-label="Eliminar paciente"
        @click="emit('delete', form)"
      >
        <UIcon name="i-heroicons-trash-20-solid" class="preeval-delete-icon" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.preeval-card {
  display: flex;
  align-items: center;
  transition: background-color 160ms ease;
}

.preeval-card:hover {
  background: rgba(245, 251, 250, 0.88);
}

.preeval-card-link {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 1.15rem;
  padding: 1.25rem 1.2rem;
  color: inherit;
  text-decoration: none;
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

.preeval-info {
  flex: 1;
  min-width: 0;
}

.preeval-name {
  margin: 0;
  color: #111827;
  font-size: 1.18rem;
  font-weight: 700;
  line-height: 1.25;
  word-break: break-word;
}

.preeval-subtitle {
  margin: 0.35rem 0 0;
  color: #6f9a9d;
  font-size: 1rem;
  line-height: 1.35;
}

.preeval-desktop-side {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.preeval-mobile-badge {
  display: none;
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

.preeval-action {
  flex: 0 0 auto;
  padding-right: 1.2rem;
  display: flex;
  align-items: center;
}

.preeval-delete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.65rem;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 160ms ease;
}

.preeval-delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.preeval-delete-icon {
  font-size: 1.3rem;
}

@media (max-width: 640px) {
  .preeval-card-link {
    gap: 0.85rem;
    padding: 1rem 0.5rem 1rem 0.9rem;
  }

  .preeval-avatar {
    width: 2.9rem;
    height: 2.9rem;
    font-size: 1.05rem;
  }

  .preeval-name {
    font-size: 1.05rem;
    line-height: 1.25;
  }

  .preeval-subtitle {
    font-size: 0.85rem;
    margin-top: 0.2rem;
  }

  .preeval-desktop-side {
    display: none;
  }

  .preeval-mobile-badge {
    display: flex;
    align-items: center;
    margin-top: 0.35rem;
  }

  .preeval-mobile-badge .preeval-status {
    min-width: auto;
    padding: 0.2rem 0.6rem;
    font-size: 0.78rem;
    font-weight: 700;
  }

  .preeval-action {
    padding-right: 0.75rem;
  }

  .preeval-delete-btn {
    width: 2.35rem;
    height: 2.35rem;
  }

  .preeval-delete-icon {
    font-size: 1.2rem;
  }
}
</style>
