<script setup lang="ts">
import { useSessionContext } from '../../../composables/auth/use-session-context'
import { useInventoryDetailViewModel } from '../../../composables/inventory/use-inventory-detail-view-model'
import { useInventoryItemFormViewModel } from '../../../composables/inventory/use-inventory-item-form-view-model'
import { inventoryStatusLabels } from '~~/src/presentation/view-models/inventory/inventory-view-models'

definePageMeta({ middleware: 'auth' })
const id = useRoute().params.id as string
const detail = useInventoryDetailViewModel(id)
const formVm = useInventoryItemFormViewModel(id)
const { sessionContext } = useSessionContext()
const canManage = computed(() => sessionContext.value?.role === 'admin_doctor')
const formatNumber = (value: number) => new Intl.NumberFormat('es-PE', { maximumFractionDigits: 3 }).format(value)
const formatDate = (value: string | Date) => new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(typeof value === 'string' && value.length === 10 ? `${value}T12:00:00Z` : value))
const movementLabels = { entry: 'Entrada', consumption: 'Consumo', adjustment_in: 'Ajuste de entrada', adjustment_out: 'Ajuste de salida' }
</script>

<template>
  <div class="inventory-detail-page">
    <NuxtLink to="/inventory" class="inventory-back"><UIcon name="i-heroicons-arrow-left" /> Volver al inventario</NuxtLink>
    <LayoutAppShellLoading v-if="detail.loading.value" variant="services" />
    <p v-else-if="detail.errorMessage.value" class="inventory-detail-error">{{ detail.errorMessage.value }}</p>
    <template v-else-if="detail.item.value">
      <header class="inventory-detail-header">
        <div><p>{{ detail.item.value.sku }}</p><h1>{{ detail.item.value.name }}</h1><InventoryStatusBadge :status="detail.item.value.status" /></div>
        <NuxtLink :to="`/inventory/movements/new?itemId=${id}`" class="inventory-detail-action">Registrar movimiento</NuxtLink>
      </header>
      <section class="inventory-detail-strip">
        <div><span>Stock utilizable</span><strong>{{ formatNumber(detail.item.value.usableStock) }} <small>{{ detail.item.value.unit }}</small></strong></div>
        <div><span>Stock físico</span><strong>{{ formatNumber(detail.item.value.physicalStock) }}</strong></div>
        <div><span>Stock mínimo</span><strong>{{ formatNumber(detail.item.value.minimumStock) }}</strong></div>
        <div><span>Estado</span><strong>{{ inventoryStatusLabels[detail.item.value.status] }}</strong></div>
      </section>

      <div class="inventory-detail-columns">
        <section class="inventory-detail-section">
          <div class="inventory-detail-section-title"><div><p>Existencias</p><h2>Lotes</h2></div><span>{{ detail.lots.value.length }}</span></div>
          <div v-if="detail.lots.value.length" class="inventory-detail-list">
            <article v-for="lot in detail.lots.value" :key="lot.id">
              <div><strong>{{ lot.lotNumber }}</strong><span>{{ lot.supplierName ?? 'Sin proveedor' }}</span></div>
              <div><span>Disponible</span><strong>{{ formatNumber(lot.currentQuantity) }}</strong></div>
              <div><span>Vence</span><strong>{{ lot.expiresOn ? formatDate(lot.expiresOn) : 'Sin fecha' }}</strong></div>
            </article>
          </div>
          <p v-else class="inventory-detail-empty">Este insumo aún no tiene lotes. Registra una entrada para comenzar.</p>
        </section>

        <section class="inventory-detail-section">
          <div class="inventory-detail-section-title"><div><p>Trazabilidad</p><h2>Movimientos recientes</h2></div></div>
          <div v-if="detail.movements.value.length" class="inventory-movement-history">
            <article v-for="movement in detail.movements.value" :key="movement.id">
              <span :class="movement.type.includes('out') || movement.type === 'consumption' ? 'negative' : 'positive'">{{ movement.type.includes('out') || movement.type === 'consumption' ? '−' : '+' }}{{ formatNumber(movement.quantity) }}</span>
              <div><strong>{{ movementLabels[movement.type] }}</strong><small>{{ formatDate(movement.createdAt) }} · {{ movement.allocations.map(a => a.lotNumber).join(', ') }}</small></div>
            </article>
          </div>
          <p v-else class="inventory-detail-empty">No hay movimientos registrados.</p>
        </section>
      </div>

      <section v-if="canManage" class="inventory-form-panel inventory-edit-panel">
        <div class="inventory-detail-section-title"><div><p>Administración</p><h2>Datos del insumo</h2></div></div>
        <form @submit.prevent="formVm.submit">
          <div class="inventory-form-grid">
            <label><span>Nombre</span><input v-model="formVm.form.name" required></label>
            <label><span>SKU</span><input v-model="formVm.form.sku" required></label>
            <label><span>Código de barras</span><input v-model="formVm.form.barcode"></label>
            <label><span>Unidad base</span><input v-model="formVm.form.unit" required></label>
            <label><span>Stock mínimo</span><input v-model.number="formVm.form.minimumStock" type="number" min="0" step="0.001"></label>
            <label><span>Días de alerta</span><input v-model.number="formVm.form.expiryAlertDays" type="number" min="0"></label>
          </div>
          <label class="inventory-active"><input v-model="formVm.form.isActive" type="checkbox"><span>Insumo activo para nuevos movimientos</span></label>
          <p v-if="formVm.errorMessage.value" class="inventory-form-error">{{ formVm.errorMessage.value }}</p>
          <p v-if="formVm.successMessage.value" class="inventory-form-success">{{ formVm.successMessage.value }}</p>
          <div class="inventory-form-actions"><button type="submit" :disabled="formVm.pending.value">{{ formVm.pending.value ? 'Guardando…' : 'Guardar cambios' }}</button></div>
        </form>
      </section>
    </template>
  </div>
