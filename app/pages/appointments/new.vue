<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import CalendarMonthGrid from '../../components/calendar/calendar-month-grid.vue'
import { useAppointmentCreateViewModel } from '../../composables/appointments/use-appointment-create-view-model'

definePageMeta({
  middleware: 'auth',
})

const viewModel = await useAppointmentCreateViewModel()
const isDatePopoverOpen = ref(false)
const isTimePopoverOpen = ref(false)
const isTimePickerDisabled = computed(() => !viewModel.form.serviceId)
const isPatientPopoverOpen = ref(false)
const isServicePopoverOpen = ref(false)
const patientSearchInput = ref<HTMLInputElement | null>(null)
const serviceSearchInput = ref<HTMLInputElement | null>(null)

watch(isPatientPopoverOpen, async (isOpen) => {
  if (isOpen) {
    await viewModel.openPatientPicker()
    await nextTick()
    patientSearchInput.value?.focus()
    return
  }

  viewModel.closePatientPicker()
})

watch(isServicePopoverOpen, async (isOpen) => {
  if (isOpen) {
    await viewModel.openServicePicker()
    await nextTick()
    serviceSearchInput.value?.focus()
    return
  }

  viewModel.closeServicePicker()
})

const handleDateSelect = async (date: string) => {
  await viewModel.selectDate(date)
  isDatePopoverOpen.value = false
  isTimePopoverOpen.value = Boolean(viewModel.form.serviceId)
}

const handleSlotSelect = (startsAt: string) => {
  viewModel.selectSlot(startsAt)
  isTimePopoverOpen.value = false
}

const handleSubmit = async () => {
  await viewModel.submitAppointment()

  if (viewModel.createdAppointment.value) {
    await navigateTo('/appointments')
  }
}
</script>

