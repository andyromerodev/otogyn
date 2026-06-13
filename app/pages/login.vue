<script setup lang="ts">
import { useAuthClient } from '~/utils/auth-client'

const route = useRoute()
const config = useRuntimeConfig()
const isAuthEnabled = computed(() => config.public.authEnabled)
const showSignUp = import.meta.dev
const authClient = isAuthEnabled.value ? useAuthClient() : null

const signInForm = reactive({
  email: '',
  password: '',
})

const signUpForm = reactive({
  name: '',
  email: '',
  password: '',
})

const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const pending = ref(false)

const redirectTo = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.length > 0 ? redirect : '/dashboard'
})

const submitSignIn = async () => {
  errorMessage.value = null
  successMessage.value = null
  pending.value = true

  const result = await authClient!.signIn.email({
    email: signInForm.email,
    password: signInForm.password,
    callbackURL: redirectTo.value,
    rememberMe: true,
  })

  pending.value = false

  if (result.error) {
    errorMessage.value = result.error.message ?? 'No se pudo iniciar sesion.'
    return
  }

  await navigateTo(redirectTo.value)
}

const submitSignUp = async () => {
  errorMessage.value = null
  successMessage.value = null
  pending.value = true

  const result = await authClient!.signUp.email({
    name: signUpForm.name,
    email: signUpForm.email,
    password: signUpForm.password,
  })

  pending.value = false

  if (result.error) {
    errorMessage.value = result.error.message ?? 'No se pudo crear la cuenta.'
    return
  }

  successMessage.value = 'Cuenta creada. Ya puedes entrar al dashboard.'
  await navigateTo('/dashboard')
}
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Auth"
      title="Acceso del personal"
      description="Better Auth ya esta montado sobre Nuxt Server API. Los roles reales se resuelven en organization_members."
    />

    <div v-if="!isAuthEnabled" class="surface-card placeholder-panel">
      <p>La autenticacion real no esta habilitada en este entorno.</p>
      <p class="muted-text">
        Configura `DATABASE_URL` y `AUTH_SECRET` para activar Better Auth.
      </p>
    </div>

    <div v-else class="login-grid">
      <section class="surface-card login-card">
        <p class="login-title">Entrar</p>
        <UForm :state="signInForm" class="login-form" @submit.prevent="submitSignIn">
          <UFormField label="Email" name="email">
            <UInput v-model="signInForm.email" type="email" placeholder="ana@otogyn.test" />
          </UFormField>
          <UFormField label="Password" name="password">
            <UInput v-model="signInForm.password" type="password" placeholder="********" />
          </UFormField>
          <UButton :loading="pending" type="submit" color="primary" block>
            Iniciar sesion
          </UButton>
        </UForm>
      </section>

      <section v-if="showSignUp" class="surface-card login-card">
        <p class="login-title">Bootstrap local</p>
        <p class="muted-text">
          En desarrollo se permite crear el primer usuario. El primero recibe `admin_doctor`; los siguientes, `assistant`.
        </p>
        <UForm :state="signUpForm" class="login-form" @submit.prevent="submitSignUp">
          <UFormField label="Nombre" name="name">
            <UInput v-model="signUpForm.name" placeholder="Dra. Ana Garcia" />
          </UFormField>
          <UFormField label="Email" name="email">
            <UInput v-model="signUpForm.email" type="email" placeholder="ana@otogyn.test" />
          </UFormField>
          <UFormField label="Password" name="password">
            <UInput v-model="signUpForm.password" type="password" placeholder="Minimo 8 caracteres" />
          </UFormField>
          <UButton :loading="pending" type="submit" color="neutral" variant="soft" block>
            Crear cuenta local
          </UButton>
        </UForm>
      </section>
    </div>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      :title="errorMessage"
    />
    <UAlert
      v-if="successMessage"
      color="success"
      variant="soft"
      :title="successMessage"
    />
  </div>
</template>

<style scoped>
.login-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.login-card {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
}

.login-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.login-form {
  display: grid;
  gap: 1rem;
}

@media (max-width: 960px) {
  .login-grid {
    grid-template-columns: 1fr;
  }
}
</style>
