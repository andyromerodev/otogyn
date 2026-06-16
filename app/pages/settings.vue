<script setup lang="ts">
import { useAssistantsScreen } from '../composables/settings/use-assistants-screen'

definePageMeta({
  middleware: 'admin',
})

const screen = await useAssistantsScreen()

const permissionGroups = [
  {
    role: 'admin_doctor',
    title: 'Doctora administradora',
    description: 'Control total sobre configuracion, asistentes y operacion clinica.',
    capabilities: [
      'Crear y gestionar asistentes',
      'Registrar y editar pacientes',
      'Registrar servicios y cambiar configuraciones criticas',
      'Crear y coordinar citas',
    ],
  },
  {
    role: 'assistant',
    title: 'Asistente',
    description: 'Operacion diaria sin acceso a configuraciones criticas.',
    capabilities: [
      'Ver agenda y pacientes',
      'Registrar pacientes',
      'Crear y coordinar citas',
      'Sin acceso a gestion de asistentes ni ajustes sensibles',
    ],
  },
]
</script>

<template>
  <div class="space-y-6">
    <SharedSectionHeader
      eyebrow="Permisos"
      title="Gestion de asistentes"
      description="Solo `admin_doctor` puede crear cuentas de asistentes y revisar el alcance operativo de cada rol."
    />

    <section class="grid gap-4 xl:grid-cols-[minmax(360px,440px)_minmax(0,1fr)]">
      <article
        v-if="screen.canManageAssistants.value"
        class="surface-card space-y-5 rounded-[28px] p-5"
      >
        <div class="space-y-1">
          <p class="text-lg font-semibold text-slate-900">Nuevo asistente</p>
          <p class="text-sm text-slate-500">
            La cuenta se crea en Better Auth y su rol operativo queda vinculado a la organizacion actual.
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="screen.submitAssistant">
          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Nombre completo</span>
            <input
              v-model="screen.form.name"
              type="text"
              placeholder="Laura Perez"
              required
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Correo electronico</span>
            <input
              v-model="screen.form.email"
              type="email"
              placeholder="asistente@otogyn.test"
              required
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Telefono</span>
              <input
                v-model="screen.form.phone"
                type="text"
                placeholder="999888777"
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>

            <label class="block space-y-1.5">
              <span class="text-sm font-semibold text-slate-700">Area o nota interna</span>
              <input
                v-model="screen.form.specialty"
                type="text"
                placeholder="Atencion administrativa"
                class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
            </label>
          </div>

          <label class="block space-y-1.5">
            <span class="text-sm font-semibold text-slate-700">Contrasena temporal</span>
            <input
              v-model="screen.form.password"
              type="password"
              minlength="8"
              placeholder="Minimo 8 caracteres"
              required
              class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
          </label>

          <button
            class="w-full rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
            type="submit"
            :disabled="screen.pending.value"
          >
            {{ screen.pending.value ? 'Creando cuenta...' : 'Registrar asistente' }}
          </button>

          <p v-if="screen.errorMessage.value" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {{ screen.errorMessage.value }}
          </p>
          <p v-if="screen.successMessage.value" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {{ screen.successMessage.value }}
          </p>
        </form>
      </article>

      <section class="grid gap-4">
        <article class="surface-card rounded-[28px] p-5">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="space-y-1">
              <p class="text-lg font-semibold text-slate-900">Equipo asistente</p>
              <p class="text-sm text-slate-500">Listado persistido desde PostgreSQL para la organizacion activa.</p>
            </div>
            <span class="pill">{{ screen.assistantsCount.value }} asistentes</span>
          </div>

          <div v-if="screen.assistants.value.length" class="mt-4 grid gap-3">
            <article
              v-for="assistant in screen.assistants.value"
              :key="assistant.userId"
              class="rounded-3xl border border-teal-100 bg-white/80 p-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-1">
                  <p class="text-base font-semibold text-slate-900">{{ assistant.name }}</p>
                  <p class="text-sm text-slate-500">{{ assistant.email }}</p>
                  <p class="text-sm text-slate-500">
                    {{ assistant.phone ?? 'Sin telefono' }} · {{ assistant.specialty ?? 'Sin nota interna' }}
                  </p>
                </div>

                <span class="pill">assistant</span>
              </div>
            </article>
          </div>

          <div v-else class="mt-4 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Aun no hay asistentes registrados para esta organizacion.
          </div>
        </article>

        <article class="surface-card rounded-[28px] p-5">
          <div class="space-y-1">
            <p class="text-lg font-semibold text-slate-900">Matriz de permisos</p>
            <p class="text-sm text-slate-500">Fuente de verdad actual: `organization_members` validado server-side.</p>
          </div>

          <div class="mt-4 grid gap-4 lg:grid-cols-2">
            <article
              v-for="group in permissionGroups"
              :key="group.role"
              class="rounded-3xl border border-teal-100 bg-white/80 p-4"
            >
              <div class="space-y-1">
                <p class="text-base font-semibold text-slate-900">{{ group.title }}</p>
                <p class="text-sm text-slate-500">{{ group.description }}</p>
              </div>

              <ul class="mt-4 space-y-2 text-sm text-slate-600">
                <li v-for="capability in group.capabilities" :key="capability" class="flex items-start gap-2">
                  <span class="mt-1 h-2 w-2 rounded-full bg-teal-600" />
                  <span>{{ capability }}</span>
                </li>
              </ul>
            </article>
          </div>
        </article>
      </section>
    </section>
  </div>
</template>
