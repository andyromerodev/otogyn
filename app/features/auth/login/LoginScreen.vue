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

    <section class="grid min-h-screen place-items-center px-5 py-10 sm:px-8 sm:py-12">
      <div class="w-full max-w-[36rem]">
        <header class="mb-8 sm:mb-10">
          <h2 class="m-0 text-[1.85rem] font-black leading-tight text-[#071b1a] sm:text-[2.35rem]">
            Bienvenida, Dra. Garcia
          </h2>
          <p class="m-0 mt-3 text-base font-medium text-[#739895] sm:mt-4 sm:text-lg">
            Ingresa tus credenciales para continuar
          </p>
        </header>

        <div v-if="!isAuthEnabled" class="grid gap-2 rounded-lg border border-[#b9d8d5] p-4 text-[#304c49]">
          <p class="m-0">La autenticacion real no esta habilitada en este entorno.</p>
          <p class="m-0">Configura `DATABASE_URL` y `AUTH_SECRET` para activar Better Auth.</p>
        </div>

        <form v-else class="grid gap-5 sm:gap-6" @submit.prevent="submitSignIn">
          <label class="grid gap-3 text-base font-extrabold text-[#304c49]">
            <span>Correo electronico</span>
            <input
              v-model="signInForm.email"
              class="min-h-14 rounded-lg border border-[#b9d8d5] bg-[#dfeeed] px-5 text-base font-semibold text-[#071b1a] outline-none placeholder:text-[#739895] focus:border-[#216960] sm:min-h-16 sm:px-6 sm:text-lg"
              type="email"
              placeholder="ana.garcia@otogyn.mx"
              autocomplete="email"
            >
          </label>

          <label class="grid gap-3 text-base font-extrabold text-[#304c49]">
            <span class="flex flex-wrap items-center justify-between gap-2">
              <span>Contrasena</span>
              <NuxtLink to="/login" class="text-sm text-[#216960] sm:text-base">Olvidaste tu contrasena?</NuxtLink>
            </span>
            <span class="grid min-h-14 grid-cols-[1fr_auto] items-center overflow-hidden rounded-lg border border-[#b9d8d5] bg-[#dfeeed] focus-within:border-[#216960] sm:min-h-16">
              <input
                v-model="signInForm.password"
                class="min-h-14 bg-transparent px-5 text-base font-semibold text-[#071b1a] outline-none placeholder:text-[#739895] sm:min-h-16 sm:px-6 sm:text-lg"
                :type="showPassword ? 'text' : 'password'"
                placeholder="********"
                autocomplete="current-password"
              >
              <button
                class="px-4 text-sm font-extrabold text-[#739895] sm:px-6 sm:text-base"
                type="button"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Ocultar' : 'Ver' }}
              </button>
            </span>
          </label>

          <button
            class="mt-2 min-h-14 rounded-lg bg-[#216960] text-base font-black text-[#f7fffd] transition-opacity disabled:cursor-wait disabled:opacity-70 sm:min-h-16 sm:text-lg"
            type="submit"
            :disabled="pending"
          >
            {{ pending ? 'Ingresando...' : 'Iniciar sesion' }}
          </button>

          <div class="my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-[#739895] sm:my-3 sm:gap-6">
            <span class="h-px bg-[#a8cfcb]" />
            <p class="m-0 text-sm font-bold sm:text-base">o continua con</p>
            <span class="h-px bg-[#a8cfcb]" />
          </div>

          <button
            class="min-h-14 rounded-lg border border-[#b9d8d5] bg-transparent text-base font-black text-[#304c49] sm:min-h-16 sm:text-lg"
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

        <footer class="mt-8 grid justify-items-center gap-3 text-sm font-bold text-[#739895] sm:mt-10 sm:gap-4 sm:text-base">
          <p class="m-0">No tienes cuenta? <NuxtLink class="font-black text-[#216960]" to="/signup">Crear cuenta</NuxtLink></p>
          <p class="m-0">OtoGyn 2026 · Soporte</p>
        </footer>
      </div>
    </section>
  </main>
</template>
