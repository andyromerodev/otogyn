<script setup lang="ts">
import { useCalendarScreen } from '../composables/calendar/use-calendar-screen'

definePageMeta({
  middleware: 'auth',
})

const screen = await useCalendarScreen()

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-teal-100 text-teal-800 border-teal-200',
  checked_in: 'bg-purple-100 text-purple-800 border-purple-200',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-rose-100 text-rose-600 border-rose-200',
  no_show: 'bg-orange-100 text-orange-700 border-orange-200',
}
</script>

<template>
  <div class="space-y-4">
    <SharedSectionHeader
      eyebrow="Agenda"
      title="Calendario"
      description="Vista diaria y semanal de citas, disponibilidad y bloqueos."
    />

    <!-- toolbar -->
    <div class="surface-card flex flex-wrap items-center justify-between gap-3 rounded-[28px] px-5 py-3">
      <div class="flex items-center gap-2">
        <button
          class="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          @click="screen.goToPrev()"
        >
          ←
        </button>
        <button
          class="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          :class="{ 'opacity-40 cursor-default': screen.isToday.value }"
          @click="screen.goToToday()"
        >
          Hoy
        </button>
        <button
          class="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          @click="screen.goToNext()"
        >
          →
        </button>
        <span class="ml-2 text-base font-semibold text-slate-800">
          {{ screen.currentDateLabel.value }}
        </span>
      </div>

      <div class="flex gap-1 rounded-2xl border border-slate-200 p-1">
        <button
          class="rounded-xl px-4 py-1.5 text-sm font-medium transition"
          :class="screen.viewMode.value === 'day'
            ? 'bg-teal-700 text-white'
            : 'text-slate-600 hover:bg-slate-50'"
          @click="screen.setViewMode('day')"
        >
          Día
        </button>
        <button
          class="rounded-xl px-4 py-1.5 text-sm font-medium transition"
          :class="screen.viewMode.value === 'week'
            ? 'bg-teal-700 text-white'
            : 'text-slate-600 hover:bg-slate-50'"
          @click="screen.setViewMode('week')"
        >
          Semana
        </button>
      </div>
    </div>

    <!-- error -->
    <p
      v-if="screen.errorMessage.value"
      class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
    >
      {{ screen.errorMessage.value }}
    </p>

    <!-- loading -->
    <div
      v-if="screen.loading.value"
      class="surface-card flex items-center justify-center rounded-[28px] py-20 text-sm text-slate-400"
    >
      Cargando agenda...
    </div>

    <!-- DAY VIEW -->
    <template v-else-if="screen.viewMode.value === 'day' && screen.calendarDay.value">
      <div class="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <!-- appointments + blocked -->
        <section class="space-y-3">
          <div class="surface-card rounded-[28px] p-5">
            <p class="mb-4 text-base font-semibold text-slate-900">
              Citas del día
              <span class="ml-2 text-sm font-normal text-slate-400">
                ({{ screen.calendarDay.value.appointments.length }})
              </span>
            </p>

            <div
              v-if="!screen.calendarDay.value.appointments.length"
              class="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400"
            >
              Sin citas para este día.
            </div>

            <div class="space-y-2">
              <div
                v-for="appt in screen.calendarDay.value.appointments"
                :key="appt.id"
                class="flex flex-wrap items-start gap-3 rounded-2xl border px-4 py-3"
                :class="statusColors[appt.status] ?? 'bg-slate-50 border-slate-200 text-slate-800'"
              >
                <div class="min-w-0 flex-1 space-y-0.5">
                  <p class="text-sm font-semibold">{{ appt.patientName }}</p>
                  <p class="text-xs opacity-75">{{ appt.serviceName }}</p>
                </div>
                <div class="text-right text-xs">
                  <p class="font-semibold">
                    {{ screen.formatTime(appt.startAt) }} – {{ screen.formatTime(appt.endAt) }}
                  </p>
                  <p class="mt-0.5 opacity-75">{{ appt.durationMinutes }} min</p>
                </div>
                <span
                  v-if="appt.isUrgent"
                  class="self-center rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white"
                >
                  URGENTE
                </span>
                <span class="self-center text-xs font-medium opacity-75">{{ appt.statusLabel }}</span>
              </div>
            </div>
          </div>

          <!-- blocked slots -->
          <div
            v-if="screen.calendarDay.value.blockedSlots.length"
            class="surface-card rounded-[28px] p-5"
          >
            <p class="mb-3 text-base font-semibold text-slate-900">Bloqueos</p>
            <div class="space-y-2">
              <div
                v-for="slot in screen.calendarDay.value.blockedSlots"
                :key="slot.id"
                class="flex items-start justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
              >
                <p class="text-sm font-medium text-orange-800">
                  {{ screen.formatTime(slot.startsAt) }} – {{ screen.formatTime(slot.endsAt) }}
                </p>
                <p v-if="slot.reason" class="text-sm text-orange-600">{{ slot.reason }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- sidebar: availability + free slots -->
        <aside class="space-y-3">
          <div class="surface-card rounded-[28px] p-5">
            <p class="mb-3 text-sm font-semibold text-slate-700">Disponibilidad</p>
            <div
              v-if="!screen.calendarDay.value.isWorkday"
              class="text-sm text-slate-400"
            >
              Día no laborable.
            </div>
            <div v-else class="space-y-1">
              <div
                v-for="(window, i) in screen.calendarDay.value.availabilityWindows"
                :key="i"
                class="rounded-xl bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700"
              >
                {{ window.startTime }} – {{ window.endTime }}
              </div>
            </div>
          </div>

          <div
            v-if="screen.calendarDay.value.freeSlots.length"
            class="surface-card rounded-[28px] p-5"
          >
            <p class="mb-3 text-sm font-semibold text-slate-700">
              Huecos libres
              <span class="ml-1 font-normal text-slate-400">({{ screen.calendarDay.value.freeSlots.length }})</span>
            </p>
            <div class="space-y-1">
              <div
                v-for="(slot, i) in screen.calendarDay.value.freeSlots"
                :key="i"
                class="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2"
              >
                <span class="text-xs font-medium text-emerald-700">
                  {{ screen.formatTime(slot.startsAt) }} – {{ screen.formatTime(slot.endsAt) }}
                </span>
                <span class="text-xs text-emerald-500">{{ slot.durationMinutes }} min</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </template>

    <!-- WEEK VIEW -->
    <template v-else-if="screen.viewMode.value === 'week' && screen.calendarWeek.value">
      <div class="surface-card overflow-x-auto rounded-[28px] p-2">
        <div class="grid min-w-[700px] grid-cols-7 gap-1.5">
          <div
            v-for="day in screen.calendarWeek.value.days"
            :key="day.date"
            class="space-y-1.5 rounded-2xl p-2"
            :class="!day.isWorkday ? 'bg-slate-50/60' : 'bg-white/60'"
          >
            <!-- day header -->
            <div class="rounded-xl px-2 py-1.5 text-center text-slate-700">
              <p class="text-xs font-semibold">{{ screen.formatDateLabel(day.date) }}</p>
              <p v-if="!day.isWorkday" class="text-xs opacity-60">No laborable</p>
              <p v-else class="text-xs opacity-60">{{ day.appointments.length }} citas</p>
            </div>

            <!-- availability banner -->
            <div
              v-if="day.isWorkday && day.availabilityWindows.length"
              class="rounded-xl bg-teal-50 px-2 py-1 text-center text-xs text-teal-600"
            >
              {{ day.availabilityWindows[0]!.startTime }}–{{ day.availabilityWindows[0]!.endTime }}
            </div>

            <!-- blocked -->
            <div
              v-for="block in day.blockedSlots"
              :key="block.id"
              class="rounded-xl border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700"
            >
              🔒 {{ screen.formatTime(block.startsAt) }}–{{ screen.formatTime(block.endsAt) }}
            </div>

            <!-- appointments -->
            <div
              v-for="appt in day.appointments"
              :key="appt.id"
              class="rounded-xl border px-2 py-1.5 text-xs"
              :class="statusColors[appt.status] ?? 'bg-slate-100 border-slate-200'"
            >
              <p class="font-semibold leading-tight">{{ screen.formatTime(appt.startAt) }}</p>
              <p class="truncate leading-tight opacity-80">{{ appt.patientName }}</p>
              <p class="truncate leading-tight opacity-60">{{ appt.serviceName }}</p>
            </div>

            <!-- free slots count -->
            <div
              v-if="day.isWorkday && day.freeSlots.length"
              class="rounded-xl bg-emerald-50 px-2 py-1 text-center text-xs text-emerald-600"
            >
              {{ day.freeSlots.length }} hueco{{ day.freeSlots.length !== 1 ? 's' : '' }} libre{{ day.freeSlots.length !== 1 ? 's' : '' }}
            </div>

            <!-- no appointments -->
            <div
              v-if="day.isWorkday && !day.appointments.length && !day.blockedSlots.length"
              class="rounded-xl border border-dashed border-slate-200 py-2 text-center text-xs text-slate-400"
            >
              Sin citas
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
