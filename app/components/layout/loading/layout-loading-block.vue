<template>
  <span class="layout-loading-block" />
</template>

<style scoped>
.layout-loading-block {
  display: block;
  border-radius: inherit;
  background:
    linear-gradient(90deg, rgba(190, 216, 211, 0.92) 0%, rgba(244, 250, 249, 1) 48%, rgba(190, 216, 211, 0.92) 100%),
    rgba(190, 216, 211, 0.92);
  background-size: 240% 100%;
  box-shadow: inset 0 0 0 1px rgba(180, 215, 209, 0.24);
  animation: layout-loading-shimmer 1.15s ease-in-out infinite;
}

@keyframes layout-loading-shimmer {
  0% {
    background-position: 220% 0;
  }

  100% {
    background-position: -30% 0;
  }
}
</style>
