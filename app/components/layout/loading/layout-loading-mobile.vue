<template>
  <div class="mobile-loading" aria-hidden="true">
    <div class="mobile-body">
      <div class="loading-scene">
        <div class="loading-aura loading-aura-top" />
        <div class="loading-aura loading-aura-bottom" />

        <div class="signal-orbit">
          <LayoutLoadingHeartPulse />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.mobile-loading {
  display: grid;
  width: 100%;
  min-height: 100%;
}

.mobile-body {
  display: grid;
  align-content: center;
  width: 100%;
  min-height: 100%;
}

.loading-scene {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  width: 100%;
  min-height: min(50vh, 26rem);
  border-radius: 2rem;
  border: 1px solid var(--border-color);
  background: var(--page-bg);
  box-shadow: var(--shadow-soft);
}

.loading-aura {
  position: absolute;
  border-radius: 999px;
  filter: blur(8px);
  opacity: 0.7;
}

.loading-aura-top {
  top: -3rem;
  right: -2rem;
  width: 12rem;
  height: 12rem;
  background: radial-gradient(circle, rgba(148, 201, 194, 0.44), transparent 70%);
}

.loading-aura-bottom {
  bottom: -2rem;
  left: -3rem;
  width: 13rem;
  height: 13rem;
  background: radial-gradient(circle, rgba(190, 226, 221, 0.55), transparent 72%);
}

.signal-orbit {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 10rem;
  height: 10rem;
}
</style>
