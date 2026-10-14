<script setup lang="ts">
import FileUploadField from '../components/pre-evaluacion/file-upload-field.vue'
import StepProgress from '../components/pre-evaluacion/step-progress.vue'
import { usePreEvaluacionScreen } from '../composables/pre-evaluacion/use-pre-evaluacion-screen'
import { STEP_LABELS, TOTAL_STEPS } from '../../src/presentation/view-models/pre-evaluacion/pre-evaluacion-screen'

definePageMeta({ layout: 'public' })

const screen = usePreEvaluacionScreen()
</script>

<template>
  <div class="preeval-page">
    <div v-if="!screen.submissionId.value" class="preeval-header">
      <p class="preeval-eyebrow">Atención Médica Virtual</p>
      <h1 class="preeval-title">Formulario de pre-evaluación</h1>
      <p class="preeval-copy">
        Complete este formulario antes de coordinar su cita. La información será evaluada por
        la Dra. Tamayo para determinar la mejor forma de atención médica.
      </p>
    </div>

    <article v-if="!screen.submissionId.value" class="surface-card preeval-card">
      <StepProgress :current-step="screen.step.value" :total-steps="TOTAL_STEPS" :step-labels="STEP_LABELS" />

      <form class="preeval-form" @submit.prevent>
        <input
          v-model="screen.form.website"
          type="text"
          name="b_website_hp"
          tabindex="-1"
          autocomplete="new-password"
          aria-hidden="true"
          style="display: none !important;"
        >

        <!-- SECCIÓN 1: DATOS DEL PACIENTE -->
        <section v-if="screen.step.value === 1" class="preeval-step">
          <div class="preeval-step-header">
            <span class="preeval-step-number">Sección 1 de {{ TOTAL_STEPS }}</span>
            <h2 class="preeval-step-title">Datos del paciente</h2>
          </div>

          <label class="preeval-field">
            <span class="preeval-field-label">
              1. Nombres y apellidos completos <strong class="preeval-required">*</strong>
            </span>
            <input
              v-model="screen.form.fullName"
              type="text"
              placeholder="Ej. María Elena Torres Sánchez"
              required
            >
          </label>

          <div class="preeval-grid">
            <label class="preeval-field">
              <span class="preeval-field-label">
                2. Fecha de nacimiento <strong class="preeval-required">*</strong>
              </span>
              <input
                v-model="screen.form.birthDate"
                type="date"
                required
              >
            </label>

            <label class="preeval-field">
              <span class="preeval-field-label">
                3. Ciudad y país de residencia <strong class="preeval-required">*</strong>
              </span>
              <input
                v-model="screen.form.residenceCityCountry"
                type="text"
                placeholder="Ej. Lima, Perú"
                required
              >
            </label>
          </div>

          <div class="preeval-grid">
            <label class="preeval-field">
              <span class="preeval-field-label">
                4. Número de WhatsApp <strong class="preeval-required">*</strong>
              </span>
              <input
                v-model="screen.form.phone"
                type="tel"
                placeholder="Ej. 999888777 o +51 999 888 777"
                required
              >
            </label>

            <label class="preeval-field">
              <span class="preeval-field-label">
                5. Correo electrónico <span class="preeval-optional">(opcional)</span>
              </span>
              <input
                v-model="screen.form.email"
                type="email"
                placeholder="correo@ejemplo.com"
              >
            </label>
          </div>
        </section>

        <!-- SECCIÓN 2: MOTIVO DE CONSULTA -->
        <section v-if="screen.step.value === 2" class="preeval-step">
          <div class="preeval-step-header">
            <span class="preeval-step-number">Sección 2 de {{ TOTAL_STEPS }}</span>
            <h2 class="preeval-step-title">Motivo de consulta</h2>
          </div>

          <label class="preeval-field">
            <span class="preeval-field-label">
              6. ¿Cuál es el motivo de su consulta? <strong class="preeval-required">*</strong>
            </span>
            <span class="preeval-field-hint">
              Describa con sus propias palabras las molestias o el problema de salud por el que solicita atención médica.
            </span>
            <textarea
              v-model="screen.form.complaintDescription"
              rows="4"
              placeholder="Describa aquí sus síntomas o molestias principales..."
              required
            />
          </label>

          <label class="preeval-field">
            <span class="preeval-field-label">
              7. ¿Desde cuándo presenta estas molestias? <strong class="preeval-required">*</strong>
            </span>
            <input
              v-model="screen.form.symptomDurationText"
              type="text"
              placeholder="Ej. Hace 3 semanas, desde ayer en la noche, hace 2 meses..."
              required
            >
          </label>

          <label class="preeval-field">
            <span class="preeval-field-label">
              8. Antecedentes patológicos personales <span class="preeval-optional">(opcional)</span>
            </span>
            <span class="preeval-field-hint">
              Indique si padece alguna enfermedad, tiene alergias a medicamentos, antecedentes de cirugías o utiliza medicamentos de manera habitual.
            </span>
            <textarea
              v-model="screen.form.medicalHistory"
              rows="3"
              placeholder="Enfermedades previas, alergias, cirugías, tratamientos habituales..."
            />
          </label>
        </section>

        <!-- SECCIÓN 3: DOCUMENTACIÓN MÉDICA -->
        <section v-if="screen.step.value === 3" class="preeval-step">
          <div class="preeval-step-header">
            <span class="preeval-step-number">Sección 3 de {{ TOTAL_STEPS }}</span>
            <h2 class="preeval-step-title">Documentación médica</h2>
          </div>

          <label class="preeval-field">
            <span class="preeval-field-label">
              9. ¿Ha recibido algún tratamiento o cuenta con exámenes médicos relacionados con su problema actual?
              <span class="preeval-optional">(opcional)</span>
            </span>
            <span class="preeval-field-hint">
              Si corresponde, puede indicar brevemente qué tratamientos ha recibido o qué estudios le han realizado.
            </span>
            <textarea
              v-model="screen.form.previousTreatmentsAndExams"
              rows="3"
              placeholder="Tratamientos médicos previos, pastillas, endoscopía, tomografía, etc."
            />
          </label>

          <div class="preeval-field">
            <span class="preeval-field-label">
              10. Adjunte sus exámenes, recetas o informes médicos <span class="preeval-optional">(opcional)</span>
            </span>
            <span class="preeval-field-hint">
              Puede adjuntar exámenes auxiliares, estudios de imágenes, informes médicos, recetas o tratamientos anteriores relacionados con su consulta. Formatos permitidos: PDF, JPG, PNG.
            </span>
            <FileUploadField
              :attachments="screen.attachments.value"
              @add-files="screen.addFiles"
              @remove="screen.removeAttachment"
            />
          </div>
        </section>

        <!-- SECCIÓN 4: CONFIRMACIÓN -->
        <section v-if="screen.step.value === 4" class="preeval-step">
          <div class="preeval-step-header">
            <span class="preeval-step-number">Sección 4 de {{ TOTAL_STEPS }}</span>
            <h2 class="preeval-step-title">Confirmación y condiciones</h2>
          </div>

          <div class="preeval-notice-box">
            <div class="preeval-notice-icon" aria-hidden="true">ℹ️</div>
            <p class="preeval-notice-text">
              La atención virtual permite realizar una evaluación médica a distancia.
              Dependiendo de su condición, podría ser necesaria una evaluación presencial.
            </p>
          </div>

          <div class="preeval-field">
            <span class="preeval-field-label">
              11. ¿Comprende las condiciones de la atención virtual? <strong class="preeval-required">*</strong>
            </span>
            <div class="preeval-radio-options" role="radiogroup">
              <label class="preeval-radio-card" :class="{ 'preeval-radio-card-active': screen.form.understandsVirtualConditions === true }">
                <input
                  type="radio"
                  name="understandsVirtual"
                  :checked="screen.form.understandsVirtualConditions === true"
                  @change="screen.form.understandsVirtualConditions = true"
                >
                <span class="preeval-radio-card-label">Sí, comprendo las condiciones</span>
              </label>

              <label class="preeval-radio-card" :class="{ 'preeval-radio-card-active': screen.form.understandsVirtualConditions === false }">
                <input
                  type="radio"
                  name="understandsVirtual"
                  :checked="screen.form.understandsVirtualConditions === false"
                  @change="screen.form.understandsVirtualConditions = false"
                >
                <span class="preeval-radio-card-label">No comprendo del todo</span>
              </label>
            </div>

            <div v-if="screen.form.understandsVirtualConditions === false" class="preeval-alert-box">
              <p>
                ⚠️ <strong>Nota:</strong> Ha indicado que no comprende las condiciones. Podrá enviar el formulario de todas maneras y la Dra. Tamayo o su asistente se comunicarán para resolver sus dudas antes de la consulta.
              </p>
            </div>
          </div>

          <div class="preeval-consent-group">
            <h3 class="preeval-consent-title">Aviso de privacidad y protección de datos</h3>
            <label class="preeval-flag">
              <input v-model="screen.form.consentPrivacyPolicy" type="checkbox" required>
              <span>
                Autorizo el tratamiento de mis datos personales y de salud para fines de atención médica virtual, conforme a las políticas de confidencialidad y secreto profesional médico.
              </span>
            </label>
          </div>
        </section>

        <p v-if="screen.errorMessage.value" class="preeval-message preeval-message-error">
          {{ screen.errorMessage.value }}
        </p>

        <div class="preeval-actions">
          <button
            v-if="screen.step.value > 1"
            type="button"
            class="preeval-secondary-button"
            @click="screen.prevStep"
          >
            Anterior
          </button>

          <button
            v-if="screen.step.value < TOTAL_STEPS"
            type="button"
            class="preeval-primary-button"
            @click="screen.nextStep"
          >
            Siguiente
          </button>

          <button
            v-else
            type="button"
            class="preeval-primary-button"
            :disabled="
              screen.pending.value
                || screen.form.understandsVirtualConditions === null
                || !screen.form.consentPrivacyPolicy
            "
            @click="screen.submitForm"
          >
            {{ screen.pending.value ? 'Enviando...' : 'Enviar formulario' }}
          </button>
        </div>
      </form>
    </article>

    <!-- MENSAJE DE FINALIZACIÓN -->
    <article v-else class="surface-card preeval-card preeval-thank-you">
      <div class="preeval-thank-icon" aria-hidden="true">✓</div>
      <h1 class="preeval-thank-title">¡Gracias por completar el formulario!</h1>
      <p class="preeval-thank-p1">Hemos recibido su información.</p>
      <p class="preeval-thank-p2">
        Nos comunicaremos con usted para coordinar su atención médica virtual.
      </p>

      <div class="preeval-thank-signature">
        <strong class="preeval-doctor-name">Dra. Tamayo</strong>
        <span class="preeval-doctor-spec">Otorrinolaringología</span>
      </div>
    </article>
  </div>