</template>

<style scoped src="../../../assets/css/inventory-form.css"></style>
<style scoped>
.inventory-detail-page { display:grid;gap:1.25rem;max-width:78rem }.inventory-detail-header { display:flex;align-items:end;justify-content:space-between;gap:1rem }.inventory-detail-header p,.inventory-detail-section-title p { margin:0;color:#347974;font-size:.76rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase }.inventory-detail-header h1 { margin:.2rem 0 .55rem;color:#15383a;font-size:2.55rem;letter-spacing:-.05em }.inventory-detail-action { border-radius:999px;padding:.8rem 1rem;background:#176f6b;color:white;font-weight:800 }.inventory-detail-strip { display:grid;grid-template-columns:repeat(4,1fr);overflow:hidden;border-radius:1.35rem;background:#173f3e;color:#effffb }.inventory-detail-strip div { display:grid;gap:.25rem;padding:1rem;border-right:1px solid rgba(255,255,255,.13) }.inventory-detail-strip span { color:#a9ceca;font-size:.78rem }.inventory-detail-strip strong { font-size:1.25rem;font-variant-numeric:tabular-nums }.inventory-detail-strip small { font-size:.78rem }.inventory-detail-columns { display:grid;grid-template-columns:1fr 1fr;gap:1rem }.inventory-detail-section { overflow:hidden;border:1px solid #c3deda;border-radius:1.45rem;background:rgba(255,255,255,.82) }.inventory-detail-section-title { display:flex;align-items:center;justify-content:space-between;padding:1rem 1.1rem }.inventory-detail-section-title h2 { margin:.15rem 0 0;color:#173b3d;font-size:1.15rem }.inventory-detail-section-title>span { display:grid;width:2.2rem;height:2.2rem;place-items:center;border-radius:50%;background:#def1ed;color:#1b6c68;font-weight:900 }.inventory-detail-list article { display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:1rem;padding:.9rem 1.1rem;border-top:1px solid #dbeae8 }.inventory-detail-list article>div { display:grid;gap:.15rem }.inventory-detail-list span,.inventory-movement-history small { color:#789496;font-size:.76rem }.inventory-detail-list strong { color:#284f50;font-size:.88rem }.inventory-movement-history article { display:flex;align-items:center;gap:.8rem;padding:.9rem 1.1rem;border-top:1px solid #dbeae8 }.inventory-movement-history article>span { min-width:4.4rem;font-weight:900;font-variant-numeric:tabular-nums }.positive { color:#08765b }.negative { color:#ad454b }.inventory-movement-history div { display:grid;gap:.15rem }.inventory-movement-history strong { color:#284f50;font-size:.88rem }.inventory-detail-empty { margin:0;padding:1rem 1.1rem;border-top:1px solid #dbeae8;color:#718f91 }.inventory-detail-error { border-radius:1rem;padding:1rem;background:#ffebeb;color:#a53238 }.inventory-edit-panel { margin-top:.25rem }.inventory-edit-panel form { display:grid;gap:1rem }.inventory-active { display:flex!important;align-items:center!important;grid-template-columns:none!important;gap:.7rem!important }.inventory-active input { width:1rem!important }.inventory-form-success { color:#08765b;font-weight:700 }
@media (max-width:800px) { .inventory-detail-columns { grid-template-columns:1fr }.inventory-detail-strip { grid-template-columns:1fr 1fr }.inventory-detail-header { align-items:flex-start;flex-direction:column }.inventory-detail-list article { grid-template-columns:1fr 1fr }.inventory-detail-list article>div:first-child { grid-column:1/-1 } }
</style>
