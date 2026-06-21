<template>
  <div class="desktop-loading" aria-hidden="true">
    <div class="desktop-scene">
      <div class="desktop-aura desktop-aura-left" />
      <div class="desktop-aura desktop-aura-right" />

      <section class="desktop-stage">
        <div class="desktop-top-row">
          <div class="desktop-signal">
            <span class="orbit-ring orbit-ring-outer" />
            <span class="orbit-ring orbit-ring-middle" />
            <span class="orbit-core" />
          </div>

          <div class="desktop-inline-pills">
            <LayoutLoadingBlock
              v-for="item in 3"
              :key="`desktop-pill-${item}`"
              class="inline-pill"
            />
          </div>
        </div>

        <div class="desktop-cards-stack">
          <article
            v-for="item in 4"
            :key="`desktop-card-${item}`"
            class="desktop-card"
            :class="`desktop-card-${item}`"
          >
            <div class="desktop-card-head">
              <LayoutLoadingBlock class="card-avatar" />
              <div class="desktop-card-copy">
                <LayoutLoadingBlock class="line line-md" />
                <LayoutLoadingBlock class="line line-sm" />
              </div>
              <LayoutLoadingBlock class="card-chip" />
            </div>

            <div class="desktop-card-body">
              <LayoutLoadingBlock class="line line-xl" />
              <LayoutLoadingBlock class="line line-lg" />
              <LayoutLoadingBlock class="line line-md" />
            </div>
          </article>
        </div>

        <div class="desktop-grid">
          <article
            v-for="item in 3"
            :key="`desktop-grid-${item}`"
            class="desktop-grid-card"
          >
            <LayoutLoadingBlock class="mini-line mini-line-lg" />
            <LayoutLoadingBlock class="mini-line mini-line-md" />
            <LayoutLoadingBlock class="mini-line mini-line-sm" />
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
.desktop-loading {
  width: 100%;
  min-height: 100%;
}

.desktop-scene {
  position: relative;
  overflow: hidden;
  min-height: 42rem;
  border-radius: 2rem;
  border: 1px solid rgba(175, 216, 210, 0.9);
  background:
    radial-gradient(circle at top, rgba(173, 214, 208, 0.26), transparent 30%),
    linear-gradient(180deg, rgba(247, 252, 251, 0.98), rgba(235, 244, 242, 0.96));
  box-shadow: 0 24px 50px rgba(21, 77, 71, 0.09);
}

.desktop-stage {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 2rem;
  padding: 2rem;
}

.desktop-aura {
  position: absolute;
  border-radius: 999px;
  filter: blur(8px);
  opacity: 0.7;
}

.desktop-aura-left {
  bottom: -4rem;
  left: -3rem;
  width: 15rem;
  height: 15rem;
  background: radial-gradient(circle, rgba(187, 223, 218, 0.5), transparent 72%);
}

.desktop-aura-right {
  top: -4rem;
  right: -1rem;
  width: 14rem;
  height: 14rem;
  background: radial-gradient(circle, rgba(148, 201, 194, 0.42), transparent 70%);
}

.desktop-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.desktop-signal {
  position: relative;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 9rem;
  height: 9rem;
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
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.92), rgba(13, 148, 136, 0.86));
  box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.22);
  animation: orbitCorePulse 1.8s ease-in-out infinite;
}

.desktop-inline-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}

.inline-pill,
.card-avatar,
.card-chip,
.line,
.mini-line {
  border-radius: 999px;
}

.inline-pill {
  width: 6rem;
  height: 0.7rem;
}

.desktop-cards-stack {
  position: relative;
  min-height: 16.5rem;
}

.desktop-card {
  position: absolute;
  display: grid;
  gap: 1rem;
  width: min(30rem, calc(50% - 1rem));
  padding: 1.2rem;
  border-radius: 1.6rem;
  border: 1px solid rgba(170, 213, 207, 0.92);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 34px rgba(18, 73, 67, 0.08);
  transform-origin: center;
}

.desktop-card-1 {
  top: 0;
  left: 0;
  transform: rotate(-3deg);
  animation: desktopFloatOne 2.5s ease-in-out infinite;
}

.desktop-card-2 {
  top: 1.3rem;
  right: 0;
  transform: rotate(2.5deg);
  animation: desktopFloatTwo 2.5s ease-in-out infinite;
}

.desktop-card-3 {
  bottom: 0.6rem;
  left: 7%;
  transform: rotate(1.8deg);
  animation: desktopFloatThree 2.5s ease-in-out infinite;
}

.desktop-card-4 {
  bottom: 0;
  right: 8%;
  transform: rotate(-2deg);
  animation: desktopFloatFour 2.5s ease-in-out infinite;
}

.desktop-card-head {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.desktop-card-copy,
.desktop-card-body {
  display: grid;
  gap: 0.55rem;
}

.desktop-card-copy {
  flex: 1 1 auto;
}

.card-avatar {
  width: 3rem;
  height: 3rem;
}

.card-chip {
  width: 4rem;
  height: 1.8rem;
}

.line {
  height: 0.82rem;
}

.line-sm {
  width: 5.6rem;
}

.line-md {
  width: 9rem;
}

.line-lg {
  width: 14rem;
}

.line-xl {
  width: 100%;
}

.desktop-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.desktop-grid-card {
  display: grid;
  gap: 0.7rem;
  padding: 1.15rem;
  border-radius: 1.4rem;
  border: 1px solid rgba(194, 227, 222, 0.95);
  background: rgba(250, 253, 252, 0.94);
}

.mini-line {
  height: 0.7rem;
}

.mini-line-sm {
  width: 40%;
}

.mini-line-md {
  width: 65%;
}

.mini-line-lg {
  width: 82%;
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
    box-shadow: 0 0 0 16px rgba(20, 184, 166, 0);
  }
}

@keyframes desktopFloatOne {
  0%,
  100% {
    transform: translateY(0) rotate(-3deg);
  }

  50% {
    transform: translateY(-0.4rem) rotate(-1.5deg);
  }
}

@keyframes desktopFloatTwo {
  0%,
  100% {
    transform: translateY(0) rotate(2.5deg);
  }

  50% {
    transform: translateY(0.45rem) rotate(1deg);
  }
}

@keyframes desktopFloatThree {
  0%,
  100% {
    transform: translateY(0) rotate(1.8deg);
  }

  50% {
    transform: translateY(-0.35rem) rotate(0deg);
  }
}

@keyframes desktopFloatFour {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }

  50% {
    transform: translateY(0.38rem) rotate(-0.5deg);
  }
}

@media (max-width: 1200px) {
  .desktop-card {
    width: min(28rem, calc(50% - 0.75rem));
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-ring-outer,
  .orbit-ring-middle,
  .orbit-core,
  .desktop-card-1,
  .desktop-card-2,
  .desktop-card-3,
  .desktop-card-4 {
    animation: none;
  }
}
</style>
