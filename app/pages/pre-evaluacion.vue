<script setup lang="ts">
import CheckboxGroup from '../components/pre-evaluacion/checkbox-group.vue'
import FileUploadField from '../components/pre-evaluacion/file-upload-field.vue'
import RadioGroup from '../components/pre-evaluacion/radio-group.vue'
import StepProgress from '../components/pre-evaluacion/step-progress.vue'
import { usePreEvaluacionScreen } from '../composables/pre-evaluacion/use-pre-evaluacion-screen'
import {
  preEvalAggravatingFactors,
  preEvalAlertSigns,
  preEvalAssociatedSymptoms,
  preEvalConsultationExpectations,
  preEvalImprovementOptions,
  preEvalMainReasons,
  preEvalPriorExams,
  preEvalSymptomDurationOptions,
  preEvalSymptomPatternOptions,
  preEvalYesNoOptions,
} from '../../src/domain/value-objects/pre-evaluation-form-options'
import { STEP_LABELS, TOTAL_STEPS } from '../../src/presentation/view-models/pre-evaluacion/pre-evaluacion-screen'

definePageMeta({ layout: 'public' })

const screen = usePreEvaluacionScreen()
</script>

<template>
  <div class="preeval-page">
    <div v-if="!screen.submissionId.value" class="preeval-header">
      <p class="preeval-eyebrow">Consulta de reflujo y molestias de garganta</p>
      <h1 class="preeval-title">Formulario de pre-evaluación</h1>
      <p class="preeval-copy">
        Complete este formulario antes de programar su consulta. La información será revisada
        para determinar la mejor forma de atención.
      </p>
    </div>

    <article v-if="!screen.submissionId.value" class="surface-card preeval-card">
      <StepProgress :current-step="screen.step.value" :total-steps="TOTAL_STEPS" :step-labels="STEP_LABELS" />

      <form class="preeval-form" @submit.prevent>
        <!-- Paso 1: Datos generales -->
        <section v-if="screen.step.value === 1" class="preeval-step">
          <h2 class="preeval-step-title">Datos generales</h2>

          <label class="preeval-field">
            <span>Nombre completo</span>
            <input v-model="screen.form.fullName" type="text" placeholder="María Torres" required>
          </label>

          <div class="preeval-grid">
            <label class="preeval-field">
              <span>Edad</span>
              <input v-model="screen.form.age" type="number" min="0" max="120" placeholder="35">
            </label>

            <label class="preeval-field">
              <span>Ciudad donde reside</span>
              <input v-model="screen.form.city" type="text" placeholder="Lima">
            </label>
          </div>

          <div class="preeval-grid">
            <label class="preeval-field">
              <span>Teléfono de contacto</span>
              <input v-model="screen.form.phone" type="text" placeholder="999888777" required>
            </label>

            <label class="preeval-field">
              <span>Correo electrónico</span>
              <input v-model="screen.form.email" type="email" placeholder="maria@example.com">
            </label>
          </div>
        </section>

        <!-- Paso 2: Motivo de consulta -->
        <section v-if="screen.step.value === 2" class="preeval-step">
          <h2 class="preeval-step-title">Motivo de consulta</h2>
          <p class="preeval-step-subtitle">¿Cuál es el principal motivo de su consulta?</p>

          <CheckboxGroup
            v-model="screen.form.mainReasons"
            :options="preEvalMainReasons"
            other-value="otro"
            :other-text="screen.form.mainReasonOtherText"
            @update:other-text="screen.form.mainReasonOtherText = $event"
          />

          <label class="preeval-field">
            <span>Describa brevemente su molestia principal</span>
            <textarea v-model="screen.form.complaintDescription" rows="4" />
          </label>
        </section>

        <!-- Paso 3: Evolución -->
        <section v-if="screen.step.value === 3" class="preeval-step">
          <h2 class="preeval-step-title">Evolución</h2>

          <div class="preeval-field">
            <span>¿Desde cuándo presenta los síntomas?</span>
            <RadioGroup
              name="symptomDuration"
              :model-value="screen.form.symptomDuration"
              :options="preEvalSymptomDurationOptions"
              @update:model-value="screen.form.symptomDuration = $event as typeof screen.form.symptomDuration"
            />
          </div>

          <div class="preeval-field">
            <span>¿Los síntomas son?</span>
            <RadioGroup
              name="symptomPattern"
              :model-value="screen.form.symptomPattern"
              :options="preEvalSymptomPatternOptions"
              @update:model-value="screen.form.symptomPattern = $event as typeof screen.form.symptomPattern"
            />
          </div>
        </section>

        <!-- Paso 4: Síntomas asociados y factores -->
        <section v-if="screen.step.value === 4" class="preeval-step">
          <h2 class="preeval-step-title">Síntomas asociados</h2>
          <p class="preeval-step-subtitle">Marque los que presenta</p>
          <CheckboxGroup
            v-model="screen.form.associatedSymptoms"
            :options="preEvalAssociatedSymptoms"
            exclusive-value="ninguno"
          />

          <h2 class="preeval-step-title">Factores que pueden empeorar el reflujo</h2>
          <p class="preeval-step-subtitle">¿Consume habitualmente?</p>
          <CheckboxGroup
            v-model="screen.form.aggravatingFactors"
            :options="preEvalAggravatingFactors"
            exclusive-value="ninguno"
          />
        </section>

        <!-- Paso 5: Antecedentes -->
        <section v-if="screen.step.value === 5" class="preeval-step">
          <h2 class="preeval-step-title">Antecedentes</h2>

          <div class="preeval-field">
            <span>¿Tiene diagnóstico previo de reflujo gastroesofágico?</span>
            <RadioGroup
              name="hasPriorRefluxDiagnosis"
              :model-value="screen.form.hasPriorRefluxDiagnosis"
              :options="preEvalYesNoOptions"
              @update:model-value="screen.form.hasPriorRefluxDiagnosis = $event as typeof screen.form.hasPriorRefluxDiagnosis"
            />
          </div>

          <div class="preeval-field">
            <span>¿Ha recibido tratamiento para reflujo anteriormente?</span>
            <RadioGroup
              name="hasPriorTreatment"
              :model-value="screen.form.hasPriorTreatment"
              :options="preEvalYesNoOptions"
              @update:model-value="screen.form.hasPriorTreatment = $event as typeof screen.form.hasPriorTreatment"
            />
          </div>

          <template v-if="screen.form.hasPriorTreatment === 'yes'">
            <label class="preeval-field">
              <span>¿Qué medicamento utilizó?</span>
              <input v-model="screen.form.priorMedicationUsed" type="text">
            </label>

            <div class="preeval-field">
              <span>¿Mejoró con el tratamiento?</span>
              <RadioGroup
                name="treatmentImprovement"
                :model-value="screen.form.treatmentImprovement"
                :options="preEvalImprovementOptions"
                @update:model-value="screen.form.treatmentImprovement = $event as typeof screen.form.treatmentImprovement"
              />
            </div>
          </template>
        </section>

        <!-- Paso 6: Exámenes previos -->
        <section v-if="screen.step.value === 6" class="preeval-step">
          <h2 class="preeval-step-title">Exámenes previos</h2>
          <p class="preeval-step-subtitle">¿Cuenta con alguno de los siguientes estudios?</p>
          <CheckboxGroup v-model="screen.form.priorExams" :options="preEvalPriorExams" exclusive-value="ninguno" />

          <div class="preeval-field">
            <span>Adjunte los informes disponibles</span>
            <FileUploadField
              :attachments="screen.attachments.value"
              @add-files="screen.addFiles"
              @remove="screen.removeAttachment"
            />
          </div>
        </section>

        <!-- Paso 7: Signos de alerta, expectativa y consentimiento -->
        <section v-if="screen.step.value === 7" class="preeval-step">
          <h2 class="preeval-step-title">Signos de alerta</h2>
          <p class="preeval-step-subtitle">¿Presenta alguno de los siguientes?</p>
          <CheckboxGroup v-model="screen.form.alertSigns" :options="preEvalAlertSigns" exclusive-value="ninguno" />

          <h2 class="preeval-step-title">Expectativa de la consulta</h2>
          <p class="preeval-step-subtitle">¿Qué espera obtener de esta consulta?</p>
          <CheckboxGroup v-model="screen.form.consultationExpectations" :options="preEvalConsultationExpectations" />

          <h2 class="preeval-step-title">Consentimiento</h2>

          <label class="preeval-flag">
            <input v-model="screen.form.consentInfoTruthful" type="checkbox">
            <span>Declaro que la información proporcionada es verdadera.</span>
          </label>

          <label class="preeval-flag">
            <input v-model="screen.form.consentUnderstandsNotConsultation" type="checkbox">
            <span>
              Entiendo que este formulario no constituye una consulta médica y será revisado
              previamente para determinar el tipo de atención más adecuado.
            </span>
          </label>
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
                || !screen.form.consentInfoTruthful
                || !screen.form.consentUnderstandsNotConsultation
            "
            @click="screen.submitForm"
          >
            {{ screen.pending.value ? 'Enviando...' : 'Enviar formulario' }}
          </button>
        </div>
      </form>
    </article>

    <article v-else class="surface-card preeval-card preeval-thank-you">
      <h1 class="preeval-title">Gracias por completar el formulario.</h1>
      <p class="preeval-copy">
        La Dra. Eris revisará la información enviada. Una vez evaluado su caso, nos comunicaremos
        con usted para coordinar la consulta virtual por Zoom o, de ser necesario, recomendar una
        evaluación presencial.
      </p>
    </article>
  </div>