</template>

<style scoped>
.preeval-page {
  display: grid;
  gap: 1.2rem;
  max-width: 44rem;
  margin: 0 auto;
}

.preeval-header {
  display: grid;
  gap: 0.45rem;
}

.preeval-eyebrow {
  margin: 0;
  color: #2e726d;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.preeval-title {
  margin: 0;
  color: #102e30;
  font-size: clamp(1.6rem, 4vw, 2.3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.preeval-copy {
  margin: 0;
  color: #608083;
  font-size: 0.98rem;
  line-height: 1.5;
}

.preeval-card {
  padding: 1.6rem;
  border-radius: 1.75rem;
  display: grid;
  gap: 1.4rem;
  background: white;
  box-shadow: 0 10px 30px rgba(16, 46, 48, 0.05);
}

.preeval-form {
  display: grid;
  gap: 1.4rem;
}

.preeval-step {
  display: grid;
  gap: 1.1rem;
}

.preeval-step-header {
  display: grid;
  gap: 0.2rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #eef5f4;
}

.preeval-step-number {
  color: #2e726d;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.preeval-step-title {
  margin: 0;
  color: #103b39;
  font-size: 1.25rem;
  font-weight: 800;
}

.preeval-field {
  display: grid;
  gap: 0.35rem;
}

.preeval-field-label {
  color: #173b3c;
  font-size: 0.92rem;
  font-weight: 700;
}

.preeval-field-hint {
  color: #628285;
  font-size: 0.83rem;
  line-height: 1.4;
  margin-top: -0.15rem;
}

.preeval-required {
  color: #e11d48;
}

.preeval-optional {
  color: #8da4a6;
  font-weight: 500;
  font-size: 0.82rem;
}

.preeval-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 640px) {
  .preeval-grid {
    grid-template-columns: 1fr;
  }
}

.preeval-field input,
.preeval-field textarea {
  border: 1px solid #cce2df;
  border-radius: 0.9rem;
  padding: 0.75rem 0.95rem;
  font-size: 0.95rem;
  color: #173638;
  background: #fbfdfd;
  outline: none;
  transition: all 0.15s ease;
  font-family: inherit;
}

.preeval-field input:focus,
.preeval-field textarea:focus {
  border-color: #2e726d;
  background: white;
  box-shadow: 0 0 0 3px rgba(46, 114, 109, 0.14);
}

.preeval-field textarea {
  resize: vertical;
  min-height: 5.5rem;
}

.preeval-notice-box {
  display: flex;
  gap: 0.8rem;
  padding: 1rem 1.1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 1rem;
  align-items: flex-start;
}

.preeval-notice-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.preeval-notice-text {
  margin: 0;
  color: #166534;
  font-size: 0.92rem;
  line-height: 1.45;
  font-weight: 500;
}

.preeval-radio-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.25rem;
}

