<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string
    size?: 'sm' | 'md'
  }>(),
  {
    size: 'md',
  },
)

const palette = ['#0f766e', '#b45309', '#7c3aed', '#be123c', '#1d4ed8']

const initials = computed(() => {
  const words = props.name.trim().split(/\s+/).filter(Boolean)

  if (!words.length) {
    return '?'
  }

  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? words[words.length - 1]?.[0] ?? '' : ''

  return (first + last).toUpperCase()
})

const backgroundColor = computed(() => {
  const hash = props.name
    .split('')
    .reduce((accumulator, character) => accumulator + character.codePointAt(0)!, 0)

  return palette[hash % palette.length]
})
</script>

<template>
  <span
    class="avatar-initials"
    :class="`avatar-initials-${size}`"
    :style="{ backgroundColor }"
  >
    {{ initials }}
  </span>
</template>

<style scoped>
.avatar-initials {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.avatar-initials-md {
  height: 2.75rem;
  width: 2.75rem;
  font-size: 1rem;
}

.avatar-initials-sm {
  height: 2.25rem;
  width: 2.25rem;
  font-size: 0.8rem;
}
</style>
