<script setup lang="ts">
import type { PaymentListItem } from '~~/src/domain/repositories/payment-repository'
import { formatCurrency, formatDate, methodLabels } from '~~/src/presentation/view-models/finances/payments-list-view-model'

defineProps<{
  payment: PaymentListItem
}>()
</script>

<template>
  <article class="payment-row">
    <div class="payment-row-main">
      <div class="payment-icon">
        <UIcon name="i-heroicons-banknotes-20-solid" />
      </div>

      <div class="payment-copy">
        <p class="payment-concept">{{ payment.concept }}</p>
        <p class="payment-meta">
          <span v-if="payment.patientName">{{ payment.patientName }} · </span>
          {{ formatDate(payment.paidAt) }}
        </p>
      </div>
    </div>

    <div class="payment-row-side">
      <span class="payment-method">{{ methodLabels[payment.method] }}</span>
      <span class="payment-amount">{{ formatCurrency(payment.amount) }}</span>
    </div>
  </article>
</template>

<style scoped>
.payment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.2rem;
  transition: background-color 160ms ease;
}

.payment-row:hover {
  background: rgba(245, 251, 250, 0.88);
}

.payment-row-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.payment-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 999px;
  background: #d1fae5;
  color: #065f46;
  font-size: 1.35rem;
}

.payment-copy {
  min-width: 0;
}

.payment-concept {
  margin: 0;
  color: #111827;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.payment-meta {
  margin: 0.3rem 0 0;
  color: #6f9a9d;
  font-size: 0.92rem;
}

.payment-row-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex: 0 0 auto;
  gap: 0.3rem;
}

.payment-method {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.7rem;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.82rem;
  font-weight: 700;
}

.payment-amount {
  color: #065f46;
  font-size: 1.08rem;
  font-weight: 800;
}

@media (max-width: 640px) {
  .payment-row {
    padding: 1rem;
  }

  .payment-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.2rem;
  }
}
</style>
