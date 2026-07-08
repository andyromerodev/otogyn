<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed, nextTick, ref, watch } from 'vue'
import CalendarMonthGrid from '../../components/calendar/calendar-month-grid.vue'
import type { AppointmentSlotDto } from '~~/src/application/dto/appointment-management'
import { parseAppDateTime, toAppTimeLabel } from '~~/src/application/utils/date/local-date'
import {
  formatCurrency,
  formatDate,
  methodLabels,
} from '~~/src/presentation/view-models/finances/payments-list-view-model'
import { useAppointmentDetailViewModel } from '../../composables/appointments/use-appointment-detail-view-model'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const appointmentId = String(route.params.id)
const viewModel = await useAppointmentDetailViewModel(appointmentId)
const isPatientPopoverOpen = ref(false)
const isServicePopoverOpen = ref(false)
const isDatePopoverOpen = ref(false)
const isTimePopoverOpen = ref(false)
const patientSearchInput = ref<HTMLInputElement | null>(null)
const serviceSearchInput = ref<HTMLInputElement | null>(null)

watch(isPatientPopoverOpen, async (isOpen) => {
  if (!viewModel.isEditing.value) return

  if (isOpen) {
    await viewModel.openPatientPicker()
    await nextTick()
    patientSearchInput.value?.focus()
    return
  }

  viewModel.closePatientPicker()
})

watch(isServicePopoverOpen, async (isOpen) => {
  if (!viewModel.isEditing.value) return

  if (isOpen) {
    await viewModel.openServicePicker()
    await nextTick()
    serviceSearchInput.value?.focus()
    return
  }

  viewModel.closeServicePicker()
})

const formatSlotTime = (iso: string) =>
  toAppTimeLabel(new Date(iso))

const isSlotSelected = (startsAt: string) => {
  const current = parseAppDateTime(viewModel.form.startAt)
  const slot = new Date(startsAt)
  return current.getTime() === slot.getTime()
}

const handleDateSelect = async (date: string) => {
  await viewModel.selectDate(date)
  isDatePopoverOpen.value = false
  isTimePopoverOpen.value = Boolean(viewModel.form.serviceId)
}

const handleSlotSelect = (slot: AppointmentSlotDto) => {
  viewModel.selectSlot(slot)
  isTimePopoverOpen.value = false
}

const consultationAction = computed(() => {
  const appointment = viewModel.appointment.value
  if (!appointment) return null

  if (appointment.status === 'checked_in' || appointment.status === 'in_progress') {
    return { label: 'Atender', variant: 'primary' as const }
  }

  if (appointment.status === 'completed') {
    return { label: 'Ver atención', variant: 'secondary' as const }
  }

  return null
})

const currentStatusLabel = computed(() =>
  viewModel.appointmentStatusesForUi.find((item) => item.value === viewModel.appointment.value?.status)?.label ?? 'Estado',
)

