<script setup lang="ts">
import type { Attachment } from '~~/src/presentation/view-models/pre-evaluacion/pre-evaluacion-screen'

defineProps<{
  attachments: Attachment[]
}>()

const emit = defineEmits<{
  addFiles: [files: FileList]
  remove: [attachment: Attachment]
}>()

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    emit('addFiles', input.files)
  }
  input.value = ''
}
</script>

<template>
  <div class="preeval-file-upload">
    <label class="preeval-file-upload-dropzone">
      <input
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        multiple
        @change="onFileInputChange"
      >
      <span>Toca para adjuntar archivos (PDF, JPG o PNG, hasta 8MB cada uno)</span>
    </label>

    <ul v-if="attachments.length > 0" class="preeval-file-upload-list">
      <li v-for="attachment in attachments" :key="attachment.fileName + (attachment.key ?? '')" class="preeval-file-upload-item">
        <div v-if="attachment.isPdf" class="preeval-file-upload-pdf-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="preeval-pdf-svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 13h6m-6 4h4" />
          </svg>
          <span class="preeval-pdf-label">PDF</span>
        </div>
        <img v-else :src="attachment.previewUrl" :alt="attachment.fileName" class="preeval-file-upload-thumb">
        <div class="preeval-file-upload-info">
          <span class="preeval-file-upload-name">{{ attachment.fileName }}</span>
          <span v-if="attachment.uploading" class="preeval-file-upload-status">Subiendo...</span>
          <span v-else-if="attachment.errorMessage" class="preeval-file-upload-status preeval-file-upload-status-error">
            {{ attachment.errorMessage }}
          </span>
          <span v-else class="preeval-file-upload-status preeval-file-upload-status-ok">Listo</span>
        </div>
        <button type="button" class="preeval-file-upload-remove" @click="emit('remove', attachment)">
          Quitar
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.preeval-file-upload {
  display: grid;
  gap: 0.8rem;
}

.preeval-file-upload-dropzone {
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
}

.preeval-file-upload-dropzone input {
  display: none;
}

.preeval-file-upload-list {
  display: grid;
  gap: 0.6rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.preeval-file-upload-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border: 1px solid #d2e8e5;
  border-radius: 1rem;
  padding: 0.6rem 0.8rem;
  background: white;
}

.preeval-file-upload-thumb {
  width: 3rem;
  height: 3rem;
  border-radius: 0.6rem;
  object-fit: cover;
  flex-shrink: 0;
}

.preeval-file-upload-pdf-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.6rem;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #dc2626;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: 0.1rem;
}

.preeval-pdf-svg {
  width: 1.25rem;
  height: 1.25rem;
}

.preeval-pdf-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  line-height: 1;
}

.preeval-file-upload-info {
  display: grid;
  gap: 0.15rem;
  flex: 1;
  min-width: 0;
}

.preeval-file-upload-name {
  color: #173638;
  font-size: 0.9rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preeval-file-upload-status {
  font-size: 0.82rem;
  color: #6d8f92;
}

.preeval-file-upload-status-ok {
  color: #047857;
}

.preeval-file-upload-status-error {
  color: #b91c1c;
}

.preeval-file-upload-remove {
  border: 1px solid #d6ebe8;
  background: white;
  color: #2f5f63;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.82rem;
  font-weight: 700;
  flex-shrink: 0;
}
</style>
