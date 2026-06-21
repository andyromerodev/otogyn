<script setup lang="ts">
import type { RouteLoadingVariant } from '~/utils/route-loading'

defineProps<{
  variant: RouteLoadingVariant
}>()
</script>

<template>
  <div class="shell-loading" aria-hidden="true">
    <div class="shell-loading-aura shell-loading-aura-left" />
    <div class="shell-loading-aura shell-loading-aura-right" />

    <div class="shell-loading-stage">
      <LayoutLoadingDesktop class="shell-loading-desktop" />
      <LayoutLoadingMobile :variant="variant" class="shell-loading-mobile" />
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
  overflow: hidden;
  padding: 1.25rem;
  border-radius: 2rem;
  background:
    radial-gradient(circle at top right, rgba(170, 214, 205, 0.28), transparent 28rem),
    radial-gradient(circle at bottom left, rgba(159, 205, 197, 0.26), transparent 24rem),
    linear-gradient(180deg, rgba(224, 238, 235, 0.96) 0%, rgba(235, 245, 242, 0.94) 100%);
}

.shell-loading-aura {
  position: absolute;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(135, 199, 191, 0.24) 0%, rgba(135, 199, 191, 0) 72%);
  filter: blur(10px);
}

.shell-loading-aura-left {
  left: -8rem;
  bottom: -5rem;
  width: 20rem;
  height: 20rem;
}

.shell-loading-aura-right {
  top: -6rem;
  right: -6rem;
  width: 18rem;
  height: 18rem;
}

.shell-loading-stage {
  position: relative;
  z-index: 1;
  display: grid;
  width: 100%;
  min-height: 100%;
  place-items: center;
}

.shell-loading-mobile {
  display: none;
}

@media (max-width: 960px) {
  .shell-loading {
    padding: 0.75rem;
    border-radius: 1.6rem;
  }

  .shell-loading-stage {
    align-items: start;
    min-height: 100%;
    padding-top: 0.35rem;
  }

  .shell-loading-desktop {
    display: none;
  }

  .shell-loading-mobile {
    display: block;
    width: 100%;
  }
}
</style>