@media (max-width: 640px) {
  .preeval-radio-options {
    grid-template-columns: 1fr;
  }
}

.preeval-radio-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border: 1.5px solid #d4e7e4;
  border-radius: 0.9rem;
  padding: 0.85rem 1rem;
  cursor: pointer;
  background: #fbfdfd;
  transition: all 0.15s ease;
}

.preeval-radio-card:hover {
  border-color: #2e726d;
  background: #f5fbfb;
}

.preeval-radio-card-active {
  border-color: #2e726d;
  background: #eef7f6;
}

.preeval-radio-card input[type="radio"] {
  accent-color: #2e726d;
  width: 1.15rem;
  height: 1.15rem;
  margin: 0;
}

.preeval-radio-card-label {
  font-size: 0.92rem;
  font-weight: 600;
  color: #173638;
}

.preeval-alert-box {
  padding: 0.85rem 1rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 0.9rem;
  color: #92400e;
  font-size: 0.87rem;
  line-height: 1.45;
}

.preeval-alert-box p {
  margin: 0;
}

.preeval-consent-group {
  display: grid;
  gap: 0.6rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eef5f4;
}

.preeval-consent-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #103b39;
}

.preeval-flag {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.88rem;
  color: #31585b;
  line-height: 1.45;
  cursor: pointer;
}