const statusMenuItems = computed<DropdownMenuItem[][]>(() => [
  viewModel.appointmentStatusesForUi.map((statusOption) => ({
    label: statusOption.label,
    icon: viewModel.appointment.value?.status === statusOption.value ? 'i-lucide-check' : undefined,
    disabled:
      viewModel.appointment.value?.status === statusOption.value ||
      viewModel.changingStatusPending.value,
    onSelect: () => {
      void viewModel.submitStatusSelection(statusOption.value)
    },
  })),
])
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Cita"
      :title="viewModel.appointment.value?.patientName ?? 'Detalle de cita'"
      description="Edicion, cambio de estado y cancelacion de la cita."
    />

    <p v-if="!viewModel.loading.value && viewModel.errorMessage.value && !viewModel.appointment.value" class="page-error">
      {{ viewModel.errorMessage.value }}
    </p>

    <article v-if="viewModel.appointment.value" class="surface-card detail-card">
      <form class="detail-form" @submit.prevent="viewModel.submitAppointment">
        <label class="field">
          <span>Paciente</span>
          <UPopover
            v-if="viewModel.isEditing.value"
            v-model:open="isPatientPopoverOpen"
            arrow
            modal
            :content="{ side: 'bottom', align: 'start', sideOffset: 10 }"
            :ui="{
              content: 'bg-white text-[#173638] ring-1 ring-[#d2e8e5] shadow-[0_24px_60px_rgba(15,23,42,0.14)] rounded-[1.5rem]',
              arrow: 'fill-white',
            }"
          >
            <UButton class="detail-popover-trigger" color="neutral" variant="subtle" block>
              <span class="detail-popover-trigger-value">{{ viewModel.selectedPatientLabel.value }}</span>
              <UIcon name="i-lucide-search" class="detail-popover-trigger-icon" />
            </UButton>

            <template #content>
              <div class="detail-popover-card detail-popover-card-picker">
                <label class="detail-picker-search-shell">
                  <UIcon name="i-heroicons-magnifying-glass-20-solid" class="detail-picker-search-icon" />
                  <input
                    ref="patientSearchInput"
                    v-model="viewModel.patientSearch.value"
                    type="search"
                    class="detail-picker-search-input"
                    placeholder="Buscar paciente por nombre"
                    autocomplete="off"
                  >
                </label>

                <div v-if="viewModel.patientsLoading.value" class="detail-picker-state">
                  Buscando pacientes...
                </div>

                <div v-else-if="viewModel.patients.value.length" class="detail-picker-results">
                  <button
                    v-for="patient in viewModel.patients.value"
                    :key="patient.id"
                    type="button"
                    class="detail-picker-option"
                    :class="{ 'detail-picker-option-active': viewModel.form.patientId === patient.id }"
                    @click="isPatientPopoverOpen = false; viewModel.selectPatient(patient)"
                  >
                    {{ patient.fullName }}
                  </button>
                </div>

                <p v-else class="detail-picker-state">
                  No se encontraron pacientes con ese nombre.
                </p>
              </div>
            </template>
          </UPopover>

          <input v-else :value="viewModel.appointment.value.patientName" type="text" disabled>
        </label>

        <label class="field">
          <span>Servicio</span>
          <UPopover
            v-if="viewModel.isEditing.value"
            v-model:open="isServicePopoverOpen"
            arrow
            modal
            :content="{ side: 'bottom', align: 'start', sideOffset: 10 }"
            :ui="{
              content: 'bg-white text-[#173638] ring-1 ring-[#d2e8e5] shadow-[0_24px_60px_rgba(15,23,42,0.14)] rounded-[1.5rem]',
              arrow: 'fill-white',
            }"
          >
            <UButton class="detail-popover-trigger" color="neutral" variant="subtle" block>
              <span class="detail-popover-trigger-value">{{ viewModel.selectedServiceLabel.value }}</span>
              <UIcon name="i-lucide-search" class="detail-popover-trigger-icon" />
            </UButton>

            <template #content>
              <div class="detail-popover-card detail-popover-card-picker">
                <label class="detail-picker-search-shell">
                  <UIcon name="i-heroicons-magnifying-glass-20-solid" class="detail-picker-search-icon" />
                  <input
                    ref="serviceSearchInput"
                    v-model="viewModel.serviceSearch.value"
                    type="search"
                    class="detail-picker-search-input"
                    placeholder="Buscar servicio por nombre"
                    autocomplete="off"
                  >
                </label>

                <div v-if="viewModel.servicesLoading.value" class="detail-picker-state">
                  Buscando servicios...
                </div>

                <div v-else-if="viewModel.services.value.length" class="detail-picker-results">
                  <button
                    v-for="service in viewModel.services.value"
                    :key="service.id"
                    type="button"
                    class="detail-picker-option"
                    :class="{ 'detail-picker-option-active': viewModel.form.serviceId === service.id }"
                    @click="isServicePopoverOpen = false; viewModel.selectService(service)"
                  >
                    {{ service.name }} · {{ service.defaultDurationMinutes }} min
                  </button>
                </div>

                <p v-else class="detail-picker-state">
                  No se encontraron servicios con ese nombre.
                </p>
              </div>
            </template>
          </UPopover>

          <input v-else :value="viewModel.selectedServiceLabel.value" type="text" disabled>
        </label>

        <label class="field">
          <span>Precio acordado (MXN)</span>
          <input
            v-model.number="viewModel.form.agreedPrice"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            :disabled="!viewModel.isEditing.value"
          >
        </label>

        <div class="field">
          <span>Fecha</span>
          <UPopover
            v-if="viewModel.isEditing.value"
            v-model:open="isDatePopoverOpen"
            arrow
            modal
            :content="{ side: 'bottom', align: 'start', sideOffset: 10 }"
            :ui="{
              content: 'bg-white text-[#173638] ring-1 ring-[#d2e8e5] shadow-[0_24px_60px_rgba(15,23,42,0.14)] rounded-[1.5rem]',
              arrow: 'fill-white',
            }"
          >
            <UButton class="detail-popover-trigger" color="neutral" variant="subtle" block>
              <span class="detail-popover-trigger-value">{{ viewModel.selectedDateDisplay.value }}</span>
              <UIcon name="i-lucide-calendar" class="detail-popover-trigger-icon" />
            </UButton>

            <template #content>
              <div class="detail-popover-card detail-popover-card-calendar">
                <div class="detail-popover-header">
                  <div>
                    <p class="detail-popover-eyebrow">Fecha</p>
                    <h2 class="detail-popover-title">{{ viewModel.currentMonthTitle.value }}</h2>
                  </div>
                  <div class="detail-schedule-nav">
                    <button type="button" class="detail-schedule-nav-btn" @click="viewModel.goToPrevMonth">
                      <UIcon name="i-heroicons-chevron-left-20-solid" />
                    </button>
                    <button type="button" class="detail-schedule-nav-btn" @click="viewModel.goToNextMonth">
                      <UIcon name="i-heroicons-chevron-right-20-solid" />
                    </button>
                  </div>
                </div>

                <div v-if="viewModel.calendarLoading.value" class="detail-picker-state">
                  Cargando calendario...
                </div>

                <CalendarMonthGrid
                  v-else-if="viewModel.calendarMonth.value"
                  :days="viewModel.calendarMonth.value.days"
                  :selected-date="viewModel.slotsDate.value"
                  :week-days="viewModel.shortWeekDays"
                  @select="handleDateSelect"
                />
              </div>
            </template>
          </UPopover>

          <input v-else :value="viewModel.selectedDateDisplay.value" type="text" disabled>
        </div>

        <div class="field">
          <span>Horario</span>
          <UPopover
            v-if="viewModel.isEditing.value"
            v-model:open="isTimePopoverOpen"
            arrow
            modal
            :content="{ side: 'bottom', align: 'start', sideOffset: 10 }"
            :ui="{
              content: 'bg-white text-[#173638] ring-1 ring-[#d2e8e5] shadow-[0_24px_60px_rgba(15,23,42,0.14)] rounded-[1.5rem]',
              arrow: 'fill-white',
            }"
          >
            <UButton class="detail-popover-trigger" color="neutral" variant="subtle" block>
              <span class="detail-popover-trigger-value">
                {{ viewModel.selectedSlotLabel.value || 'Selecciona un horario' }}
              </span>
              <UIcon name="i-lucide-clock-3" class="detail-popover-trigger-icon" />
            </UButton>

            <template #content>
              <div class="detail-popover-card detail-popover-card-slots">
                <div class="detail-popover-header detail-popover-header-stack">
                  <div>
                    <p class="detail-popover-eyebrow">Horario</p>
                    <h2 class="detail-popover-title">{{ viewModel.selectedDateDisplay.value }}</h2>
                  </div>
                  <p class="detail-picker-state detail-popover-copy">
                    {{ viewModel.selectedSlotLabel.value || 'Elige una hora disponible para reprogramar la cita.' }}
                  </p>
                </div>

                <div v-if="viewModel.loadingSlots.value" class="detail-picker-state">
                  Buscando horarios...
                </div>
                <p v-else-if="!viewModel.availableSlots.value.length" class="detail-picker-state">
                  No hay horarios libres ese día para el servicio seleccionado.
                </p>
                <div v-else class="detail-popover-slot-list">
                  <button
                    v-for="slot in viewModel.availableSlots.value"
                    :key="slot.startsAt"
                    type="button"
                    class="detail-slot-option"
                    :class="{ 'detail-slot-option-active': isSlotSelected(slot.startsAt) }"
                    @click="handleSlotSelect(slot)"
                  >
                    {{ formatSlotTime(slot.startsAt) }}
                  </button>
                </div>
              </div>
            </template>
          </UPopover>

          <input v-else :value="viewModel.selectedSlotLabel.value" type="text" disabled>
        </div>

        <div class="field field-wide active-field">
          <span>Urgente</span>
          <label class="active-toggle">
            <input v-model="viewModel.form.isUrgent" type="checkbox" :disabled="!viewModel.isEditing.value">
            <div>
              <strong>Marcar como urgente</strong>
            </div>
          </label>
        </div>

        <label class="field field-wide">
          <span>Motivo breve</span>
          <input v-model="viewModel.form.reason" type="text" :disabled="!viewModel.isEditing.value">
        </label>

        <label class="field field-wide">
          <span>Notas administrativas</span>
          <textarea v-model="viewModel.form.notes" rows="4" :disabled="!viewModel.isEditing.value" />
        </label>

        <label class="field field-wide">
          <span>Estado</span>
          <UDropdownMenu
            :items="statusMenuItems"
            :disabled="!viewModel.canChangeAppointmentStatus.value || viewModel.changingStatusPending.value"
            :ui="{
              content: 'bg-white text-[#173638] ring-1 ring-[#d2e8e5] shadow-[0_24px_60px_rgba(15,23,42,0.14)] rounded-[1.25rem] min-w-64',
              arrow: 'fill-white',
              item: 'text-[#173638] data-[highlighted]:bg-[#eff8f6] data-[highlighted]:text-[#173638] rounded-xl',
              itemLeadingIcon: 'text-[#266c69]',
              label: 'text-[#6b8a8d] uppercase tracking-[0.08em] text-[0.72rem] font-extrabold px-2 pt-1',
            }"
            arrow
          >
            <UButton class="detail-popover-trigger" color="neutral" variant="subtle" block>
              <span class="detail-popover-trigger-value">{{ currentStatusLabel }}</span>
              <UIcon name="i-lucide-chevron-down" class="detail-popover-trigger-icon" />
            </UButton>
          </UDropdownMenu>
          <span v-if="viewModel.changingStatusPending.value" class="field-inline-hint">Actualizando estado...</span>
        </label>

        <section class="field field-wide payment-field">
          <div class="payment-field-header">
            <span>Pago</span>
            <span
              class="payment-pill"
              :class="viewModel.appointment.value.linkedPayment ? 'payment-pill-paid' : 'payment-pill-pending'"
            >
              {{ viewModel.appointment.value.linkedPayment ? 'Pagada' : 'Pendiente' }}
            </span>
          </div>

          <div class="payment-card">
            <template v-if="viewModel.appointment.value.linkedPayment">
              <p class="payment-card-title">Pago registrado</p>
              <p class="payment-card-copy">
                {{ formatCurrency(viewModel.appointment.value.linkedPayment.amount) }} ·
                {{ methodLabels[viewModel.appointment.value.linkedPayment.method] }} ·
                {{ formatDate(viewModel.appointment.value.linkedPayment.paidAt) }}
              </p>
            </template>

            <template v-else-if="viewModel.canRegisterPayment.value && viewModel.registerPaymentHref.value">
              <div class="payment-card-copy-block">
                <p class="payment-card-title">Registrar pago de la cita</p>
                <p v-if="viewModel.appointment.value.agreedPrice !== null" class="payment-card-copy">
                  Se precargará el pago con
                  {{ formatCurrency(viewModel.appointment.value.agreedPrice) }}
                  para {{ viewModel.appointment.value.serviceName }}.
                </p>
                <p v-else class="payment-card-copy">
                  Esta cita no tiene precio configurado. Podrás capturar el monto manualmente en el formulario.
                </p>
              </div>

              <NuxtLink :to="viewModel.registerPaymentHref.value" class="payment-register-button">
                Registrar pago
              </NuxtLink>
            </template>

            <template v-else>
              <p class="payment-card-title">Sin pago registrado</p>
              <p class="payment-card-copy">
                <span v-if="viewModel.appointment.value.status === 'cancelled'">
                  La cita está cancelada y no admite registro de pago.
                </span>
                <span v-else-if="viewModel.sessionContext.value?.role !== 'admin_doctor'">
                  Solo la doctora administradora puede registrar pagos desde una cita.
                </span>
                <span v-else>
                  Esta cita todavía no tiene un pago asociado.
                </span>
              </p>
            </template>
          </div>
        </section>

        <div class="detail-actions">
          <span class="pill">Cita real en PostgreSQL</span>
          <div class="detail-actions-buttons">
            <NuxtLink
              v-if="consultationAction"
              :to="`/consultations/${viewModel.appointment.value.id}`"
              class="consultation-button"
              :class="`consultation-button-${consultationAction.variant}`"
            >
              {{ consultationAction.label }}
            </NuxtLink>
            <template v-if="!viewModel.isEditing.value">
              <button
                type="button"
                class="delete-button"
                :disabled="!viewModel.canCancelAppointment.value || viewModel.cancelingPending.value"
                @click="viewModel.submitCancellation"
              >
                {{ viewModel.cancelingPending.value ? 'Cancelando...' : 'Cancelar cita' }}
              </button>
              <button
                type="button"
                class="edit-button"
                :disabled="!viewModel.canEditAppointment.value"
                @click="viewModel.startEditing"
              >
                Editar
              </button>
            </template>
            <template v-else>
              <button type="button" class="cancel-button" @click="viewModel.cancelEditing">
                Cancelar
              </button>
              <button class="submit-button" type="submit" :disabled="!viewModel.canSubmitAppointmentChanges.value">
                {{ viewModel.pending.value ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </template>
          </div>
        </div>

        <p
          v-if="viewModel.errorMessage.value"
          class="message"
          :class="viewModel.errorKind.value === 'server' ? 'message-error' : 'message-warning'"
        >
          {{ viewModel.errorMessage.value }}
          <span v-if="viewModel.errorKind.value === 'server'" class="message-hint">Intenta de nuevo en unos segundos.</span>
        </p>
        <p v-if="viewModel.successMessage.value" class="message message-success">{{ viewModel.successMessage.value }}</p>
      </form>
    </article>
  </div>
</template>

<style scoped>
.page-error {
  margin: 0;
  border-radius: 1.1rem;
  background: #fff1f2;
  color: #b91c1c;
  padding: 0.95rem 1rem;
  font-weight: 600;
}

.detail-card {
  padding: 1.5rem;
}

.detail-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
}

.field-wide {
  grid-column: 1 / -1;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.8rem 0.95rem;
  background: rgba(255, 255, 255, 0.88);
  color: var(--text-main);
}

.active-field {
  gap: 0.6rem;
}

.active-toggle {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.88);
}

