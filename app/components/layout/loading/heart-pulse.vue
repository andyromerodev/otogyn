<template>
  <div class="heart-pulse" aria-hidden="true">
    <span class="heart-pulse-ring heart-pulse-ring-outer" />
    <span class="heart-pulse-ring heart-pulse-ring-inner" />

    <svg class="heart-pulse-ecg" viewBox="0 0 200 80" preserveAspectRatio="none">
      <polyline
        class="heart-pulse-ecg-line"
        points="0,40 34,40 44,20 54,62 62,10 70,40 200,40"
        fill="none"
      />
    </svg>

    <UIcon name="i-heroicons-heart-solid" class="heart-pulse-icon" />
  </div>
</template>

<style>
.heart-pulse {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
}

.heart-pulse-ring {
  position: absolute;
  border-radius: 999px;
  border: 1px solid rgba(225, 108, 128, 0.32);
}

.heart-pulse-ring-outer {
  width: 100%;
  height: 100%;
  animation: heartPulseRing 1.15s ease-out infinite;
}

.heart-pulse-ring-inner {
  width: 100%;
  height: 100%;
  animation: heartPulseRing 1.15s ease-out infinite 0.2s;
}

.heart-pulse-icon {
  position: relative;
  z-index: 1;
  width: 44%;
  height: 44%;
  color: #e2597a;
  filter: drop-shadow(0 6px 14px rgba(226, 89, 122, 0.35));
  animation: heartPulseBeat 1.15s ease-in-out infinite;
}

.heart-pulse-ecg {
  position: absolute;
  bottom: 8%;
  left: 0;
  width: 100%;
  height: 28%;
  opacity: 0.55;
}

.heart-pulse-ecg-line {
  stroke: #e2597a;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 240;
  stroke-dashoffset: 240;
  animation: heartPulseTrace 1.15s linear infinite;
}

@keyframes heartPulseBeat {
  0%,
  100% {
    transform: scale(1);
  }

  14% {
    transform: scale(1.16);
  }

  28% {
    transform: scale(0.98);
  }

  40% {
    transform: scale(1.1);
  }

  55%,
  85% {
    transform: scale(1);
  }
}

@keyframes heartPulseRing {
  0% {
    transform: scale(0.72);
    opacity: 0.55;
  }

  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}

@keyframes heartPulseTrace {
  0% {
    stroke-dashoffset: 240;
  }

  60%,
  100% {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .heart-pulse-icon,
  .heart-pulse-ring-outer,
  .heart-pulse-ring-inner,
  .heart-pulse-ecg-line {
    animation: none;
  }
}
</style>
