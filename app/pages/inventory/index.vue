<script setup lang="ts">
import { useInventoryListViewModel } from '../../composables/inventory/use-inventory-list-view-model'

definePageMeta({ middleware: 'auth' })
const vm = useInventoryListViewModel()
const statusKeys = Object.keys(vm.statusLabels) as Array<keyof typeof vm.statusLabels>
</script>

<template>
  <div class="inventory-page">
    <header class="inventory-header">
      <div>
        <p class="inventory-eyebrow">Control por lotes</p>
        <h1>Inventario</h1>
        <p>Existencias útiles, vencimientos y trazabilidad del consultorio.</p>
      </div>
      <div class="inventory-actions">
        <NuxtLink v-if="vm.canManage" to="/inventory/suppliers" class="inventory-button inventory-button-quiet">Proveedores</NuxtLink>
        <NuxtLink v-if="vm.canManage" to="/inventory/items/new" class="inventory-button inventory-button-quiet">Nuevo insumo</NuxtLink>
        <NuxtLink to="/inventory/movements/new" class="inventory-button inventory-button-primary">Registrar movimiento</NuxtLink>
      </div>
    </header>

    <section v-if="vm.summary.value" class="inventory-board" aria-label="Resumen de inventario">
      <div><span>Insumos activos</span><strong>{{ vm.summary.value.activeItems }}</strong></div>
      <button type="button" @click="vm.selectStatus('low_stock')"><span>Stock bajo</span><strong>{{ vm.summary.value.lowStockItems }}</strong></button>
      <button type="button" @click="vm.selectStatus('out_of_stock')"><span>Agotados</span><strong>{{ vm.summary.value.outOfStockItems }}</strong></button>
      <button type="button" @click="vm.selectStatus('expiring')"><span>Por vencer</span><strong>{{ vm.summary.value.expiringItems }}</strong></button>
      <button type="button" @click="vm.selectStatus('expired')"><span>Lotes vencidos</span><strong>{{ vm.summary.value.expiredLots }}</strong></button>
    </section>

    <p v-if="vm.errorMessage.value" class="inventory-message" role="alert">{{ vm.errorMessage.value }}</p>

    <section class="inventory-workspace">
      <div class="inventory-toolbar">
        <label class="inventory-search">
          <UIcon name="i-heroicons-magnifying-glass" />
          <span class="sr-only">Buscar insumo</span>
          <input v-model="vm.search.value" type="search" placeholder="Buscar por nombre, SKU o código">
        </label>
        <div class="inventory-filters" aria-label="Filtrar inventario">
          <button v-for="key in statusKeys" :key="key" type="button" :class="{ active: vm.status.value === key }" @click="vm.selectStatus(key)">{{ vm.statusLabels[key] }}</button>
        </div>
      </div>

      <LayoutAppShellLoading v-if="vm.loading.value" variant="services" />
      <div v-else-if="vm.items.value.length" class="inventory-list">
        <InventoryItemRow v-for="item in vm.items.value" :key="item.id" :item="item" />
      </div>
      <div v-else class="inventory-empty">
        <span><UIcon name="i-heroicons-archive-box" /></span>
        <h2>Inventario listo para organizar</h2>
        <p>{{ vm.emptyMessage.value }}</p>
        <NuxtLink v-if="vm.canManage && !vm.search.value" to="/inventory/items/new" class="inventory-button inventory-button-primary">Registrar primer insumo</NuxtLink>
      </div>
    </section>

    <UPagination v-if="vm.totalPages.value > 1" :page="vm.page.value" :items-per-page="vm.pageSize.value" :total="vm.total.value" @update:page="vm.goToPage" />
  </div>
</template>

