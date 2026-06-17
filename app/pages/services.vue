<script setup lang="ts">
import { useServicesScreen } from '../composables/services/use-services-screen'

definePageMeta({
  middleware: 'auth',
})

const screen = await useServicesScreen()
</script>

<template>
  <div class="space-y-6">
    <SharedSectionHeader
      eyebrow="Servicios"
      title="Catalogo de servicios"
      description="Los servicios se guardan en PostgreSQL y quedan listos para usarse en citas reales."
    />

    <p v-if="screen.errorMessage.value" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
      {{ screen.errorMessage.value }}
    </p>
    <p v-if="screen.successMessage.value" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
      {{ screen.successMessage.value }}
    </p>

    <section class="grid gap-4 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
      <article
        v-if="screen.canCreateServices.value"
        class="surface-card space-y-4 rounded-[28px] p-5"
      >
        <div class="space-y-1">
          <p class="text-lg font-semibold text-slate-900">Nuevo servicio</p>
          <p class="text-sm text-slate-500">Duracion, precio opcional y estado activo.</p>
        </div>

        <form class="space-y-4" @submit.prevent="screen.submitService">
          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Nombre</span>
            <input
              v-model="screen.form.name"
              type="text"
              placeholder="Consulta ORL"
              required
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Descripcion</span>
            <textarea
              v-model="screen.form.description"
              rows="4"
              placeholder="Detalle administrativo del servicio."
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Duracion (min)</span>
              <input
                v-model.number="screen.form.defaultDurationMinutes"
                type="number"
                min="1"
                max="480"
                required
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>

            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Precio (opcional)</span>
              <input
                v-model="screen.form.price"
                type="number"
                min="0"
                step="0.01"
                placeholder="150.00"
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>
          </div>

          <label class="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm font-medium text-slate-700">
            <input v-model="screen.form.isActive" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500">
            Servicio activo para agendar
          </label>

          <button
            class="w-full rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
            type="submit"
            :disabled="screen.pending.value"
          >
            {{ screen.pending.value ? 'Guardando...' : 'Registrar servicio' }}
          </button>
        </form>
      </article>

      <section class="grid gap-4 md:grid-cols-2">
        <article
          v-for="service in screen.services.value"
          :key="service.id"
          class="surface-card space-y-4 rounded-[28px] p-5"
        >
          <div
            v-if="screen.editingServiceId.value === service.id"
            class="space-y-4"
          >
            <div class="space-y-1">
              <p class="text-lg font-semibold text-slate-900">Editar servicio</p>
              <p class="text-sm text-slate-500">{{ service.name }}</p>
            </div>

            <form class="space-y-3" @submit.prevent="screen.submitServiceUpdate">
              <label class="block space-y-1.5">
                <span class="text-sm font-semibold text-slate-700">Nombre</span>
                <input
                  v-model="screen.editForm.name"
                  type="text"
                  required
                  class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                >
              </label>

              <label class="block space-y-1.5">
                <span class="text-sm font-semibold text-slate-700">Descripcion</span>
                <textarea
                  v-model="screen.editForm.description"
                  rows="3"
                  class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <div class="grid gap-3 sm:grid-cols-2">
                <label class="block space-y-1.5">
                  <span class="text-sm font-semibold text-slate-700">Duracion (min)</span>
                  <input
                    v-model.number="screen.editForm.defaultDurationMinutes"
                    type="number"
                    min="1"
                    max="480"
                    required
                    class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  >
                </label>

                <label class="block space-y-1.5">
                  <span class="text-sm font-semibold text-slate-700">Precio (opcional)</span>
                  <input
                    v-model="screen.editForm.price"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  >
                </label>
              </div>

              <label class="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm font-medium text-slate-700">
                <input v-model="screen.editForm.isActive" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500">
                Servicio activo para agendar
              </label>

              <div class="flex flex-wrap gap-3">
                <button
                  class="rounded-2xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
                  type="submit"
                  :disabled="screen.pending.value"
                >
                  {{ screen.pending.value ? 'Guardando...' : 'Guardar cambios' }}
                </button>

                <button
                  class="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  type="button"
                  @click="screen.cancelEditingService"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <div v-else class="space-y-1">
            <p class="text-lg font-semibold text-slate-900">{{ service.name }}</p>
            <p class="text-sm leading-6 text-slate-500">
              {{ service.description ?? 'Sin descripcion administrativa' }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="pill">{{ service.defaultDurationMinutes }} min</span>
            <span v-if="service.price !== null" class="pill">S/ {{ service.price.toFixed(2) }}</span>
            <span class="pill" :class="service.isActive ? '' : 'bg-amber-100 text-amber-700'">
              {{ service.isActive ? 'Activo' : 'Inactivo' }}
            </span>

            <template v-if="screen.canCreateServices.value">
              <button
                class="rounded-2xl border border-teal-200 px-3 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                type="button"
                @click="screen.startEditingService(service)"
              >
                Editar
              </button>
              <button
                v-if="service.isActive"
                class="rounded-2xl border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-wait disabled:opacity-70"
                type="button"
                :disabled="screen.togglingServiceId.value === service.id"
                @click="screen.toggleServiceActive(service.id)"
              >
                {{ screen.togglingServiceId.value === service.id ? 'Cambiando...' : 'Desactivar' }}
              </button>
              <button
                v-else
                class="rounded-2xl border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-70"
                type="button"
                :disabled="screen.togglingServiceId.value === service.id"
                @click="screen.toggleServiceActive(service.id)"
              >
                {{ screen.togglingServiceId.value === service.id ? 'Cambiando...' : 'Activar' }}
              </button>
            </template>
          </div>
        </article>

        <article
          v-if="!screen.services.value.length"
          class="surface-card rounded-[28px] p-5 text-sm text-slate-500 md:col-span-2"
        >
          Aun no hay servicios registrados para esta organizacion.
        </article>
      </section>
    </section>
  </div>
</template>