.active-toggle input {
  margin-top: 0.15rem;
  width: 1rem;
  height: 1rem;
  accent-color: #0f766e;
}

.active-toggle strong {
  display: block;
  color: var(--text-main);
}

.detail-actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.detail-actions-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.field input:disabled,
.field select:disabled,
.field textarea:disabled {
  background: rgba(15, 118, 110, 0.05);
  color: var(--text-main);
  opacity: 0.7;
  cursor: not-allowed;
}

.detail-popover-card {
  display: grid;
  gap: 1rem;
  width: min(92vw, 24rem);
  padding: 1rem;
  background: #ffffff;
  color: #173638;
}

.detail-popover-card-picker {
  width: min(92vw, 28rem);
}

.detail-popover-card-calendar {
  width: min(92vw, 25rem);
}

.detail-popover-card-slots {
  width: min(92vw, 20rem);
}

.detail-popover-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.detail-popover-header-stack {
  display: grid;
}

.detail-popover-eyebrow {
  margin: 0 0 0.2rem;
  color: #2e726d;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-popover-title {
  margin: 0;
  color: #173638;
  font-size: 1.05rem;
  font-weight: 800;
}

.detail-popover-copy {
  font-size: 0.9rem;
}

.detail-schedule-nav {
  display: flex;
  gap: 0.6rem;
}

