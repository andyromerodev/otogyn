<script setup lang="ts">
import { useAvailabilityScreen } from '../composables/availability/use-availability-screen'

definePageMeta({
  middleware: 'auth',
})

const screen = await useAvailabilityScreen()
</script>

<template>
  <div class="space-y-6">
    <SharedSectionHeader
      eyebrow="Disponibilidad"
      title="Horarios y bloqueos"
      description="Gestiona los horarios de atencion semanal y bloqueos horarios para la organizacion."
    />

    <p v-if="screen.errorMessage.value" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
      {{ screen.errorMessage.value }}
    </p>
    <p v-if="screen.successMessage.value" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
      {{ screen.successMessage.value }}
    </p>

    <section class="grid gap-4 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
      <article
        v-if="screen.canManageAvailability.value"
        class="surface-card space-y-4 rounded-[28px] p-5"
      >
        <div class="space-y-1">
          <p class="text-lg font-semibold text-slate-900">
            {{ screen.editingId.value ? 'Editar horario' : 'Nuevo horario' }}
          </p>
          <p class="text-sm text-slate-500">Configura dia, hora inicio, hora fin y estado activo.</p>
        </div>

        <form class="space-y-4" @submit.prevent="screen.submitAvailability">
          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Dia de la semana</span>
            <select
              v-model.number="screen.form.weekday"
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              <option
                v-for="(label, index) in screen.weekdaysList"
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
                v-model="screen.form.startTime"
                type="time"
                required
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>

            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Hora fin</span>
              <input
                v-model="screen.form.endTime"
                type="time"
                required
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>
          </div>

          <label class="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm font-medium text-slate-700">
            <input v-model="screen.form.isActive" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500">
            Horario activo
          </label>

          <div class="flex flex-wrap gap-3">
            <button
              class="rounded-2xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
              type="submit"
              :disabled="screen.pending.value"
            >
              {{ screen.pending.value ? 'Guardando...' : (screen.editingId.value ? 'Guardar cambios' : 'Registrar horario') }}
            </button>

            <button
              v-if="screen.editingId.value"
              class="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              type="button"
              @click="screen.cancelEditingAvailability"
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

        <form class="space-y-4" @submit.prevent="screen.submitBlockedSlot">
          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Fecha</span>
            <input
              v-model="screen.blockForm.date"
              type="date"
              required
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Hora inicio</span>
              <input
                v-model="screen.blockForm.startTime"
                type="time"
                required
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>

            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Hora fin</span>
              <input
                v-model="screen.blockForm.endTime"
                type="time"
                required
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>
          </div>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Motivo (opcional)</span>
            <input
              v-model="screen.blockForm.reason"
              type="text"
              placeholder="Almuerzo, reunion, feriado..."
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <button
            class="w-full rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
            type="submit"
            :disabled="screen.pending.value"
          >
            {{ screen.pending.value ? 'Registrando...' : 'Registrar bloqueo' }}
          </button>
        </form>
      </article>

      <section class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <article
            v-for="avail in screen.availabilities.value"
            :key="avail.id"
            class="surface-card space-y-3 rounded-[28px] p-5"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-base font-semibold text-slate-900">{{ screen.weekdaysList[avail.weekday] }}</p>
                <p class="text-sm text-slate-500">{{ avail.startTime }} – {{ avail.endTime }}</p>
              </div>
              <span class="pill text-xs" :class="avail.isActive ? '' : 'bg-amber-100 text-amber-700'">
                {{ avail.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </div>

            <div v-if="screen.canManageAvailability.value" class="flex flex-wrap gap-2">
              <button
                class="rounded-2xl border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
                type="button"
                @click="screen.startEditingAvailability(avail)"
              >
                Editar
              </button>
              <button
                class="rounded-2xl px-3 py-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-70"
                :class="avail.isActive
                  ? 'border border-amber-200 text-amber-700 hover:bg-amber-50'
                  : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'"
                type="button"
                :disabled="screen.togglingId.value === avail.id"
                @click="screen.toggleAvailabilityActive(avail.id)"
              >
                {{ screen.togglingId.value === avail.id ? 'Cambiando...' : (avail.isActive ? 'Desactivar' : 'Activar') }}
              </button>
            </div>
          </article>

          <article
            v-if="!screen.availabilities.value.length"
            class="surface-card rounded-[28px] p-5 text-sm text-slate-500 lg:col-span-3 xl:col-span-4"
          >
            Aun no hay horarios configurados para esta organizacion.
          </article>
        </div>

        <article v-if="screen.blockedSlots.value.length" class="surface-card space-y-3 rounded-[28px] p-5">
          <p class="text-base font-semibold text-slate-900">Bloqueos del dia</p>

          <div
            v-for="slot in screen.blockedSlots.value"
            :key="slot.id"
            class="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-teal-100 bg-white/80 p-4"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-slate-900">
                {{ new Date(slot.startsAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) }}
                –
                {{ new Date(slot.endsAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) }}
              </p>
              <p v-if="slot.reason" class="text-sm text-slate-500">{{ slot.reason }}</p>
            </div>

            <button
              v-if="screen.canManageAvailability.value"
              class="rounded-2xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-70"
              type="button"
              :disabled="screen.deletingSlotId.value === slot.id"
              @click="screen.deleteBlockedSlot(slot.id)"
            >
              {{ screen.deletingSlotId.value === slot.id ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </article>
      </section>
    </section>
  </div>
</template>
