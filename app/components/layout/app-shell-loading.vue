<script setup lang="ts">
import type { RouteLoadingVariant } from '~/utils/route-loading'

defineProps<{
  variant: RouteLoadingVariant
}>()
</script>

<template>
  <div class="shell-loading" aria-hidden="true">
    <div class="shell-loading-stage">
      <LayoutLoadingDesktop class="shell-loading-desktop" />
      <LayoutLoadingMobile class="shell-loading-mobile" />
    </div>
  </div>
</template>

<style scoped>
.shell-loading {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 100%;
  place-items: center;
}

.shell-loading-stage {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 100%;
  place-items: center;
}

.shell-loading-mobile {
  display: none;
}

@media (max-width: 960px) {
  .shell-loading-desktop {
    display: none;
  }

  .shell-loading-mobile {
    display: block;
  }
}
</style>
