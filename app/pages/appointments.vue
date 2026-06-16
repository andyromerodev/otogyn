<script setup lang="ts">
import type { Patient } from '~~/src/domain/entities/patient'
import type { MedicalService } from '~~/src/domain/entities/medical-service'
import type { TodayAppointmentViewModel } from '~~/src/presentation/view-models/dashboard'

definePageMeta({
  middleware: 'auth',
})

const toDatetimeLocalValue = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

const defaultStartAt = () => {
  const date = new Date()
  date.setHours(9, 0, 0, 0)
  return toDatetimeLocalValue(date)
}

const form = reactive({
  patientId: '',
  serviceId: '',
  startAt: defaultStartAt(),
  isUrgent: false,
  reason: '',
  notes: '',
})

const pending = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const { data: patients } = await useFetch<Patient[]>('/api/patients')
const { data: services } = await useFetch<MedicalService[]>('/api/services')
const { data: appointments, refresh } = await useFetch<TodayAppointmentViewModel[]>('/api/appointments/today')

watchEffect(() => {
  if (!form.patientId && patients.value?.[0]?.id) {
    form.patientId = patients.value[0].id
  }

  if (!form.serviceId && services.value?.[0]?.id) {
    form.serviceId = services.value[0].id
  }
})

const submitAppointment = async () => {
  pending.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    await $fetch('/api/appointments', {
      method: 'POST',
      body: {
        patientId: form.patientId,
        serviceId: form.serviceId,
        startAt: form.startAt,
        isUrgent: form.isUrgent,
        reason: form.reason.trim() || null,
        notes: form.notes.trim() || null,
      },
    })

    form.startAt = defaultStartAt()
    form.isUrgent = false
    form.reason = ''
    form.notes = ''

    successMessage.value = 'Cita registrada correctamente.'
    await refresh()
  } catch (error) {
    errorMessage.value =
      error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
        ? error.statusMessage
        : 'No se pudo registrar la cita.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <SharedSectionHeader
      eyebrow="Citas"
      title="Agenda y registro de citas"
      description="Las citas nuevas ya se guardan en PostgreSQL validando paciente, servicio, horario disponible y choques activos."
    />

    <section class="grid gap-4 xl:grid-cols-[minmax(340px,440px)_minmax(0,1fr)]">
      <article class="surface-card space-y-4 rounded-[28px] p-5">
        <div class="space-y-1">
          <p class="text-lg font-semibold text-slate-900">Nueva cita</p>
          <p class="text-sm text-slate-500">
            Si no hay disponibilidad configurada, se crea una base inicial de lunes a viernes, 09:00 a 18:00.
          </p>
        </div>

        <div
          v-if="!patients?.length || !services?.length"
          class="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700"
        >
          Necesitas al menos un paciente y un servicio para registrar citas.
        </div>

        <form v-else class="space-y-4" @submit.prevent="submitAppointment">
          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Paciente</span>
            <select
              v-model="form.patientId"
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              required
            >
              <option v-for="patient in patients ?? []" :key="patient.id" :value="patient.id">
                {{ patient.fullName }}
              </option>
            </select>
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Servicio</span>
            <select
              v-model="form.serviceId"
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              required
            >
              <option v-for="service in services ?? []" :key="service.id" :value="service.id">
                {{ service.name }} · {{ service.defaultDurationMinutes }} min
              </option>
            </select>
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Inicio</span>
            <input
              v-model="form.startAt"
              type="datetime-local"
              required
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <label class="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm font-medium text-slate-700">
            <input v-model="form.isUrgent" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500">
            Marcar como urgente
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Motivo breve</span>
            <input
              v-model="form.reason"
              type="text"
              placeholder="Control postoperatorio"
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Notas administrativas</span>
            <textarea
              v-model="form.notes"
              rows="4"
              placeholder="Observaciones de agenda o coordinacion."
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <button
            class="w-full rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
            type="submit"
            :disabled="pending"
          >
            {{ pending ? 'Guardando...' : 'Registrar cita' }}
          </button>

          <p v-if="errorMessage" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {{ errorMessage }}
          </p>
          <p v-if="successMessage" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {{ successMessage }}
          </p>
        </form>
      </article>

      <section class="surface-card rounded-[28px] p-5">
        <div class="mb-4 flex items-center justify-between gap-4">
          <div>
            <p class="text-lg font-semibold text-slate-900">Agenda de hoy</p>
            <p class="text-sm text-slate-500">Listado real desde PostgreSQL.</p>
          </div>
          <span class="pill">{{ appointments?.length ?? 0 }} citas</span>
        </div>

        <div v-if="appointments?.length" class="grid gap-3">
          <article
            v-for="appointment in appointments"
            :key="appointment.id"
            class="rounded-3xl border border-teal-100 bg-white/80 p-4"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-1">
                <p class="text-sm font-semibold text-teal-700">{{ appointment.timeLabel }}</p>
                <p class="text-base font-semibold text-slate-900">{{ appointment.patientName }}</p>
                <p class="text-sm text-slate-500">{{ appointment.serviceName }}</p>
              </div>

              <div class="flex flex-wrap gap-2">
                <span class="pill">{{ appointment.statusLabel }}</span>
                <span v-if="appointment.isUrgent" class="pill">Urgente</span>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
          No hay citas registradas para hoy.
        </div>
      </section>
    </section>
  </div>
</template>