<style scoped>
.inventory-page { display:grid;gap:1.25rem;max-width:78rem }
.inventory-header { display:flex;align-items:flex-end;justify-content:space-between;gap:1.5rem }
.inventory-eyebrow { margin:0;color:#27746f;font-size:.78rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase }
.inventory-header h1 { margin:.25rem 0 0;color:#123436;font-size:3rem;line-height:1;font-weight:850;letter-spacing:-.055em }
.inventory-header p:last-child { max-width:58ch;margin:.65rem 0 0;color:#6e9193 }
.inventory-actions { display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.65rem }
.inventory-button { display:inline-flex;min-height:2.75rem;align-items:center;justify-content:center;border-radius:999px;padding:.7rem 1rem;font-weight:800 }
.inventory-button-primary { background:#176f6b;color:#f6fffd }
.inventory-button-quiet { border:1px solid #bcdad7;background:rgba(255,255,255,.72);color:#285f5d }
.inventory-board { display:grid;grid-template-columns:1.2fr repeat(4,1fr);overflow:hidden;border:1px solid #b9d9d5;border-radius:1.4rem;background:#173f3e;color:#ecfffb }
.inventory-board>div,.inventory-board>button { display:flex;min-height:5.1rem;align-items:center;justify-content:space-between;gap:.7rem;border:0;border-right:1px solid rgba(232,255,251,.14);padding:1rem;background:transparent;color:inherit;text-align:left }
.inventory-board>button { cursor:pointer }
.inventory-board>button:last-child { border-right:0 }
.inventory-board span { max-width:9ch;color:#acd0cb;font-size:.78rem;font-weight:700;line-height:1.2 }
.inventory-board strong { font-size:1.65rem;font-variant-numeric:tabular-nums }
.inventory-workspace { overflow:hidden;border:1px solid #bddbd8;border-radius:1.6rem;background:rgba(255,255,255,.84);box-shadow:0 16px 40px rgba(21,82,77,.07) }
.inventory-toolbar { display:grid;gap:.85rem;padding:1rem;border-bottom:1px solid #d5e8e6 }
.inventory-search { display:flex;align-items:center;gap:.65rem;border:1px solid #c6dfdc;border-radius:1rem;padding:.72rem .85rem;background:#f9fdfc;color:#59807f }
.inventory-search:focus-within { border-color:#2a8b84;box-shadow:0 0 0 3px rgba(42,139,132,.13) }
.inventory-search input { width:100%;border:0;background:transparent;color:#173b3d;outline:0 }
.inventory-filters { display:flex;gap:.45rem;overflow-x:auto;padding-bottom:.1rem }
.inventory-filters button { flex:0 0 auto;min-height:2.5rem;border:1px solid transparent;border-radius:999px;padding:.55rem .85rem;background:#edf6f4;color:#527675;font-weight:750 }
.inventory-filters button.active { background:#1b6663;color:#f5fffd }
.inventory-empty { display:grid;justify-items:start;gap:.45rem;padding:2.2rem }
.inventory-empty>span { display:grid;width:3.2rem;height:3.2rem;place-items:center;border-radius:1rem;background:#dff3ef;color:#19716c;font-size:1.45rem }
.inventory-empty h2 { margin:.45rem 0 0;color:#173b3d;font-size:1.25rem }
.inventory-empty p { max-width:56ch;margin:0 0 .6rem;color:#6d8c8e }
.inventory-message { margin:0;border-radius:1rem;padding:.9rem 1rem;background:#ffeded;color:#a72f35;font-weight:700 }
@media (max-width:900px) { .inventory-header { align-items:flex-start;flex-direction:column }.inventory-actions { justify-content:flex-start }.inventory-board { grid-template-columns:repeat(2,1fr) }.inventory-board>*:first-child { grid-column:1/-1 }.inventory-board>div,.inventory-board>button { border-right:1px solid rgba(232,255,251,.14);border-bottom:1px solid rgba(232,255,251,.14) } }
@media (max-width:640px) { .inventory-page { padding-bottom:6rem }.inventory-header h1 { font-size:2.35rem }.inventory-actions { display:grid;width:100%;grid-template-columns:1fr 1fr }.inventory-actions .inventory-button-primary { grid-column:1/-1 }.inventory-board { grid-template-columns:1fr 1fr }.inventory-board span { max-width:12ch }.inventory-workspace { border-radius:1.25rem }.inventory-empty { padding:1.3rem } }
</style>
