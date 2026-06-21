<script setup lang="ts">
import type { CalendarMonthDayDto } from '~~/src/application/dto/calendar'

defineProps<{
  days: CalendarMonthDayDto[]
  selectedDate: string
  weekDays: string[]
}>()

const emit = defineEmits<{
  select: [date: string]
}>()
</script>

<template>
  <section class="calendar-grid-shell">
    <div class="calendar-weekdays">
      <span v-for="weekday in weekDays" :key="weekday" class="calendar-weekday">
        {{ weekday }}
      </span>
    </div>

    <div class="calendar-days-grid">
      <button
        v-for="day in days"
        :key="day.date"
        type="button"
        class="calendar-day-cell"
        :class="{
          'calendar-day-current': day.isCurrentMonth,
          'calendar-day-muted': !day.isCurrentMonth,
          'calendar-day-selected': selectedDate === day.date,
        }"
        @click="emit('select', day.date)"
      >
        <span class="calendar-day-number">{{ day.dayOfMonth }}</span>
        <span v-if="day.hasAppointments" class="calendar-day-dot" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.calendar-grid-shell {
  display: grid;
  gap: 0.85rem;
}

.calendar-weekdays,
.calendar-days-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.calendar-weekdays {
  gap: 0.4rem;
}

.calendar-weekday {
  display: inline-flex;
  justify-content: center;
  color: #7b9ea1;
  font-size: 0.98rem;
  font-weight: 700;
}

.calendar-days-grid {
  gap: 0.55rem;
}

.calendar-day-cell {
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 0.45rem;
  min-height: 5rem;
  padding: 0.9rem 0.25rem 0.4rem;
  border: 0;
  border-radius: 1.2rem;
  background: transparent;
  color: #173234;
}

.calendar-day-current {
  color: #173234;
}

.calendar-day-muted {
  color: #c1d7d9;
}

.calendar-day-selected {
  background: #2f7a78;
  color: white;
}

.calendar-day-number {
  font-size: 1.12rem;
  font-weight: 700;
}

.calendar-day-dot {
  width: 0.36rem;
  height: 0.36rem;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.9;
}

@media (min-width: 961px) {
  .calendar-day-cell {
    min-height: 5.3rem;
  }
}
</style>
