<template>
  <div class="public-shell">
    <header class="public-header">
      <div class="public-header-inner">
        <div class="brand">
          <span class="brand-mark">ORL</span>
          <div>
            <p class="brand-title">OtoGyn</p>
            <p class="brand-copy">Reserva tu cita</p>
          </div>
        </div>
      </div>
    </header>
    <main class="public-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.public-shell {
  min-height: 100vh;
  background: var(--bg-base, #f8fafc);
}

.public-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: calc(1rem + env(safe-area-inset-top)) 1.5rem 1rem;
}

.public-header-inner {
  max-width: 640px;
  margin: 0 auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-mark {
  display: grid;
  height: 2.5rem;
  width: 2.5rem;
  place-items: center;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #14b8a6, #0f766e);
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
}

.brand-title {
  margin: 0;
  font-weight: 700;
  font-size: 1rem;
  color: #0f172a;
}

.brand-copy {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
}

.public-main {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
</style>