<template>
  <div class="appointment-create-page">
    <div class="appointment-create-header">
      <NuxtLink to="/appointments" class="appointment-create-back">
        <UIcon name="i-heroicons-arrow-left-20-solid" />
        <span>Volver a citas</span>
      </NuxtLink>

      <div>
        <p class="appointment-create-eyebrow">Citas</p>
        <h1 class="appointment-create-title">Nueva cita</h1>
        <p class="appointment-create-copy">
          Si no hay disponibilidad configurada, se crea una base inicial de lunes a viernes, 09:00 a 18:00.
        </p>
      </div>
    </div>

    <article class="surface-card appointment-create-card">
      <div
        v-if="!viewModel.loading.value && (!viewModel.hasPatientsAvailable.value || !viewModel.hasServicesAvailable.value)"
        class="appointment-create-warning"
      >
        Necesitas al menos un paciente y un servicio para registrar citas.
      </div>

      <form v-else class="appointment-create-form" @submit.prevent="handleSubmit">
        <label class="appointment-field">
          <span>Paciente</span>
          <UPopover
            v-model:open="isPatientPopoverOpen"
            arrow
            modal
            :content="{ side: 'bottom', align: 'start', sideOffset: 10 }"
            :ui="{
              content: 'bg-white text-[#173638] ring-1 ring-[#d2e8e5] shadow-[0_24px_60px_rgba(15,23,42,0.14)] rounded-[1.5rem]',
              arrow: 'fill-white',
            }"
          >
            <UButton
              class="appointment-popover-trigger"
              color="neutral"
              variant="subtle"
              block
            >
              <span class="appointment-popover-trigger-value">
                {{ viewModel.selectedPatientLabel.value }}
              </span>
              <UIcon name="i-lucide-search" class="appointment-popover-trigger-icon" />
            </UButton>

            <template #content>
              <div class="appointment-popover-card appointment-popover-card-picker">
                <label class="appointment-picker-search-shell">
                  <UIcon name="i-heroicons-magnifying-glass-20-solid" class="appointment-picker-search-icon" />
                  <input
                    ref="patientSearchInput"
                    v-model="viewModel.patientSearch.value"
                    type="search"
                    class="appointment-picker-search-input"
                    placeholder="Buscar paciente por nombre"
                    autocomplete="off"
                  >
                </label>

                <div v-if="viewModel.patientsLoading.value" class="appointment-picker-state">
                  Buscando pacientes...
                </div>

                <div v-else-if="viewModel.patients.value.length" class="appointment-picker-results">
                  <button
                    v-for="patient in viewModel.patients.value"
                    :key="patient.id"
                    type="button"
                    class="appointment-picker-option"
                    :class="{ 'appointment-picker-option-active': viewModel.form.patientId === patient.id }"
                    @click="isPatientPopoverOpen = false; viewModel.selectPatient(patient)"
                  >
                    {{ patient.fullName }}
                  </button>
                </div>

                <p v-else class="appointment-picker-state">
                  No se encontraron pacientes con ese nombre.
                </p>
              </div>
            </template>
          </UPopover>
        </label>

        <label class="appointment-field">
          <span>Servicio</span>
          <UPopover
            v-model:open="isServicePopoverOpen"
            arrow
            modal
            :content="{ side: 'bottom', align: 'start', sideOffset: 10 }"
            :ui="{
              content: 'bg-white text-[#173638] ring-1 ring-[#d2e8e5] shadow-[0_24px_60px_rgba(15,23,42,0.14)] rounded-[1.5rem]',
              arrow: 'fill-white',
            }"
          >
            <UButton
              class="appointment-popover-trigger"
              color="neutral"
              variant="subtle"
              block
            >
              <span class="appointment-popover-trigger-value">
                {{ viewModel.selectedServiceLabel.value }}
              </span>
              <UIcon name="i-lucide-search" class="appointment-popover-trigger-icon" />
            </UButton>

            <template #content>
              <div class="appointment-popover-card appointment-popover-card-picker">
                <label class="appointment-picker-search-shell">
                  <UIcon name="i-heroicons-magnifying-glass-20-solid" class="appointment-picker-search-icon" />
                  <input
                    ref="serviceSearchInput"
                    v-model="viewModel.serviceSearch.value"
                    type="search"
                    class="appointment-picker-search-input"
                    placeholder="Buscar servicio por nombre"
                    autocomplete="off"
                  >
                </label>

                <div v-if="viewModel.servicesLoading.value" class="appointment-picker-state">
                  Buscando servicios...
                </div>

                <div v-else-if="viewModel.services.value.length" class="appointment-picker-results">
                  <button
                    v-for="service in viewModel.services.value"
                    :key="service.id"
                    type="button"
                    class="appointment-picker-option"
                    :class="{ 'appointment-picker-option-active': viewModel.form.serviceId === service.id }"
                    @click="isServicePopoverOpen = false; viewModel.selectService(service)"
                  >
                    {{ service.name }} · {{ service.defaultDurationMinutes }} min
                  </button>
                </div>

                <p v-else class="appointment-picker-state">
                  No se encontraron servicios con ese nombre.
                </p>
              </div>
            </template>
          </UPopover>
        </label>

        <label class="appointment-field">
          <span>Precio acordado (MXN)</span>
          <input
            v-model.number="viewModel.form.agreedPrice"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
          >
        </label>

        <section class="appointment-schedule-fields">
          <label class="appointment-field">
            <span>Fecha</span>

            <UPopover
              v-model:open="isDatePopoverOpen"
              arrow
              modal
              :content="{ side: 'bottom', align: 'start', sideOffset: 10 }"
              :ui="{
                content: 'bg-white text-[#173638] ring-1 ring-[#d2e8e5] shadow-[0_24px_60px_rgba(15,23,42,0.14)] rounded-[1.5rem]',
                arrow: 'fill-white',
              }"
            >
              <UButton
                class="appointment-popover-trigger"
                color="neutral"
                variant="subtle"
                block
              >
                <span class="appointment-popover-trigger-value">
                  {{ viewModel.selectedDateDisplay.value }}
                </span>
                <UIcon name="i-lucide-calendar" class="appointment-popover-trigger-icon" />
              </UButton>

              <template #content>
                <div class="appointment-popover-card appointment-popover-card-calendar">
                  <div class="appointment-popover-header">
                    <div>
                      <p class="appointment-popover-eyebrow">Fecha</p>
                      <h2 class="appointment-popover-title">{{ viewModel.currentMonthTitle.value }}</h2>
                    </div>

                    <div class="appointment-schedule-nav">
                      <button type="button" class="appointment-schedule-nav-btn" @click="viewModel.goToPrevMonth">
                        <UIcon name="i-heroicons-chevron-left-20-solid" />
                      </button>
                      <button type="button" class="appointment-schedule-nav-btn" @click="viewModel.goToNextMonth">
                        <UIcon name="i-heroicons-chevron-right-20-solid" />
                      </button>
                    </div>
                  </div>

                  <div v-if="viewModel.calendarLoading.value" class="appointment-picker-state">
                    Cargando calendario...
                  </div>

                  <CalendarMonthGrid
                    v-else-if="viewModel.calendarMonth.value"
                    :days="viewModel.calendarMonth.value.days"
                    :selected-date="viewModel.selectedDate.value"
                    :week-days="viewModel.shortWeekDays"
                    @select="handleDateSelect"
                  />
                </div>
              </template>
            </UPopover>
          </label>

          <label class="appointment-field">
            <span>Horario</span>

            <UPopover
              v-model:open="isTimePopoverOpen"
              arrow
              modal
              :content="{ side: 'bottom', align: 'start', sideOffset: 10 }"
              :ui="{
                content: 'bg-white text-[#173638] ring-1 ring-[#d2e8e5] shadow-[0_24px_60px_rgba(15,23,42,0.14)] rounded-[1.5rem]',
                arrow: 'fill-white',
              }"
            >
              <UButton
                class="appointment-popover-trigger"
                color="neutral"
                variant="subtle"
                :disabled="isTimePickerDisabled"
                block
              >
                <span class="appointment-popover-trigger-value">
                  {{ viewModel.selectedSlotLabel.value || 'Selecciona un horario' }}
                </span>
                <UIcon name="i-lucide-clock-3" class="appointment-popover-trigger-icon" />
              </UButton>

              <template #content>
                <div class="appointment-popover-card appointment-popover-card-slots">
                  <div class="appointment-popover-header appointment-popover-header-stack">
                    <div>
                      <p class="appointment-popover-eyebrow">Horario</p>
                      <h2 class="appointment-popover-title">{{ viewModel.selectedDateDisplay.value }}</h2>
                    </div>
                    <p class="appointment-picker-state appointment-popover-copy">
                      {{ viewModel.selectedSlotLabel.value || 'Elige una hora disponible para la cita.' }}
                    </p>
                  </div>

                  <div v-if="!viewModel.form.serviceId" class="appointment-picker-state">
                    Primero elige un servicio para ver horarios.
                  </div>

                  <div v-else-if="viewModel.slotsLoading.value" class="appointment-picker-state">
                    Cargando horarios disponibles...
                  </div>

                  <div v-else-if="viewModel.availableSlots.value.length" class="appointment-popover-slot-list">
                    <button
                      v-for="slot in viewModel.availableSlots.value"
                      :key="slot.startsAt"
                      type="button"
                      class="appointment-slot-option"
                      :class="{ 'appointment-slot-option-active': viewModel.selectedSlotStartsAt.value === slot.startsAt }"
                      @click="handleSlotSelect(slot.startsAt)"
                    >
                      {{ viewModel.formatTime(slot.startsAt) }}
                    </button>
                  </div>

                  <p v-else class="appointment-picker-state">
                    No hay horarios disponibles para la fecha seleccionada.
                  </p>
                </div>
              </template>
            </UPopover>
          </label>
        </section>

        <label class="appointment-flag">
          <input v-model="viewModel.form.isUrgent" type="checkbox">
          <div>
            <strong>Marcar como urgente</strong>
          </div>
        </label>

        <label class="appointment-field">
          <span>Motivo breve</span>
          <input v-model="viewModel.form.reason" type="text" placeholder="Control postoperatorio">
        </label>

        <label class="appointment-field">
          <span>Notas administrativas</span>
          <textarea
            v-model="viewModel.form.notes"
            rows="4"
            placeholder="Observaciones de agenda o coordinacion."
          />
        </label>

        <div class="appointment-actions">
          <NuxtLink to="/appointments" class="appointment-secondary-button">
            Cancelar
          </NuxtLink>

          <button class="appointment-primary-button" type="submit" :disabled="!viewModel.canSubmit.value">
            {{ viewModel.pending.value ? 'Guardando...' : 'Registrar cita' }}
          </button>
        </div>

        <p
          v-if="viewModel.errorMessage.value"
          class="appointment-message"
          :class="viewModel.errorKind.value === 'server' ? 'appointment-message-error' : 'appointment-message-warning'"
        >
          {{ viewModel.errorMessage.value }}
          <span v-if="viewModel.errorKind.value === 'server'" class="appointment-message-hint">Intenta de nuevo en unos segundos.</span>
        </p>
        <p v-if="viewModel.successMessage.value" class="appointment-message appointment-message-success">
          {{ viewModel.successMessage.value }}
        </p>
      </form>
    </article>
  </div>
