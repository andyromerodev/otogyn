<script setup lang="ts">
interface Option {
  value: string
  label: string
}

defineProps<{
  modelValue: string | null
  options: readonly Option[]
  name: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="preeval-radio-group">
    <label v-for="option in options" :key="option.value" class="preeval-radio-option">
      <input
        type="radio"
        :name="name"
        :value="option.value"
        :checked="modelValue === option.value"
        @change="emit('update:modelValue', option.value)"
      >
      <span>{{ option.label }}</span>
    </label>
  </div>
</template>

<style scoped>
.preeval-radio-group {
  display: grid;
  gap: 0.6rem;
}

.preeval-radio-option {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid #d2e8e5;
  border-radius: 1rem;
  padding: 0.8rem 1rem;
  background: rgba(248, 252, 251, 0.96);
  color: #173638;
  font-size: 0.95rem;
}

.preeval-radio-option input {
  width: 1.05rem;
  height: 1.05rem;
  accent-color: #176f6d;
  flex-shrink: 0;
}
</style>
