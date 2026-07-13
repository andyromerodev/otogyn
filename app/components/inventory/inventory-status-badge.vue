<script setup lang="ts">
import type { InventoryItemStatus } from '~~/src/domain/entities/inventory'
import { inventoryStatusLabels } from '~~/src/presentation/view-models/inventory/inventory-view-models'

defineProps<{ status: InventoryItemStatus }>()
</script>

<template>
  <span class="inventory-status" :class="`inventory-status-${status}`">
    <span class="inventory-status-dot" aria-hidden="true" />
    {{ inventoryStatusLabels[status] }}
  </span>
</template>

<style scoped>
.inventory-status { display:inline-flex;align-items:center;gap:.42rem;border-radius:999px;padding:.35rem .68rem;background:#e8f4f2;color:#285f5d;font-size:.78rem;font-weight:800;white-space:nowrap }
.inventory-status-dot { width:.45rem;height:.45rem;border-radius:50%;background:currentColor }
.inventory-status-low_stock,.inventory-status-expiring { background:#fff4d8;color:#9a5b08 }
.inventory-status-out_of_stock,.inventory-status-expired { background:#ffe8e8;color:#a83a3a }
.inventory-status-inactive { background:#edf1f1;color:#667879 }
</style>
