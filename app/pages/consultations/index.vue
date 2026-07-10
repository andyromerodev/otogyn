<script setup lang="ts">
import { useSessionContext } from '~/composables/auth/use-session-context'

definePageMeta({
  middleware: 'auth',
})

const config = useRuntimeConfig()
const isAuthEnabled = computed(() => config.public.authEnabled)

const { sessionContext } = useSessionContext()

const links = computed(() => [
  {
    label: 'Citas',
    description: 'Crear, editar y cambiar estado de citas.',
    to: '/appointments',
    icon: 'i-heroicons-calendar-days',
  },
  {
    label: 'Servicios',
    description: 'Catalogo de servicios medicos y duraciones.',
    to: '/services',
    icon: 'i-heroicons-clipboard-document-list',
  },
  {
    label: 'Pre-evaluaciones',
    description: 'Formularios de pre-evaluacion recibidos de pacientes.',
    to: '/pre-evaluacion-forms',
    icon: 'i-heroicons-clipboard-document-check',
  },
  ...(sessionContext.value?.role === 'admin_doctor'
    ? [
        {
          label: 'Finanzas',
          description: 'Pagos, gastos, categorias y resumen financiero.',
          to: '/finances',
          icon: 'i-heroicons-banknotes',
        },
        {
          label: 'Estadísticas',
          description: 'Indicadores de citas: completadas, cancelaciones y tendencias.',
          to: '/statistics',
          icon: 'i-heroicons-chart-bar',
        },
        {
          label: 'Disponibilidad',
          description: 'Horarios de atencion y bloqueos.',
          to: '/availability',
          icon: 'i-heroicons-clock',
        },
        {
          label: 'Ajustes',
          description: 'Gestion de asistentes y permisos.',
          to: '/settings',
          icon: 'i-heroicons-cog-6-tooth',
        },
      ]
    : []),
  {
    label: 'Reserva publica',
    description: 'Vista del formulario de reserva sin autenticacion.',
    to: '/book',
    icon: 'i-heroicons-globe-alt',
  },
  {
    label: 'Formulario de pre-evaluación',
    description: 'Vista publica del formulario de pre-evaluacion sin autenticacion.',
    to: '/pre-evaluacion',
    icon: 'i-heroicons-clipboard-document-check',
  },
])

const handleSignOut = async () => {
  if (!isAuthEnabled.value) {
    return
  }

  const { useAuthClient } = await import('~/utils/auth-client')
  const authClient = useAuthClient()

  await authClient.signOut()
  await clearPwaCaches()

  if (import.meta.client) {
    window.location.replace('/login')
    return
  }

  await navigateTo('/login')
}
</script>

<template>
  <div class="space-y-6">
    <SharedSectionHeader
      eyebrow="Consultas"
      title="Centro de consultas"
      description="Accede a citas, servicios y configuracion administrativa."
    />

    <div class="consultations-mobile-account-grid md:hidden">
      <article class="surface-card consultations-mobile-account-card">
        <span class="consultations-mobile-icon">
          <UIcon name="i-heroicons-user-circle" />
        </span>

        <div class="min-w-0">
          <p class="consultations-mobile-label">Perfil</p>
          <p class="consultations-mobile-title">{{ sessionContext?.name ?? 'OtoGyn' }}</p>
          <p class="consultations-mobile-copy">
            {{ sessionContext?.role === 'admin_doctor' ? 'Doctora administradora' : 'Asistente de agenda' }}
          </p>
        </div>
      </article>

      <button
        v-if="sessionContext"
        type="button"
        class="surface-card consultations-mobile-account-card consultations-mobile-account-card-action"
        @click="handleSignOut"
      >
        <span class="consultations-mobile-icon consultations-mobile-icon-dark">
          <UIcon name="i-heroicons-arrow-right-on-rectangle" />
        </span>

        <div class="min-w-0 text-left">
          <p class="consultations-mobile-label">Sesion</p>
          <p class="consultations-mobile-title">Salir</p>
          <p class="consultations-mobile-copy">Cerrar la sesion actual del consultorio.</p>
        </div>
      </button>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="surface-card flex items-start gap-3 rounded-[28px] p-5 transition hover:-translate-y-0.5"
      >
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-xl text-teal-700">
          <UIcon :name="link.icon" />
        </span>
        <div>
          <p class="font-semibold text-slate-900">{{ link.label }}</p>
          <p class="text-sm text-slate-500">{{ link.description }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.consultations-mobile-account-grid {
  display: grid;
  gap: 0.75rem;
}

.consultations-mobile-account-card {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  border-radius: 1.75rem;
  padding: 1rem 1.1rem;
}

.consultations-mobile-account-card-action {
  width: 100%;
  border: 0;
  background: rgba(255, 255, 255, 0.96);
}

.consultations-mobile-icon {
  display: inline-flex;
  height: 3rem;
  width: 3rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  background: #ecfdf5;
  color: #0f766e;
  font-size: 1.4rem;
}

.consultations-mobile-icon-dark {
  background: #0f172a;
  color: #f8fafc;
}

.consultations-mobile-label,
.consultations-mobile-title,
.consultations-mobile-copy {
  margin: 0;
}

.consultations-mobile-label {
  color: #7b9ea1;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.consultations-mobile-title {
  margin-top: 0.2rem;
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 700;
}

.consultations-mobile-copy {
  margin-top: 0.18rem;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.35;
}
</style>
