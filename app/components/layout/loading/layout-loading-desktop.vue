<template>
  <div class="desktop-loading" aria-hidden="true">
    <div class="desktop-scene">
      <div class="desktop-aura desktop-aura-left" />
      <div class="desktop-aura desktop-aura-right" />

      <div class="desktop-signal">
        <LayoutLoadingHeartPulse />
      </div>
    </div>
  </div>
</template>

<style>
.desktop-loading {
  display: grid;
  width: 100%;
  min-height: 100%;
}

.desktop-scene {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  width: 100%;
  min-height: min(60vh, 38rem);
  border-radius: 2rem;
  border: 1px solid var(--border-color);
  background: var(--page-bg);
  box-shadow: var(--shadow-soft);
}

.desktop-aura {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
  opacity: 0.7;
}

.desktop-aura-left {
  bottom: -4rem;
  left: -3rem;
  width: 18rem;
  height: 18rem;
  background: radial-gradient(circle, rgba(187, 223, 218, 0.5), transparent 72%);
}

.desktop-aura-right {
  top: -4rem;
  right: -1rem;
  width: 16rem;
  height: 16rem;
  background: radial-gradient(circle, rgba(148, 201, 194, 0.42), transparent 70%);
}

.desktop-signal {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 14rem;
  height: 14rem;
}
</style>
