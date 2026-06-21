<script setup lang="ts">
import { useAppointmentsScreen } from '../composables/appointments/use-appointments-screen'

definePageMeta({
  middleware: 'auth',
})

const screen = await useAppointmentsScreen()
</script>

<template>
  <div class="space-y-6">
    <SharedSectionHeader
      eyebrow="Citas"
      title="Agenda y registro de citas"
    />

    <section class="grid gap-4 xl:grid-cols-[minmax(340px,440px)_minmax(0,1fr)]">
      <article class="surface-card space-y-4 rounded-[28px] p-5">
        <div class="space-y-1">
          <p class="text-lg font-semibold text-slate-900">
            {{ screen.editingAppointmentId.value ? 'Editar cita' : 'Nueva cita' }}
          </p>
          <p class="text-sm text-slate-500">
            Si no hay disponibilidad configurada, se crea una base inicial de lunes a viernes, 09:00 a 18:00.
          </p>
        </div>

        <div
          v-if="!screen.patients.value.length || !screen.services.value.length"
          class="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700"
        >
          Necesitas al menos un paciente y un servicio para registrar citas.
        </div>

        <form v-else class="space-y-4" @submit.prevent="screen.submitAppointment">
          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Paciente</span>
            <select
              v-model="screen.form.patientId"
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              required
            >
              <option v-for="patient in screen.patients.value" :key="patient.id" :value="patient.id">
                {{ patient.fullName }}
              </option>
            </select>
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Servicio</span>
            <select
              v-model="screen.form.serviceId"
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              required
            >
              <option v-for="service in screen.services.value" :key="service.id" :value="service.id">
                {{ service.name }} · {{ service.defaultDurationMinutes }} min
              </option>
            </select>
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Inicio</span>
            <input
              v-model="screen.form.startAt"
              type="datetime-local"
              required
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <label class="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm font-medium text-slate-700">
            <input v-model="screen.form.isUrgent" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500">
            Marcar como urgente
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Motivo breve</span>
            <input
              v-model="screen.form.reason"
              type="text"
              placeholder="Control postoperatorio"
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Notas administrativas</span>
            <textarea
              v-model="screen.form.notes"
              rows="4"
              placeholder="Observaciones de agenda o coordinacion."
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <button
            class="w-full rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
            type="submit"
            :disabled="screen.pending.value"
          >
            {{ screen.pending.value ? 'Guardando...' : screen.editingAppointmentId.value ? 'Guardar cambios' : 'Registrar cita' }}
          </button>

          <button
            v-if="screen.editingAppointmentId.value"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            @click="screen.cancelEditingAppointment"
          >
            Cancelar edicion
          </button>

          <p v-if="screen.errorMessage.value" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {{ screen.errorMessage.value }}
          </p>
          <p v-if="screen.successMessage.value" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {{ screen.successMessage.value }}
          </p>
        </form>
      </article>

      <section class="surface-card rounded-[28px] p-5">
        <div class="mb-4 flex items-center justify-between gap-4">
          <div>
            <p class="text-lg font-semibold text-slate-900">Agenda de hoy</p>
          </div>
          <span class="pill">{{ screen.appointments.value.length }} citas</span>
        </div>

        <div v-if="screen.appointments.value.length" class="grid gap-3">
          <article
            v-for="appointment in screen.appointments.value"
            :key="appointment.id"
            class="rounded-3xl border border-teal-100 bg-white/80 p-4"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-1">
                <p class="text-sm font-semibold text-teal-700">{{ appointment.timeLabel }}</p>
                <p class="text-base font-semibold text-slate-900">{{ appointment.patientName }}</p>
                <p class="text-sm text-slate-500">{{ appointment.serviceName }}</p>
                <p v-if="appointment.reason" class="text-sm text-slate-600">
                  Motivo: {{ appointment.reason }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <span class="pill">{{ appointment.statusLabel }}</span>
                <span v-if="appointment.isUrgent" class="pill">Urgente</span>
              </div>
            </div>

            <div class="mt-4 grid gap-3 border-t border-slate-100 pt-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
              <label class="grid gap-1">
                <span class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Estado</span>
                <select
                  :value="appointment.status"
                  class="rounded-2xl border border-teal-100 bg-white/90 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="!screen.canChangeAppointmentStatus(appointment) || screen.appointmentActionPendingId.value === appointment.id"
                  @change="screen.submitAppointmentStatusSelection(appointment, ($event.target as HTMLSelectElement).value)"
                >
                  <option
                    v-for="statusOption in screen.appointmentStatusesForUi"
                    :key="statusOption.value"
                    :value="statusOption.value"
                  >
                    {{ statusOption.label }}
                  </option>
                </select>
              </label>

              <button
                class="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="!screen.canEditAppointment(appointment) || screen.appointmentActionPendingId.value === appointment.id"
                @click="screen.startEditingAppointment(appointment)"
              >
                Editar
              </button>

              <button
                class="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="!screen.canCancelAppointment(appointment) || screen.appointmentActionPendingId.value === appointment.id"
                @click="screen.submitAppointmentCancellation(appointment)"
              >
                {{ screen.appointmentActionPendingId.value === appointment.id ? 'Procesando...' : 'Cancelar cita' }}
              </button>
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