</template>

<style scoped>
.preeval-page {
  display: grid;
  gap: 1.1rem;
}

.preeval-header {
  display: grid;
  gap: 0.45rem;
}

.preeval-eyebrow {
  margin: 0;
  color: #2e726d;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.preeval-title {
  margin: 0;
  color: #102e30;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.preeval-copy {
  margin: 0;
  color: #789ca0;
  font-size: 1rem;
}

.preeval-card {
  padding: 1.4rem;
  border-radius: 2rem;
  display: grid;
  gap: 1.2rem;
}

.preeval-form {
  display: grid;
  gap: 1.2rem;
}

.preeval-step {
  display: grid;
  gap: 0.9rem;
}

.preeval-step-title {
  margin: 0;
  color: #103b39;
  font-size: 1.15rem;
  font-weight: 800;
}

.preeval-step-subtitle {
  margin: -0.5rem 0 0;
  color: #6d8f92;
  font-size: 0.92rem;
}

.preeval-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.preeval-field {
  display: grid;
  gap: 0.45rem;
}

.preeval-field > span {
  color: #30565a;
  font-size: 0.95rem;
  font-weight: 700;
}

.preeval-field input[type='text'],
.preeval-field input[type='number'],
.preeval-field input[type='email'],
.preeval-field textarea {
  width: 100%;
  border: 1px solid #d2e8e5;
  border-radius: 1.2rem;
  padding: 0.95rem 1rem;
  background: rgba(248, 252, 251, 0.96);
  color: #122f31;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.preeval-field input:focus,
.preeval-field textarea:focus {
  border-color: #29918d;
  box-shadow: 0 0 0 4px rgba(41, 145, 141, 0.12);
}

.preeval-flag {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  border: 1px solid #d2e8e5;
  border-radius: 1.2rem;
  padding: 1rem;
  background: rgba(248, 252, 251, 0.96);
}

.preeval-flag input {
  margin-top: 0.2rem;
  width: 1.05rem;
  height: 1.05rem;
  accent-color: #176f6d;
  flex-shrink: 0;
}

.preeval-flag span {
  color: #173638;
  font-size: 0.92rem;
}

.preeval-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding-top: 0.4rem;
}

.preeval-primary-button,
.preeval-secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.95rem 1.35rem;
  font-weight: 700;
}

.preeval-primary-button {
  border: 0;
  background: #176f6d;
  color: white;
}

.preeval-primary-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.preeval-secondary-button {
  border: 1px solid #d6ebe8;
  background: white;
  color: #2f5f63;
}

.preeval-message {
  margin: 0;
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  font-weight: 600;
}

.preeval-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

.preeval-thank-you {
  display: grid;
  gap: 0.8rem;
  text-align: center;
}

@media (max-width: 720px) {
  .preeval-grid {
    grid-template-columns: 1fr;
  }

  .preeval-actions {
    flex-direction: column-reverse;
  }

  .preeval-primary-button,
  .preeval-secondary-button {
    width: 100%;
  }
}
</style>
