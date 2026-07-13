<script setup lang="ts">
import type { InventoryItemListItem } from '~~/src/domain/entities/inventory'

defineProps<{ item: InventoryItemListItem }>()

const formatQuantity = (value: number) => new Intl.NumberFormat('es-PE', { maximumFractionDigits: 3 }).format(value)
const formatDate = (value: string) => new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))
</script>

<template>
  <NuxtLink :to="`/inventory/items/${item.id}`" class="inventory-row">
    <div class="inventory-row-main">
      <span class="inventory-row-mark" aria-hidden="true">{{ item.name.slice(0, 2).toUpperCase() }}</span>
      <div class="inventory-row-copy">
        <div class="inventory-row-title-line">
          <strong>{{ item.name }}</strong>
          <InventoryStatusBadge :status="item.status" />
        </div>
        <span>{{ item.sku }} · {{ item.unit }}</span>
      </div>
    </div>
    <div class="inventory-row-stock">
      <strong>{{ formatQuantity(item.usableStock) }}</strong>
      <span>útiles · mínimo {{ formatQuantity(item.minimumStock) }}</span>
    </div>
    <div class="inventory-row-expiry">
      <span>Próximo vencimiento</span>
      <strong>{{ item.nextExpiry ? formatDate(item.nextExpiry) : 'Sin fecha' }}</strong>
    </div>
    <UIcon name="i-heroicons-chevron-right-20-solid" class="inventory-row-chevron" />
  </NuxtLink>
</template>

<style scoped>
.inventory-row { display:grid;grid-template-columns:minmax(0,1.5fr) minmax(8rem,.65fr) minmax(10rem,.65fr) auto;align-items:center;gap:1rem;min-height:5.6rem;padding:1rem 1.1rem;border-bottom:1px solid #d9ebe9;background:rgba(255,255,255,.78);transition:background 160ms ease,transform 160ms ease }
.inventory-row:last-child { border-bottom:0 }
.inventory-row:focus-visible { outline:3px solid rgba(21,128,122,.3);outline-offset:-3px }
.inventory-row-main { display:flex;align-items:center;gap:.85rem;min-width:0 }
.inventory-row-mark { display:grid;place-items:center;flex:0 0 auto;width:2.8rem;height:2.8rem;border-radius:1rem;background:#dff3ef;color:#176e69;font-weight:900;letter-spacing:.02em }
.inventory-row-copy { display:grid;gap:.25rem;min-width:0;color:#719093;font-size:.84rem }
.inventory-row-title-line { display:flex;align-items:center;gap:.55rem;min-width:0 }
.inventory-row-title-line strong { overflow:hidden;color:#183b3c;font-size:1rem;text-overflow:ellipsis;white-space:nowrap }
.inventory-row-stock,.inventory-row-expiry { display:grid;gap:.16rem }
.inventory-row-stock strong { color:#123d3a;font-size:1.25rem;font-variant-numeric:tabular-nums }
.inventory-row-stock span,.inventory-row-expiry span { color:#7b999b;font-size:.77rem }
.inventory-row-expiry strong { color:#345c5e;font-size:.86rem }
.inventory-row-chevron { color:#6b9695 }
@media (hover:hover) { .inventory-row:hover { background:#f4fbf9;transform:translateX(2px) } }
@media (max-width:760px) {
  .inventory-row { grid-template-columns:minmax(0,1fr) auto;gap:.8rem;padding:1rem }
  .inventory-row-stock { grid-column:1/2;padding-left:3.65rem }
  .inventory-row-expiry { grid-column:1/2;padding-left:3.65rem }
  .inventory-row-chevron { grid-column:2;grid-row:1/4 }
  .inventory-row-title-line { align-items:flex-start;flex-direction:column;gap:.3rem }
}
</style>
