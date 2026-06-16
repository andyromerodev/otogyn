<script setup lang="ts">
import type { MedicalService } from '~~/src/domain/entities/medical-service'
import type { SessionUserContext } from '~~/server/utils/get-current-user'

definePageMeta({
  middleware: 'auth',
})

const form = reactive({
  name: '',
  description: '',
  defaultDurationMinutes: 30,
  price: '',
  isActive: true,
})

const pending = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const { data: session } = await useFetch<SessionUserContext>('/api/auth/session-context')
const { data: services, refresh } = await useFetch<MedicalService[]>('/api/services')

const canCreateServices = computed(() => session.value?.role === 'admin_doctor')

const submitService = async () => {
  pending.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    await $fetch('/api/services', {
      method: 'POST',
      body: {
        name: form.name,
        description: form.description.trim() || null,
        defaultDurationMinutes: form.defaultDurationMinutes,
        price: form.price.trim() ? Number(form.price) : null,
        isActive: form.isActive,
      },
    })

    form.name = ''
    form.description = ''
    form.defaultDurationMinutes = 30
    form.price = ''
    form.isActive = true

    successMessage.value = 'Servicio registrado correctamente.'
    await refresh()
  } catch (error) {
    errorMessage.value =
      error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
        ? error.statusMessage
        : 'No se pudo registrar el servicio.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <SharedSectionHeader
      eyebrow="Servicios"
      title="Catalogo de servicios"
      description="Los servicios se guardan en PostgreSQL y quedan listos para usarse en citas reales."
    />

    <section class="grid gap-4 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
      <article
        v-if="canCreateServices"
        class="surface-card space-y-4 rounded-[28px] p-5"
      >
        <div class="space-y-1">
          <p class="text-lg font-semibold text-slate-900">Nuevo servicio</p>
          <p class="text-sm text-slate-500">Duracion, precio opcional y estado activo.</p>
        </div>

        <form class="space-y-4" @submit.prevent="submitService">
          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Nombre</span>
            <input
              v-model="form.name"
              type="text"
              placeholder="Consulta ORL"
              required
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Descripcion</span>
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Detalle administrativo del servicio."
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Duracion (min)</span>
              <input
                v-model.number="form.defaultDurationMinutes"
                type="number"
                min="1"
                max="480"
                required
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>

            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Precio (opcional)</span>
              <input
                v-model="form.price"
                type="number"
                min="0"
                step="0.01"
                placeholder="150.00"
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>
          </div>

          <label class="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm font-medium text-slate-700">
            <input v-model="form.isActive" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500">
            Servicio activo para agendar
          </label>

          <button
            class="w-full rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
            type="submit"
            :disabled="pending"
          >
            {{ pending ? 'Guardando...' : 'Registrar servicio' }}
          </button>

          <p v-if="errorMessage" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {{ errorMessage }}
          </p>
          <p v-if="successMessage" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {{ successMessage }}
          </p>
        </form>
      </article>

      <section class="grid gap-4 md:grid-cols-2">
        <article
          v-for="service in services ?? []"
          :key="service.id"
          class="surface-card space-y-4 rounded-[28px] p-5"
        >
          <div class="space-y-1">
            <p class="text-lg font-semibold text-slate-900">{{ service.name }}</p>
            <p class="text-sm leading-6 text-slate-500">
              {{ service.description ?? 'Sin descripcion administrativa' }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <span class="pill">{{ service.defaultDurationMinutes }} min</span>
            <span v-if="service.price !== null" class="pill">S/ {{ service.price.toFixed(2) }}</span>
            <span class="pill" :class="service.isActive ? '' : 'bg-slate-200 text-slate-600'">
              {{ service.isActive ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </article>

        <article
          v-if="!services?.length"
          class="surface-card rounded-[28px] p-5 text-sm text-slate-500 md:col-span-2"
        >
          Aun no hay servicios registrados para esta organizacion.
        </article>
      </section>
    </section>
  </div>
</template>
