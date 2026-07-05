<script setup lang="ts">
import type { ExpenseListItem } from '~~/src/domain/repositories/expense-repository'
import { formatCurrencyMXN, formatDateMX } from '~~/src/presentation/view-models/finances/expenses-list-view-model'

defineProps<{
  expense: ExpenseListItem
}>()
</script>

<template>
  <article class="expense-row">
    <div class="expense-row-main">
      <div class="expense-icon">
        <UIcon name="i-heroicons-receipt-percent-20-solid" />
      </div>

      <div class="expense-copy">
        <p class="expense-description">{{ expense.description }}</p>
        <p class="expense-meta">
          <span class="expense-category-tag">{{ expense.categoryName }}</span>
          <span>{{ formatDateMX(expense.expenseDate) }}</span>
        </p>
      </div>
    </div>

    <div class="expense-row-side">
      <span class="expense-amount">{{ formatCurrencyMXN(expense.amount) }}</span>
    </div>
  </article>
</template>

<style scoped>
.expense-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.2rem;
  transition: background-color 160ms ease;
}

.expense-row:hover {
  background: rgba(245, 251, 250, 0.88);
}

.expense-row-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.expense-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 999px;
  background: #ffe4e6;
  color: #9f1239;
  font-size: 1.35rem;
}

.expense-copy {
  min-width: 0;
}

.expense-description {
  margin: 0;
  color: #111827;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expense-meta {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0.3rem 0 0;
  color: #6f9a9d;
  font-size: 0.92rem;
}

.expense-category-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: #fce7f3;
  color: #9d174d;
  font-size: 0.8rem;
  font-weight: 700;
}

.expense-row-side {
  flex: 0 0 auto;
}

.expense-amount {
  color: #9f1239;
  font-size: 1.08rem;
  font-weight: 800;
}

@media (max-width: 640px) {
  .expense-row {
    padding: 1rem;
  }

  .expense-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.2rem;
  }
}
</style>
