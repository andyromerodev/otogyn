<script setup lang="ts">
import { useBookingScreen } from '../composables/booking/use-booking-screen'

definePageMeta({ layout: 'public' })

const screen = await useBookingScreen()
</script>

<template>
  <div class="space-y-6">
    <!-- error -->
    <p
      v-if="screen.errorMessage.value"
      class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
    >
      {{ screen.errorMessage.value }}
    </p>

    <!-- STEP 1: choose service -->
    <template v-if="screen.step.value === 1">
      <div class="space-y-1">
        <p class="text-xl font-bold text-slate-900">Elige el servicio</p>
        <p class="text-sm text-slate-500">Selecciona el tipo de consulta que necesitas.</p>
      </div>

      <div
        v-if="screen.loading.value"
        class="rounded-2xl border border-slate-100 bg-white py-12 text-center text-sm text-slate-400"
      >
        Cargando servicios...
      </div>

      <div
        v-else-if="!screen.services.value.length"
        class="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400"
      >
        No hay servicios disponibles en este momento.
      </div>

      <div v-else class="space-y-2">
        <button
          v-for="service in screen.services.value"
          :key="service.id"
          class="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left transition hover:border-teal-300 hover:bg-teal-50/50"
          @click="screen.selectService(service)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-0.5">
              <p class="font-semibold text-slate-900">{{ service.name }}</p>
              <p v-if="service.description" class="text-sm text-slate-500">{{ service.description }}</p>
            </div>
            <div class="text-right text-sm text-slate-500 shrink-0">
              <p>{{ service.defaultDurationMinutes }} min</p>
              <p v-if="service.price !== null" class="font-medium text-teal-700">
                S/ {{ service.price.toFixed ? service.price.toFixed(2) : service.price }}
              </p>
            </div>
          </div>
        </button>
      </div>
    </template>

    <!-- STEP 2: choose date + slot -->
    <template v-else-if="screen.step.value === 2">
      <div class="flex items-center gap-3">
        <button
          class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          @click="screen.goBack()"
        >
          ← Volver
        </button>
        <div>
          <p class="font-semibold text-slate-900">{{ screen.selectedService.value?.name }}</p>
          <p class="text-sm text-slate-500">Elige fecha y horario disponible</p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <label class="block space-y-1.5">
          <span class="text-sm font-semibold text-slate-700">Fecha</span>
          <input
            v-model="screen.selectedDate.value"
            type="date"
            :min="new Date().toISOString().slice(0, 10)"
            class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            @change="screen.loadSlots()"
          >
        </label>
      </div>

      <div
        v-if="screen.slotsLoading.value"
        class="rounded-2xl border border-slate-100 bg-white py-10 text-center text-sm text-slate-400"
      >
        Consultando disponibilidad...
      </div>

      <div
        v-else-if="!screen.slots.value.length"
        class="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400"
      >
        No hay horarios disponibles para este día. Intenta otra fecha.
      </div>

      <div v-else class="grid grid-cols-3 gap-2 sm:grid-cols-4">
        <button
          v-for="(slot, i) in screen.slots.value"
          :key="i"
          class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
          @click="screen.selectSlot(slot)"
        >
          {{ screen.formatTime(slot.startsAt) }}
        </button>
      </div>
    </template>

    <!-- STEP 3: patient info -->
    <template v-else-if="screen.step.value === 3">
      <div class="flex items-center gap-3">
        <button
          class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          @click="screen.goBack()"
        >
          ← Volver
        </button>
        <div>
          <p class="font-semibold text-slate-900">Tus datos</p>
          <p class="text-sm text-slate-500">
            {{ screen.selectedService.value?.name }} ·
            {{ screen.formatDate(screen.selectedDate.value) }} ·
            {{ screen.formatTime(screen.selectedSlot.value?.startsAt ?? '') }}
          </p>
        </div>
      </div>

      <form class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5" @submit.prevent="screen.submitBooking()">
        <label class="block space-y-1.5">
          <span class="text-sm font-semibold text-slate-700">Nombre completo <span class="text-rose-500">*</span></span>
          <input
            v-model="screen.form.name"
            type="text"
            required
            minlength="2"
            maxlength="180"
            placeholder="Tu nombre completo"
            class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
        </label>

        <label class="block space-y-1.5">
          <span class="text-sm font-semibold text-slate-700">Teléfono <span class="text-rose-500">*</span></span>
          <input
            v-model="screen.form.phone"
            type="tel"
            required
            minlength="6"
            maxlength="40"
            placeholder="Ej: 987654321"
            class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
        </label>

        <label class="block space-y-1.5">
          <span class="text-sm font-semibold text-slate-700">Email <span class="text-slate-400 font-normal">(opcional)</span></span>
          <input
            v-model="screen.form.email"
            type="email"
            maxlength="255"
            placeholder="correo@ejemplo.com"
            class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
        </label>

        <label class="block space-y-1.5">
          <span class="text-sm font-semibold text-slate-700">Motivo <span class="text-slate-400 font-normal">(opcional)</span></span>
          <textarea
            v-model="screen.form.reason"
            maxlength="500"
            rows="3"
            placeholder="Describe brevemente el motivo de tu consulta..."
            class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none"
          />
        </label>

        <button
          type="submit"
          :disabled="screen.loading.value"
          class="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
        >
          {{ screen.loading.value ? 'Registrando...' : 'Confirmar reserva' }}
        </button>
      </form>
    </template>

    <!-- STEP 4: confirmation -->
    <template v-else-if="screen.step.value === 4 && screen.bookingResult.value">
      <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
        <div class="text-4xl">✅</div>
        <p class="text-xl font-bold text-emerald-800">¡Cita registrada!</p>
        <p class="text-sm text-emerald-700">Tu solicitud fue recibida correctamente.</p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <p class="font-semibold text-slate-900">Detalle de tu cita</p>
        <div class="space-y-1 text-sm text-slate-700">
          <p><span class="text-slate-500">Servicio:</span> {{ screen.bookingResult.value.serviceName }}</p>
          <p><span class="text-slate-500">Fecha:</span> {{ screen.formatDate(screen.bookingResult.value.date) }}</p>
          <p>
            <span class="text-slate-500">Horario:</span>
            {{ screen.formatTime(screen.bookingResult.value.startAt) }} – {{ screen.formatTime(screen.bookingResult.value.endAt) }}
          </p>
          <p><span class="text-slate-500">Duración:</span> {{ screen.bookingResult.value.durationMinutes }} min</p>
        </div>
        <p class="text-xs text-slate-400">
          Te esperamos puntual. Si necesitas cancelar, comunícate con la clínica.
        </p>
      </div>

      <button
        class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        @click="screen.reset()"
      >
        Hacer otra reserva
      </button>
    </template>
  </div>
</template>
