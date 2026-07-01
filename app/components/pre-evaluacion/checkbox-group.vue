<script setup lang="ts">
interface Option {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string[]
  options: readonly Option[]
  exclusiveValue?: string
  otherValue?: string
  otherText?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'update:otherText': [value: string]
}>()

function isChecked(value: string) {
  return props.modelValue.includes(value)
}

function toggle(value: string) {
  const current = [...props.modelValue]
  const index = current.indexOf(value)

  if (index >= 0) {
    current.splice(index, 1)
    emit('update:modelValue', current)
    return
  }

  if (props.exclusiveValue && value === props.exclusiveValue) {
    emit('update:modelValue', [value])
    return
  }

  if (props.exclusiveValue) {
    const exclusiveIndex = current.indexOf(props.exclusiveValue)
    if (exclusiveIndex >= 0) {
      current.splice(exclusiveIndex, 1)
    }
  }

  current.push(value)
  emit('update:modelValue', current)
}
</script>

<template>
  <div class="preeval-checkbox-group">
    <label v-for="option in options" :key="option.value" class="preeval-checkbox-option">
      <input
        type="checkbox"
        :checked="isChecked(option.value)"
        @change="toggle(option.value)"
      >
      <span>{{ option.label }}</span>
    </label>

    <input
      v-if="otherValue && isChecked(otherValue)"
      type="text"
      class="preeval-checkbox-other-input"
      placeholder="Especifica..."
      :value="otherText"
      @input="emit('update:otherText', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>

<style scoped>
.preeval-checkbox-group {
  display: grid;
  gap: 0.6rem;
}

.preeval-checkbox-option {
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

.preeval-checkbox-option input {
  width: 1.05rem;
  height: 1.05rem;
  accent-color: #176f6d;
  flex-shrink: 0;
}

.preeval-checkbox-other-input {
  border: 1px solid #d2e8e5;
  border-radius: 1rem;
  padding: 0.8rem 1rem;
  background: white;
  color: #122f31;
  outline: none;
}

.preeval-checkbox-other-input:focus {
  border-color: #29918d;
  box-shadow: 0 0 0 4px rgba(41, 145, 141, 0.12);
}
</style>
