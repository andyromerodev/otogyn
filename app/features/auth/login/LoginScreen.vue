<script setup lang="ts">
import AuthMarketingPanel from '../components/AuthMarketingPanel.vue'
import { useLoginViewModel } from './useLoginViewModel'

const config = useRuntimeConfig()
const isAuthEnabled = computed(() => config.public.authEnabled)
const showPassword = ref(false)
const { signInForm, errorMessage, pending, submitSignIn } = useLoginViewModel()
</script>

<template>
  <main class="grid min-h-screen bg-[#edf6f4] lg:grid-cols-[46%_54%]">
    <AuthMarketingPanel
      eyebrow="Gestion clinica"
      title="Tu consultorio, siempre contigo."
      description="Accede a expedientes, agenda citas y gestiona tu operacion diaria desde un solo lugar."
    />

    <section class="grid min-h-screen place-items-center px-8 py-12">
      <div class="w-full max-w-[36rem]">
        <header class="mb-10">
          <h2 class="m-0 text-[2.35rem] font-black leading-tight text-[#071b1a]">
            Bienvenida, Dra. Garcia
          </h2>
          <p class="m-0 mt-4 text-lg font-medium text-[#739895]">
            Ingresa tus credenciales para continuar
          </p>
        </header>

        <div v-if="!isAuthEnabled" class="grid gap-2 rounded-lg border border-[#b9d8d5] p-4 text-[#304c49]">
          <p class="m-0">La autenticacion real no esta habilitada en este entorno.</p>
          <p class="m-0">Configura `DATABASE_URL` y `AUTH_SECRET` para activar Better Auth.</p>
        </div>

        <form v-else class="grid gap-6" @submit.prevent="submitSignIn">
          <label class="grid gap-3 text-base font-extrabold text-[#304c49]">
            <span>Correo electronico</span>
            <input
              v-model="signInForm.email"
              class="min-h-16 rounded-lg border border-[#b9d8d5] bg-[#dfeeed] px-6 text-lg font-semibold text-[#071b1a] outline-none placeholder:text-[#739895] focus:border-[#216960]"
              type="email"
              placeholder="ana.garcia@otogyn.mx"
              autocomplete="email"
            >
          </label>

          <label class="grid gap-3 text-base font-extrabold text-[#304c49]">
            <span class="flex items-center justify-between gap-4">
              <span>Contrasena</span>
              <NuxtLink to="/login" class="text-[#216960]">Olvidaste tu contrasena?</NuxtLink>
            </span>
            <span class="grid min-h-16 grid-cols-[1fr_auto] items-center overflow-hidden rounded-lg border border-[#b9d8d5] bg-[#dfeeed] focus-within:border-[#216960]">
              <input
                v-model="signInForm.password"
                class="min-h-16 bg-transparent px-6 text-lg font-semibold text-[#071b1a] outline-none placeholder:text-[#739895]"
                :type="showPassword ? 'text' : 'password'"
                placeholder="********"
                autocomplete="current-password"
              >
              <button
                class="px-6 text-base font-extrabold text-[#739895]"
                type="button"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Ocultar' : 'Ver' }}
              </button>
            </span>
          </label>

          <button
            class="mt-2 min-h-16 rounded-lg bg-[#216960] text-lg font-black text-[#f7fffd] transition-opacity disabled:cursor-wait disabled:opacity-70"
            type="submit"
            :disabled="pending"
          >
            {{ pending ? 'Ingresando...' : 'Iniciar sesion' }}
          </button>

          <div class="my-3 grid grid-cols-[1fr_auto_1fr] items-center gap-6 text-[#739895]">
            <span class="h-px bg-[#a8cfcb]" />
            <p class="m-0 font-bold">o continua con</p>
            <span class="h-px bg-[#a8cfcb]" />
          </div>

          <button
            class="min-h-16 rounded-lg border border-[#b9d8d5] bg-transparent text-lg font-black text-[#304c49]"
            type="button"
          >
            <span class="mr-3 text-[#2563eb]">G</span>
            Acceso con Google Workspace
          </button>

          <p
            v-if="errorMessage"
            class="m-0 rounded-lg border border-red-700/20 bg-red-50/90 p-4 font-bold text-red-800"
          >
            {{ errorMessage }}
          </p>
        </form>

        <footer class="mt-10 grid justify-items-center gap-4 text-base font-bold text-[#739895]">
          <p class="m-0">No tienes cuenta? <NuxtLink class="font-black text-[#216960]" to="/signup">Crear cuenta</NuxtLink></p>
          <p class="m-0">OtoGyn 2026 · Soporte</p>
        </footer>
      </div>
    </section>
  </main>
</template>