.detail-schedule-nav-btn {
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

:deep(.detail-popover-trigger) {
  justify-content: space-between;
  min-height: 3.4rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.8rem 0.95rem;
  background: rgba(255, 255, 255, 0.88);
  color: var(--text-main);
  font-weight: 700;
}

.detail-popover-trigger-value {
  display: block;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-popover-trigger-icon {
  flex-shrink: 0;
  color: #6e8e91;
  font-size: 1.15rem;
}

.detail-picker-search-shell {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid #d2e8e5;
  border-radius: 1rem;
  padding: 0.85rem 0.95rem;
  background: rgba(248, 252, 251, 0.96);
}

.detail-picker-search-icon {
  flex-shrink: 0;
  color: #7b9ea1;
}

.detail-picker-search-input {
  width: 100%;
  border: 0;
  background: transparent;
  color: #173638;
  outline: none;
}

.detail-picker-search-input::placeholder {
  color: #93aeb1;
}

.detail-picker-state {
  margin: 0;
  color: #5f8588;
  font-size: 0.95rem;
}

.detail-picker-results {
  display: grid;
  gap: 0.65rem;
  max-height: min(45vh, 18rem);
  overflow: auto;
  padding-right: 0.1rem;
}

.detail-picker-option,
.detail-slot-option {
  border: 1px solid #cfe4e1;
  border-radius: 1rem;
  padding: 0.85rem 1rem;
  background: white;
  color: #305d63;
  font-size: 0.94rem;
  font-weight: 700;
  text-align: left;
}

.detail-picker-option-active,
.detail-slot-option-active {
  border-color: #2a7371;
  background: #dff0ee;
  color: #216566;
}

.detail-popover-slot-list {
  display: grid;
  gap: 0.55rem;
  max-height: min(50vh, 20rem);
  overflow: auto;
  padding-right: 0.15rem;
}

.submit-button,
.edit-button,
.delete-button,
.consultation-button {
  border: 0;
  border-radius: 14px;
  padding: 0.95rem 1rem;
  font-weight: 700;
}

.submit-button,
.edit-button,
.delete-button {
  color: white;
  cursor: pointer;
}

.edit-button,
.submit-button {
  background: #0f766e;
}

.consultation-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.consultation-button-primary {
  background: #0f766e;
  color: white;
}

.consultation-button-secondary {
  border: 1px solid var(--border-color);
  background: transparent;
  color: #0f766e;
}

.delete-button {
  background: #be123c;
}

.edit-button:disabled,
.delete-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.cancel-button {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.95rem 1rem;
  background: transparent;
  color: var(--text-main);
  font-weight: 700;
  cursor: pointer;
}

.submit-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.message {
  grid-column: 1 / -1;
  margin: 0;
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  font-weight: 600;
}

.message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.message-warning {
  background: #fffbeb;
  color: #92400e;
}

.message-hint {
  display: block;
  margin-top: 0.25rem;
  font-weight: 500;
  font-size: 0.85rem;
  opacity: 0.85;
}

.message-success {
  background: #ecfdf5;
  color: #047857;
}

.field-inline-hint {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-main);
  opacity: 0.65;
}

.payment-field {
  gap: 0.6rem;
}

.payment-field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.payment-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 800;
}

.payment-pill-paid {
  background: #dcfce7;
  color: #166534;
}

.payment-pill-pending {
  background: #eff6ff;
  color: #1d4ed8;
}

.payment-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.88);
}

.payment-card-copy-block {
  display: grid;
  gap: 0.25rem;
}

.payment-card-title {
  margin: 0;
  color: var(--text-main);
  font-size: 0.95rem;
  font-weight: 800;
}

.payment-card-copy {
  margin: 0;
  color: #5f7c80;
  font-size: 0.92rem;
}

.payment-register-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  padding: 0.9rem 1rem;
  background: #0f766e;
  color: white;
  font-weight: 700;
  text-decoration: none;
}

.slot-button {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.55rem 0.85rem;
  background: white;
  color: var(--text-main);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.slot-button:hover {
  border-color: #0f766e;
}

.slot-button-selected {
  background: #0f766e;
  border-color: #0f766e;
  color: white;
}

@media (max-width: 960px) {
  .detail-form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .detail-popover-card {
    width: min(94vw, 24rem);
    padding: 0.9rem;
  }
}
</style>
