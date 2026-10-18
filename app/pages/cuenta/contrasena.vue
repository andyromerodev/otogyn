<script setup lang="ts">
import { z } from 'zod'
import { getBetterAuthClient } from '~~/src/infrastructure/auth/client/better-auth-client'
import { changePasswordSchema } from '~~/src/presentation/validators/change-password'

definePageMeta({
  middleware: 'auth',
})

const WRONG_CURRENT_PASSWORD_MESSAGE = 'La contraseña actual no es correcta.'
const GENERIC_ERROR_MESSAGE = 'No se pudo cambiar la contraseña. Intenta de nuevo.'
const SUCCESS_MESSAGE = 'Tu contraseña se cambió correctamente.'
const STALE_SESSION_MESSAGE = 'Por seguridad, vuelve a iniciar sesión para cambiar tu contraseña.'

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const fieldErrors = ref<Record<string, string[] | undefined>>({})
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const pending = ref(false)
const needsReauth = ref(false)

// Better Auth responde INVALID_PASSWORD (mensaje "Invalid password") cuando la contraseña actual no coincide.
const isWrongCurrentPassword = (error: { code?: string, message?: string }) =>
  error.code === 'INVALID_PASSWORD' || error.message === 'Invalid password'

// Sesiones de mas de 24 horas: Better Auth responde SESSION_NOT_FRESH. Hay que volver a entrar.
const isStaleSession = (error: { code?: string }) => error.code === 'SESSION_NOT_FRESH'

const signInAgain = async () => {
  await getBetterAuthClient().signOut()
  await navigateTo({ path: '/login', query: { redirect: '/cuenta/contrasena' } })
}

const submitPasswordChange = async () => {
  errorMessage.value = null
  successMessage.value = null

  const result = changePasswordSchema.safeParse({ ...form })

  if (!result.success) {
    fieldErrors.value = z.flattenError(result.error).fieldErrors
    return
  }

  fieldErrors.value = {}
  pending.value = true

  try {
    const { error } = await getBetterAuthClient().changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      revokeOtherSessions: true,
    })

    if (error) {
      if (isStaleSession(error)) {
        needsReauth.value = true
        errorMessage.value = STALE_SESSION_MESSAGE
        return
      }

      errorMessage.value = isWrongCurrentPassword(error)
        ? WRONG_CURRENT_PASSWORD_MESSAGE
        : GENERIC_ERROR_MESSAGE
      return
    }

    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    successMessage.value = SUCCESS_MESSAGE
  } catch {
    errorMessage.value = GENERIC_ERROR_MESSAGE
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <SharedSectionHeader
      eyebrow="Cuenta"
      title="Cambiar contraseña"
    />

    <section class="surface-card max-w-xl space-y-5 rounded-[28px] p-5">
      <form class="space-y-4" @submit.prevent="submitPasswordChange">
        <label class="block space-y-1.5">
          <span class="text-sm font-semibold text-slate-700">Contraseña actual</span>
          <input
            v-model="form.currentPassword"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
          <span v-if="fieldErrors.currentPassword" class="block text-sm font-medium text-rose-700">
            {{ fieldErrors.currentPassword[0] }}
          </span>
        </label>

        <label class="block space-y-1.5">
          <span class="text-sm font-semibold text-slate-700">Contraseña nueva</span>
          <input
            v-model="form.newPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Minimo 8 caracteres"
            class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
          <span v-if="fieldErrors.newPassword" class="block text-sm font-medium text-rose-700">
            {{ fieldErrors.newPassword[0] }}
          </span>
        </label>

        <label class="block space-y-1.5">
          <span class="text-sm font-semibold text-slate-700">Confirmar contraseña nueva</span>
          <input
            v-model="form.confirmPassword"
            type="password"
            autocomplete="new-password"
            class="w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
          <span v-if="fieldErrors.confirmPassword" class="block text-sm font-medium text-rose-700">
            {{ fieldErrors.confirmPassword[0] }}
          </span>
        </label>

        <button
          class="w-full rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
          type="submit"
          :disabled="pending"
        >
          Cambiar contraseña
        </button>

        <p v-if="errorMessage" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {{ errorMessage }}
        </p>
        <button
          v-if="needsReauth"
          type="button"
          class="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
          @click="signInAgain"
        >
          Volver a entrar
        </button>
        <p v-if="successMessage" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {{ successMessage }}
        </p>
      </form>
    </section>
  </div>
</template>
