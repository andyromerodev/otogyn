<template>
  <div class="mobile-loading" aria-hidden="true">
    <div class="mobile-body">
      <div class="loading-scene">
        <div class="loading-aura loading-aura-top" />
        <div class="loading-aura loading-aura-bottom" />

        <section class="loading-stage">
          <div class="signal-orbit">
            <span class="orbit-ring orbit-ring-outer" />
            <span class="orbit-ring orbit-ring-middle" />
            <span class="orbit-core" />
          </div>

          <div class="cards-stack">
            <article
              v-for="item in 4"
              :key="`mobile-card-${item}`"
              class="loading-card"
              :class="`loading-card-${item}`"
            >
              <div class="card-head">
                <LayoutLoadingBlock class="card-avatar" />
                <div class="card-head-copy">
                  <LayoutLoadingBlock class="line line-md" />
                  <LayoutLoadingBlock class="line line-sm" />
                </div>
                <LayoutLoadingBlock class="card-chip" />
              </div>

              <div class="card-body-lines">
                <LayoutLoadingBlock class="line line-xl" />
                <LayoutLoadingBlock class="line line-lg" />
                <LayoutLoadingBlock class="line line-md" />
              </div>
            </article>
          </div>

          <div class="loading-grid">
            <LayoutLoadingBlock
              v-for="item in 3"
              :key="`grid-${item}`"
              class="grid-pill"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style>
.mobile-loading {
  width: 100%;
  min-height: 100%;
}

.mobile-body {
  display: grid;
  align-content: center;
  min-height: 100%;
  padding: 0.35rem 0 0;
}

.loading-scene {
  position: relative;
  overflow: hidden;
  border-radius: 2rem;
  border: 1px solid rgba(175, 216, 210, 0.9);
  background:
    radial-gradient(circle at top, rgba(173, 214, 208, 0.3), transparent 34%),
    linear-gradient(180deg, rgba(247, 252, 251, 0.98), rgba(235, 244, 242, 0.96));
  box-shadow: 0 20px 44px rgba(21, 77, 71, 0.08);
}

.loading-stage {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 1.4rem;
  padding: 2rem 1rem 1.5rem;
}

.loading-aura {
  position: absolute;
  border-radius: 999px;
  filter: blur(6px);
  opacity: 0.7;
}

.loading-aura-top {
  top: -3rem;
  right: -2rem;
  width: 11rem;
  height: 11rem;
  background: radial-gradient(circle, rgba(148, 201, 194, 0.44), transparent 70%);
}

.loading-aura-bottom {
  bottom: -2rem;
  left: -3rem;
  width: 12rem;
  height: 12rem;
  background: radial-gradient(circle, rgba(190, 226, 221, 0.55), transparent 72%);
}

.signal-orbit {
  position: relative;
  display: grid;
  place-items: center;
  width: 8rem;
  height: 8rem;
}

.orbit-ring,
.orbit-core {
  position: absolute;
  border-radius: 999px;
}

.orbit-ring {
  border: 1px solid rgba(107, 167, 160, 0.22);
}

.orbit-ring-outer {
  width: 100%;
  height: 100%;
  animation: orbitPulse 1.8s ease-in-out infinite;
}

.orbit-ring-middle {
  width: 68%;
  height: 68%;
  animation: orbitPulse 1.8s ease-in-out infinite 0.2s;
}

.orbit-core {
  width: 2.6rem;
  height: 2.6rem;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.92), rgba(13, 148, 136, 0.86));
  box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.22);
  animation: orbitCorePulse 1.8s ease-in-out infinite;
}

.cards-stack {
  position: relative;
  width: 100%;
  max-width: 22rem;
  min-height: 21rem;
}

.loading-card {
  position: absolute;
  left: 50%;
  display: grid;
  gap: 0.95rem;
  width: min(100%, 20rem);
  padding: 1rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(170, 213, 207, 0.92);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 34px rgba(18, 73, 67, 0.08);
  transform-origin: center;
}

.loading-card-1 {
  top: 0;
  transform: translateX(-50%) rotate(-5deg);
  animation: floatCardOne 2.4s ease-in-out infinite;
}

.loading-card-2 {
  top: 3.3rem;
  transform: translateX(-50%) rotate(3deg);
  animation: floatCardTwo 2.4s ease-in-out infinite;
}

.loading-card-3 {
  top: 6.6rem;
  transform: translateX(-50%) rotate(-2deg);
  animation: floatCardThree 2.4s ease-in-out infinite;
}

.loading-card-4 {
  top: 9.9rem;
  transform: translateX(-50%) rotate(2deg);
  animation: floatCardFour 2.4s ease-in-out infinite;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.card-head-copy,
.card-body-lines {
  display: grid;
  gap: 0.5rem;
}

.card-head-copy {
  flex: 1 1 auto;
}

.card-avatar,
.card-chip,
.line,
.grid-pill {
  border-radius: 999px;
}

.card-avatar {
  width: 2.8rem;
  height: 2.8rem;
}

.card-chip {
  width: 3.8rem;
  height: 1.7rem;
}

.loading-grid {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  justify-content: center;
}

.grid-pill {
  width: 4.75rem;
  height: 0.65rem;
}

.line {
  height: 0.78rem;
}

.line-sm {
  width: 5.4rem;
}

.line-md {
  width: 8rem;
}

.line-lg {
  width: 12rem;
}

.line-xl {
  width: 100%;
}

@keyframes orbitPulse {
  0%,
  100% {
    transform: scale(0.96);
    opacity: 0.4;
  }

  50% {
    transform: scale(1.04);
    opacity: 0.8;
  }
}

@keyframes orbitCorePulse {
  0%,
  100% {
    transform: scale(0.96);
    box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.22);
  }

  50% {
    transform: scale(1.06);
    box-shadow: 0 0 0 14px rgba(20, 184, 166, 0);
  }
}

@keyframes floatCardOne {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) rotate(-5deg);
  }

  50% {
    transform: translateX(-50%) translateY(-0.45rem) rotate(-3deg);
  }
}

@keyframes floatCardTwo {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) rotate(3deg);
  }

  50% {
    transform: translateX(-50%) translateY(0.35rem) rotate(1deg);
  }
}

@keyframes floatCardThree {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) rotate(-2deg);
  }

  50% {
    transform: translateX(-50%) translateY(-0.3rem) rotate(0deg);
  }
}

@keyframes floatCardFour {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) rotate(2deg);
  }

  50% {
    transform: translateX(-50%) translateY(0.42rem) rotate(4deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-ring-outer,
  .orbit-ring-middle,
  .orbit-core,
  .loading-card-1,
  .loading-card-2,
  .loading-card-3,
  .loading-card-4 {
    animation: none;
  }
}
</style>
