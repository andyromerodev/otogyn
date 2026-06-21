<script setup lang="ts">
import AuthMarketingPanel from '../components/AuthMarketingPanel.vue'
import { useSignupViewModel } from './useSignupViewModel'

const config = useRuntimeConfig()
const isAuthEnabled = computed(() => config.public.authEnabled)
const { signUpForm, errorMessage, pending, submitSignUp } = useSignupViewModel()
</script>

<template>
  <main class="grid min-h-screen bg-[#edf6f4] lg:grid-cols-[46%_54%]">
    <AuthMarketingPanel
      eyebrow="Nueva cuenta"
      title="Empieza en menos de 5 minutos."
      description="Crea tu cuenta OtoGyn y gestiona tu consultorio ORL desde el primer dia."
    />

    <section class="grid min-h-screen items-center px-5 py-8 sm:px-8 sm:py-10">
      <div class="mx-auto w-full max-w-[37rem]">
        <header class="mb-6 sm:mb-8">
          <h2 class="m-0 text-[1.85rem] font-black leading-tight text-[#071b1a] sm:text-[2.35rem]">Crear cuenta</h2>
          <p class="m-0 mt-3 text-base font-medium text-[#739895] sm:mt-4 sm:text-lg">Completa tus datos para registrarte</p>
        </header>

        <div v-if="!isAuthEnabled" class="grid gap-2 rounded-lg border border-[#b9d8d5] p-4 text-[#304c49]">
          <p class="m-0">La autenticacion real no esta habilitada en este entorno.</p>
          <p class="m-0">Configura `DATABASE_URL` y `AUTH_SECRET` para activar Better Auth.</p>
        </div>

        <form v-else class="grid gap-4 sm:gap-5" @submit.prevent="submitSignUp">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <label class="grid gap-3 text-base font-extrabold text-[#304c49]">
              <span>Nombre completo</span>
              <input
                v-model="signUpForm.name"
                class="min-h-14 rounded-lg border border-[#b9d8d5] bg-[#dfeeed] px-5 text-base font-semibold text-[#071b1a] outline-none placeholder:text-[#739895] focus:border-[#216960] sm:min-h-16 sm:px-6 sm:text-lg"
                placeholder="Dra. Ana Garcia"
                autocomplete="name"
              >
            </label>

            <label class="grid gap-3 text-base font-extrabold text-[#304c49]">
              <span>Cedula profesional</span>
              <input
                v-model="signUpForm.professionalLicense"
                class="min-h-14 rounded-lg border border-[#b9d8d5] bg-[#dfeeed] px-5 text-base font-semibold text-[#071b1a] outline-none placeholder:text-[#739895] focus:border-[#216960] sm:min-h-16 sm:px-6 sm:text-lg"
                placeholder="Ej. 1234567"
              >
            </label>
          </div>

          <label class="grid gap-3 text-base font-extrabold text-[#304c49]">
            <span>Especialidad</span>
            <select
              v-model="signUpForm.specialty"
              class="min-h-14 rounded-lg border border-[#b9d8d5] bg-[#dfeeed] px-5 text-base font-semibold text-[#071b1a] outline-none focus:border-[#216960] sm:min-h-16 sm:px-6 sm:text-lg"
            >
              <option>Otorrinolaringologia</option>
              <option>Audiologia</option>
              <option>Cirugia de cabeza y cuello</option>
            </select>
          </label>

          <label class="grid gap-3 text-base font-extrabold text-[#304c49]">
            <span>Correo electronico</span>
            <input
              v-model="signUpForm.email"
              class="min-h-14 rounded-lg border border-[#b9d8d5] bg-[#dfeeed] px-5 text-base font-semibold text-[#071b1a] outline-none placeholder:text-[#739895] focus:border-[#216960] sm:min-h-16 sm:px-6 sm:text-lg"
              type="email"
              placeholder="correo@clinica.mx"
              autocomplete="email"
            >
          </label>

          <label class="grid gap-3 text-base font-extrabold text-[#304c49]">
            <span>Telefono</span>
            <input
              v-model="signUpForm.phone"
              class="min-h-14 rounded-lg border border-[#b9d8d5] bg-[#dfeeed] px-5 text-base font-semibold text-[#071b1a] outline-none placeholder:text-[#739895] focus:border-[#216960] sm:min-h-16 sm:px-6 sm:text-lg"
              type="tel"
              placeholder="+52 55 0000-0000"
              autocomplete="tel"
            >
          </label>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <label class="grid gap-3 text-base font-extrabold text-[#304c49]">
              <span>Contrasena</span>
              <input
                v-model="signUpForm.password"
                class="min-h-14 rounded-lg border border-[#b9d8d5] bg-[#dfeeed] px-5 text-base font-semibold text-[#071b1a] outline-none placeholder:text-[#739895] focus:border-[#216960] sm:min-h-16 sm:px-6 sm:text-lg"
                type="password"
                placeholder="Min. 8 caracteres"
                autocomplete="new-password"
              >
            </label>

            <label class="grid gap-3 text-base font-extrabold text-[#304c49]">
              <span>Confirmar contrasena</span>
              <input
                v-model="signUpForm.confirmPassword"
                class="min-h-14 rounded-lg border border-[#b9d8d5] bg-[#dfeeed] px-5 text-base font-semibold text-[#071b1a] outline-none placeholder:text-[#739895] focus:border-[#216960] sm:min-h-16 sm:px-6 sm:text-lg"
                type="password"
                placeholder="Repite la contrasena"
                autocomplete="new-password"
              >
            </label>
          </div>

          <label class="grid grid-cols-[auto_1fr] items-start gap-3 text-sm leading-6 text-[#304c49] sm:gap-4 sm:text-base sm:leading-7">
            <input v-model="signUpForm.acceptedTerms" class="mt-1 h-5 w-5" type="checkbox">
            <span>
              Acepto los <a class="font-black text-[#216960]" href="#">Terminos de uso</a> y la
              <a class="font-black text-[#216960]" href="#">Politica de privacidad</a> de OtoGyn.
            </span>
          </label>

          <button
            class="min-h-14 rounded-lg bg-[#216960] text-base font-black text-[#f7fffd] transition-opacity disabled:cursor-wait disabled:opacity-70 sm:min-h-16 sm:text-lg"
            type="submit"
            :disabled="pending"
          >
            {{ pending ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>

          <p
            v-if="errorMessage"
            class="m-0 rounded-lg border border-red-700/20 bg-red-50/90 p-4 font-bold text-red-800"
          >
            {{ errorMessage }}
          </p>
        </form>

        <footer class="mt-7 grid justify-items-center text-sm font-bold text-[#739895] sm:mt-9 sm:text-base">
          <p class="m-0">Ya tienes cuenta? <NuxtLink class="font-black text-[#216960]" to="/login">Iniciar sesion</NuxtLink></p>
        </footer>
      </div>
    </section>
  </main>
</template>
