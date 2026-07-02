<script setup lang="ts">
import { toAppTimeLabel } from '~~/src/application/utils/date/local-date'
import { useAvailabilityViewModel } from '../composables/availability/use-availability-view-model'

definePageMeta({
  middleware: 'auth',
})

const viewModel = await useAvailabilityViewModel()
</script>

<template>
  <div class="space-y-6">
    <SharedSectionHeader
      eyebrow="Disponibilidad"
      title="Horarios y bloqueos"
      description="Gestiona los horarios de atencion semanal y bloqueos horarios para la organizacion."
    />

    <p v-if="viewModel.errorMessage.value" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
      {{ viewModel.errorMessage.value }}
    </p>
    <p v-if="viewModel.successMessage.value" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
      {{ viewModel.successMessage.value }}
    </p>

    <section class="grid gap-4 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
      <article
        v-if="viewModel.canManageAvailability.value"
        class="surface-card space-y-4 rounded-[28px] p-5"
      >
        <div class="space-y-1">
          <p class="text-lg font-semibold text-slate-900">
            {{ viewModel.editingId.value ? 'Editar horario' : 'Nuevo horario' }}
          </p>
          <p class="text-sm text-slate-500">Configura dia, hora inicio, hora fin y estado activo.</p>
        </div>

        <form class="space-y-4" @submit.prevent="viewModel.submitAvailability">
          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Dia de la semana</span>
            <select
              v-model.number="viewModel.form.weekday"
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              <option
                v-for="(label, index) in viewModel.weekdaysList"
                :key="index"
                :value="index"
              >
                {{ label }}
              </option>
            </select>
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Hora inicio</span>
              <input
                v-model="viewModel.form.startTime"
                type="time"
                required
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>

            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Hora fin</span>
              <input
                v-model="viewModel.form.endTime"
                type="time"
                required
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>
          </div>

          <label class="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm font-medium text-slate-700">
            <input v-model="viewModel.form.isActive" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500">
            Horario activo
          </label>

          <div class="flex flex-wrap gap-3">
            <button
              class="rounded-2xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
              type="submit"
              :disabled="viewModel.pending.value"
            >
              {{ viewModel.pending.value ? 'Guardando...' : (viewModel.editingId.value ? 'Guardar cambios' : 'Registrar horario') }}
            </button>

            <button
              v-if="viewModel.editingId.value"
              class="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              type="button"
              @click="viewModel.cancelEditingAvailability"
            >
              Cancelar
            </button>
          </div>
        </form>

        <hr class="border-teal-100">

        <div class="space-y-1">
          <p class="text-lg font-semibold text-slate-900">Bloquear horario</p>
          <p class="text-sm text-slate-500">Crea un bloqueo para un dia y rango horario especifico.</p>
        </div>

        <form class="space-y-4" @submit.prevent="viewModel.submitBlockedSlot">
          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Fecha</span>
            <input
              v-model="viewModel.blockForm.date"
              type="date"
              required
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Hora inicio</span>
              <input
                v-model="viewModel.blockForm.startTime"
                type="time"
                required
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>

            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Hora fin</span>
              <input
                v-model="viewModel.blockForm.endTime"
                type="time"
                required
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>
          </div>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Motivo (opcional)</span>
            <input
              v-model="viewModel.blockForm.reason"
              type="text"
              placeholder="Almuerzo, reunion, feriado..."
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <button
            class="w-full rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
            type="submit"
            :disabled="viewModel.pending.value"
          >
            {{ viewModel.pending.value ? 'Registrando...' : 'Registrar bloqueo' }}
          </button>
        </form>
      </article>

      <section class="space-y-4">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
          <article
            v-for="avail in viewModel.availabilities.value"
            :key="avail.id"
            class="surface-card flex flex-col gap-3 rounded-[28px] p-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-base font-semibold text-slate-900">{{ viewModel.weekdaysList[avail.weekday] }}</p>
              <span
                class="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="avail.isActive ? 'bg-teal-50 text-teal-700' : 'bg-amber-100 text-amber-700'"
              >
                {{ avail.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </div>

            <p class="whitespace-nowrap text-sm text-slate-500">{{ avail.startTime }} – {{ avail.endTime }}</p>

            <div v-if="viewModel.canManageAvailability.value" class="mt-auto flex gap-2 pt-1">
              <button
                class="flex-1 rounded-2xl border border-teal-200 px-3 py-2 text-center text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
                type="button"
                @click="viewModel.startEditingAvailability(avail)"
              >
                Editar
              </button>
              <button
                class="flex-1 rounded-2xl px-3 py-2 text-center text-xs font-semibold whitespace-nowrap transition disabled:cursor-wait disabled:opacity-70"
                :class="avail.isActive
                  ? 'border border-amber-200 text-amber-700 hover:bg-amber-50'
                  : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'"
                type="button"
                :disabled="viewModel.togglingId.value === avail.id"
                @click="viewModel.toggleAvailabilityActive(avail.id)"
              >
                {{ viewModel.togglingId.value === avail.id ? '...' : (avail.isActive ? 'Desactivar' : 'Activar') }}
              </button>
            </div>
          </article>

          <article
            v-if="!viewModel.availabilities.value.length"
            class="surface-card rounded-[28px] p-5 text-sm text-slate-500 sm:col-span-full"
          >
            Aun no hay horarios configurados para esta organizacion.
          </article>
        </div>

        <article v-if="viewModel.blockedSlots.value.length" class="surface-card space-y-3 rounded-[28px] p-5">
          <p class="text-base font-semibold text-slate-900">Bloqueos del dia</p>

          <div
            v-for="slot in viewModel.blockedSlots.value"
            :key="slot.id"
            class="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-teal-100 bg-white/80 p-4"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-slate-900">
                {{ toAppTimeLabel(new Date(slot.startsAt)) }}
                –
                {{ toAppTimeLabel(new Date(slot.endsAt)) }}
              </p>
              <p v-if="slot.reason" class="text-sm text-slate-500">{{ slot.reason }}</p>
            </div>

            <button
              v-if="viewModel.canManageAvailability.value"
              class="rounded-2xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-70"
              type="button"
              :disabled="viewModel.deletingSlotId.value === slot.id"
              @click="viewModel.deleteBlockedSlot(slot.id)"
            >
              {{ viewModel.deletingSlotId.value === slot.id ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </article>
      </section>
    </section>
  </div>
</template>
