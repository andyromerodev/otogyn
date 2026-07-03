<script setup lang="ts">
const anamnesisText = defineModel<string>('anamnesisText', { required: true })

const props = defineProps<{
  attachmentKeys: string[]
  attachmentUrl: (key: string) => string
  uploading: boolean
  readOnly: boolean
}>()

const emit = defineEmits<{
  change: []
  uploadFiles: [files: FileList]
  removeAttachment: [key: string]
}>()

const ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf'

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    emit('uploadFiles', input.files)
  }
  input.value = ''
}

function isImage(key: string) {
  return /\.(jpg|jpeg|png|webp)$/i.test(key)
}

function fileName(key: string) {
  return key
}
</script>

<template>
  <div class="consultation-step-anamnesis">
    <label class="field field-wide">
      <span>Relato</span>
      <textarea
        v-model="anamnesisText"
        rows="10"
        placeholder="Describe el relato del paciente..."
        :disabled="props.readOnly"
        @input="emit('change')"
      />
    </label>

    <div class="field field-wide">
      <span>Archivos</span>

      <label v-if="!props.readOnly" class="consultation-upload-dropzone">
        <input
          type="file"
          :accept="ACCEPT"
          multiple
          @change="onFileInputChange"
        >
        <span>{{ props.uploading ? 'Subiendo...' : 'Toca para adjuntar imagenes o PDF (hasta 8MB cada uno)' }}</span>
      </label>

      <ul v-if="props.attachmentKeys.length > 0" class="consultation-upload-list">
        <li v-for="key in props.attachmentKeys" :key="key" class="consultation-upload-item">
          <img v-if="isImage(key)" :src="props.attachmentUrl(key)" :alt="fileName(key)" class="consultation-upload-thumb">
          <span v-else class="consultation-upload-thumb consultation-upload-thumb-file">PDF</span>

          <a :href="props.attachmentUrl(key)" target="_blank" rel="noopener" class="consultation-upload-name">
            {{ fileName(key) }}
          </a>

          <button
            v-if="!props.readOnly"
            type="button"
            class="consultation-upload-remove"
            @click="emit('removeAttachment', key)"
          >
            Quitar
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.consultation-step-anamnesis {
  display: grid;
  gap: 1.25rem;
}

.field {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
}

.field-wide {
  grid-column: 1 / -1;
}

.field textarea {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.8rem 0.95rem;
  background: rgba(255, 255, 255, 0.88);
  color: var(--text-main);
  resize: vertical;
  font-family: inherit;
}

.field textarea:disabled {
  background: rgba(15, 118, 110, 0.05);
  opacity: 0.7;
  cursor: not-allowed;
}

.consultation-upload-dropzone {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 2px dashed #a9d3cf;
  border-radius: 1.2rem;
  padding: 1.6rem 1rem;
  background: rgba(248, 252, 251, 0.96);
  color: #2e726d;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.4rem;
}

.consultation-upload-dropzone input {
  display: none;
}

.consultation-upload-list {
  display: grid;
  gap: 0.6rem;
  list-style: none;
  margin: 0.8rem 0 0;
  padding: 0;
}

.consultation-upload-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 0.6rem 0.8rem;
  background: white;
}

.consultation-upload-thumb {
  width: 3rem;
  height: 3rem;
  border-radius: 0.6rem;
  object-fit: cover;
  flex-shrink: 0;
}

.consultation-upload-thumb-file {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--teal-soft);
  color: var(--teal-strong);
  font-size: 0.7rem;
  font-weight: 800;
}

.consultation-upload-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 600;
}

.consultation-upload-remove {
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-soft);
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.82rem;
  font-weight: 700;
  flex-shrink: 0;
  cursor: pointer;
}
</style>