.preeval-flag input[type="checkbox"] {
  accent-color: #2e726d;
  width: 1.15rem;
  height: 1.15rem;
  margin-top: 0.15rem;
  flex-shrink: 0;
}

.preeval-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

.preeval-primary-button {
  background: #2e726d;
  color: white;
  font-weight: 700;
  padding: 0.75rem 1.6rem;
  border-radius: 0.85rem;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  font-size: 0.95rem;
}

.preeval-primary-button:hover:not(:disabled) {
  background: #245d59;
}

.preeval-primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.preeval-secondary-button {
  background: #f1f8f7;
  color: #2e726d;
  font-weight: 700;
  padding: 0.75rem 1.4rem;
  border-radius: 0.85rem;
  border: 1px solid #d0e7e4;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.95rem;
}

.preeval-secondary-button:hover {
  background: #e2f1ef;
}

.preeval-message-error {
  margin: 0;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  padding: 0.75rem 1rem;
  border-radius: 0.85rem;
  font-size: 0.88rem;
  font-weight: 600;
}

.preeval-honeypot {
  position: absolute;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
}

/* Thank you card */
.preeval-thank-you {
  text-align: center;
  padding: 3rem 1.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.preeval-thank-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: #e6f6f4;
  color: #2e726d;
  font-size: 2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preeval-thank-title {
  margin: 0;
  color: #103b39;
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  font-weight: 800;
}

.preeval-thank-p1 {
  margin: 0;
  color: #2f5f63;
  font-size: 1.1rem;
  font-weight: 600;
}

.preeval-thank-p2 {
  margin: 0;
  color: #5c7f82;
  font-size: 1rem;
  max-width: 26rem;
  line-height: 1.5;
}

.preeval-thank-signature {
  margin-top: 1.5rem;
  padding-top: 1.2rem;
  border-top: 1px solid #e2f0ee;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.preeval-doctor-name {
  color: #103b39;
  font-size: 1.15rem;
  font-weight: 800;
}

.preeval-doctor-spec {
  color: #2e726d;
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
