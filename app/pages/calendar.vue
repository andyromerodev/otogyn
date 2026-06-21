<script setup lang="ts">
import CalendarDayAppointmentCard from '../components/calendar/calendar-day-appointment-card.vue'
import CalendarMonthGrid from '../components/calendar/calendar-month-grid.vue'
import { useCalendarScreen } from '../composables/calendar/use-calendar-screen'

definePageMeta({
  middleware: 'auth',
})

const screen = await useCalendarScreen()
</script>

<template>
  <div class="calendar-page">
    <header class="calendar-header">
      <div>
        <h1 class="calendar-title">Agenda</h1>
        <p class="calendar-subtitle">{{ screen.monthEyebrow.value }}</p>
      </div>
    </header>

    <section class="calendar-shell">
      <div class="calendar-month-header">
        <button type="button" class="calendar-nav-button" @click="screen.goToPrevMonth">
          <UIcon name="i-heroicons-chevron-left-20-solid" />
        </button>

        <p class="calendar-month-title">{{ screen.currentMonthTitle.value }}</p>

        <button type="button" class="calendar-nav-button" @click="screen.goToNextMonth">
          <UIcon name="i-heroicons-chevron-right-20-solid" />
        </button>
      </div>

      <p
        v-if="screen.errorMessage.value"
        class="calendar-message calendar-message-error"
      >
        {{ screen.errorMessage.value }}
      </p>

      <div v-if="screen.loading.value && !screen.calendarMonth.value" class="calendar-loading">
        Cargando agenda...
      </div>

      <template v-else>
        <CalendarMonthGrid
          v-if="screen.calendarMonth.value"
          :days="screen.calendarMonth.value.days"
          :selected-date="screen.calendarMonth.value.selectedDate"
          :week-days="screen.shortWeekDays"
          @select="screen.selectDate"
        />

        <section class="calendar-day-section">
          <p class="calendar-day-heading">{{ screen.selectedDateHeading.value }}</p>

          <div v-if="screen.dayLoading.value" class="calendar-loading">
            Cargando agenda...
          </div>

          <div
            v-else-if="screen.calendarDay.value?.appointments.length"
            class="calendar-day-list"
          >
            <CalendarDayAppointmentCard
              v-for="appointment in screen.calendarDay.value.appointments"
              :key="appointment.id"
              :appointment="appointment"
              :formatted-time="screen.formatTime(appointment.startAt)"
            />
          </div>

          <div v-else class="calendar-empty-state">
            No hay citas registradas para este día.
          </div>
        </section>
      </template>
    </section>

    <NuxtLink to="/appointments" class="calendar-fab" aria-label="Registrar cita">
      <UIcon name="i-heroicons-plus-20-solid" />
    </NuxtLink>
  </div>
</template>

<style scoped>
.calendar-page {
  display: grid;
  gap: 1.25rem;
  max-width: 64rem;
}

.calendar-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.calendar-title {
  margin: 0;
  color: #122c2f;
  font-size: clamp(2.2rem, 4vw, 3.3rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.calendar-subtitle {
  margin: 0.45rem 0 0;
  color: #7d9ea2;
  font-size: 1.2rem;
}

.calendar-shell {
  display: grid;
  gap: 1.25rem;
}

.calendar-month-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
}

.calendar-nav-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.7rem;
  height: 3.7rem;
  border: 1px solid #cfe4e1;
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.96);
  color: #285e62;
  font-size: 1.5rem;
}

.calendar-month-title {
  margin: 0;
  text-align: center;
  color: #111827;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 800;
}

.calendar-message {
  margin: 0;
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  font-weight: 600;
}

.calendar-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.calendar-loading,
.calendar-empty-state {
  border-radius: 1.6rem;
  border: 1px solid #cfe4e1;
  background: rgba(255, 255, 255, 0.94);
  padding: 1.2rem;
  color: #7d9ea2;
}

.calendar-day-section {
  display: grid;
  gap: 0.9rem;
}

.calendar-day-heading {
  margin: 0;
  color: #7b9ea1;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.calendar-day-list {
  display: grid;
  gap: 0.85rem;
}

.calendar-fab {
  position: fixed;
  right: 1.25rem;
  bottom: calc(5.75rem + env(safe-area-inset-bottom));
  z-index: 35;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.45rem;
  height: 4.45rem;
  border-radius: 999px;
  background: #1b7676;
  color: white;
  font-size: 2rem;
  box-shadow: 0 12px 30px rgba(23, 95, 91, 0.18);
}

@media (min-width: 961px) {
  .calendar-fab {
    bottom: 1.5rem;
  }
}

@media (max-width: 960px) {
  .calendar-header {
    display: none;
  }
}

@media (max-width: 640px) {
  .calendar-subtitle {
    font-size: 1rem;
  }

  .calendar-nav-button {
    width: 3.45rem;
    height: 3.45rem;
  }
}
</style>