</template>

<style scoped>
.appointment-create-page {
  display: grid;
  gap: 1.1rem;
  max-width: 56rem;
}

.appointment-create-header {
  display: grid;
  gap: 0.9rem;
}

.appointment-create-back {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.45rem;
  color: #266c69;
  font-weight: 700;
}

.appointment-create-eyebrow {
  margin: 0 0 0.25rem;
  color: #2e726d;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.appointment-create-title {
  margin: 0;
  color: #102e30;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.appointment-create-copy {
  margin: 0.45rem 0 0;
  color: #789ca0;
  font-size: 1rem;
}

.appointment-create-card {
  padding: 1.4rem;
  border-radius: 2rem;
}

.appointment-create-warning {
  border-radius: 1rem;
  background: #fff7ed;
  color: #b45309;
  padding: 0.95rem 1rem;
  font-weight: 600;
}

.appointment-create-form {
  display: grid;
  gap: 1rem;
}

.appointment-schedule-fields {
  display: grid;
  gap: 1rem;
}

.appointment-schedule-nav {
  display: flex;
  gap: 0.6rem;
}

.appointment-schedule-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border: 1px solid #cfe4e1;
  border-radius: 999px;
  background: white;
  color: #216566;
}

.appointment-field {
  display: grid;
  gap: 0.45rem;
}

