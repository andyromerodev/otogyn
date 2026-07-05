<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div class="finances-index">
    <div class="finances-header">
      <h1 class="finances-title">Finanzas</h1>
      <p class="finances-subtitle">Control de ingresos y gastos de la clínica</p>
    </div>

    <div class="finances-nav-cards">
      <NuxtLink to="/finances/payments" class="finances-nav-card">
        <div class="finances-nav-card-icon finances-nav-card-icon-green">
          <UIcon name="i-heroicons-banknotes-20-solid" />
        </div>
        <div>
          <p class="finances-nav-card-title">Pagos</p>
          <p class="finances-nav-card-desc">Ingresos de pacientes</p>
        </div>
        <UIcon name="i-heroicons-chevron-right-20-solid" class="finances-nav-card-chevron" />
      </NuxtLink>

      <NuxtLink to="/finances/expenses" class="finances-nav-card">
        <div class="finances-nav-card-icon finances-nav-card-icon-rose">
          <UIcon name="i-heroicons-receipt-percent-20-solid" />
        </div>
        <div>
          <p class="finances-nav-card-title">Gastos</p>
          <p class="finances-nav-card-desc">Egresos operativos</p>
        </div>
        <UIcon name="i-heroicons-chevron-right-20-solid" class="finances-nav-card-chevron" />
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.finances-index {
  display: grid;
  gap: 1.5rem;
  max-width: 48rem;
}

.finances-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.finances-title {
  margin: 0;
  color: #132b2d;
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.05em;
}

.finances-subtitle {
  margin: 0;
  color: #7ca0a2;
  font-size: 1.15rem;
}

.finances-nav-cards {
  display: grid;
  gap: 1rem;
}

.finances-nav-card {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1.4rem 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #bfdedd;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 24px rgba(20, 82, 76, 0.06);
  color: inherit;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.finances-nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(20, 82, 76, 0.1);
}

.finances-nav-card-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 1rem;
  font-size: 1.4rem;
}

.finances-nav-card-icon-green {
  background: #d1fae5;
  color: #065f46;
}

.finances-nav-card-icon-rose {
  background: #ffe4e6;
  color: #9f1239;
}

.finances-nav-card-title {
  margin: 0;
  color: #111827;
  font-size: 1.1rem;
  font-weight: 700;
}

.finances-nav-card-desc {
  margin: 0.2rem 0 0;
  color: #7ca0a2;
  font-size: 0.92rem;
}

.finances-nav-card-chevron {
  margin-left: auto;
  color: #80a9a9;
  font-size: 1.35rem;
}
</style>