.appointment-field span {
  color: #30565a;
  font-size: 0.95rem;
  font-weight: 700;
}

.appointment-field input,
.appointment-field select,
.appointment-field textarea {
  width: 100%;
  border: 1px solid #d2e8e5;
  border-radius: 1.2rem;
  padding: 0.95rem 1rem;
  background: rgba(248, 252, 251, 0.96);
  color: #122f31;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.appointment-field input:focus,
.appointment-field select:focus,
.appointment-field textarea:focus {
  border-color: #29918d;
  box-shadow: 0 0 0 4px rgba(41, 145, 141, 0.12);
}

.appointment-popover-card {
  display: grid;
  gap: 1rem;
  width: min(92vw, 24rem);
  padding: 1rem;
  background: #ffffff;
  color: #173638;
}

.appointment-popover-card-calendar {
  width: min(92vw, 25rem);
}

.appointment-popover-card-picker {
  width: min(92vw, 28rem);
}

.appointment-popover-card-slots {
  width: min(92vw, 20rem);
}

.appointment-popover-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.appointment-popover-header-stack {
  display: grid;
}

.appointment-popover-eyebrow {
  margin: 0 0 0.2rem;
  color: #2e726d;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.appointment-popover-title {
  margin: 0;
  color: #173638;
  font-size: 1.05rem;
  font-weight: 800;
}

.appointment-popover-copy {
  font-size: 0.9rem;
}

.appointment-popover-slot-list {
  display: grid;
  gap: 0.55rem;
  max-height: min(50vh, 20rem);
  overflow: auto;
  padding-right: 0.15rem;
}

:deep(.appointment-popover-trigger) {
  justify-content: space-between;
  min-height: 3.4rem;
  border: 1px solid #d2e8e5;
  border-radius: 1.2rem;
  padding: 0.95rem 1rem;
  background: rgba(248, 252, 251, 0.96);
  color: #173638;
  font-weight: 700;
}

.appointment-popover-trigger-value {
  display: block;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.appointment-popover-trigger-icon {
  flex-shrink: 0;
  color: #6e8e91;
  font-size: 1.15rem;
}

.appointment-picker-state {
  margin: 0;
  color: #5f8588;
  font-size: 0.95rem;
}

.appointment-picker-results {
  display: grid;
  gap: 0.65rem;
  max-height: min(45vh, 18rem);
  overflow: auto;
  padding-right: 0.1rem;
}

.appointment-picker-search-shell {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid #d2e8e5;
  border-radius: 1rem;
  padding: 0.85rem 0.95rem;
  background: rgba(248, 252, 251, 0.96);
}

.appointment-picker-search-icon {
  flex-shrink: 0;
  color: #7b9ea1;
}

.appointment-picker-search-input {
  width: 100%;
  border: 0;
  background: transparent;
  color: #173638;
  outline: none;
}

.appointment-picker-search-input::placeholder {
  color: #93aeb1;
}

.appointment-slot-option {
  border: 1px solid #cfe4e1;
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  background: white;
  color: #305d63;
  font-size: 0.95rem;
  font-weight: 800;
  text-align: left;
}

.appointment-slot-option-active {
  border-color: #2a7371;
  background: #dff0ee;
  color: #216566;
}

.appointment-picker-option {
  border: 1px solid #cfe4e1;
  border-radius: 1rem;
  padding: 0.85rem 1rem;
  background: white;
  color: #305d63;
  font-size: 0.94rem;
  font-weight: 700;
  text-align: left;
}

.appointment-picker-option-active {
  border-color: #2a7371;
  background: #dff0ee;
  color: #216566;
}

.appointment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding-top: 0.4rem;
}

.appointment-flag {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  border: 1px solid #d2e8e5;
  border-radius: 1.2rem;
  padding: 1rem;
  background: rgba(248, 252, 251, 0.96);
}

.appointment-flag input {
  margin-top: 0.2rem;
  width: 1rem;
  height: 1rem;
  accent-color: #176f6d;
}

.appointment-flag strong {
  display: block;
  color: #173638;
  font-size: 0.98rem;
}

.appointment-primary-button,
.appointment-secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.95rem 1.35rem;
  font-weight: 700;
}

.appointment-primary-button {
  border: 0;
  background: #176f6d;
  color: white;
}

.appointment-primary-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.appointment-secondary-button {
  border: 1px solid #d6ebe8;
  background: white;
  color: #2f5f63;
}

.appointment-message {
  margin: 0;
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  font-weight: 600;
}

.appointment-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.appointment-message-warning {
  background: #fffbeb;
  color: #92400e;
}

.appointment-message-success {
  background: #ecfdf5;
  color: #047857;
}

.appointment-message-hint {
  display: block;
  margin-top: 0.25rem;
  font-weight: 500;
  font-size: 0.85rem;
  opacity: 0.85;
}

@media (max-width: 720px) {
  .appointment-actions {
    flex-direction: column-reverse;
  }

  .appointment-primary-button,
  .appointment-secondary-button {
    width: 100%;
  }

  .appointment-popover-card {
    width: min(94vw, 24rem);
    padding: 0.9rem;
  }
}

@media (min-width: 760px) {
  .appointment-schedule-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
