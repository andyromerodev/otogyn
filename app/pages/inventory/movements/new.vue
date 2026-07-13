<script setup lang="ts">
import { useInventoryMovementViewModel } from '../../../composables/inventory/use-inventory-movement-view-model'
definePageMeta({ middleware: 'auth' })
const route = useRoute()
const itemId = typeof route.query.itemId === 'string' ? route.query.itemId : undefined
const vm = useInventoryMovementViewModel(itemId)
const movementOptions = computed(() => [
  { value: 'entry', label: 'Entrada de lote', copy: 'Compra, recepción o stock inicial.' },
  { value: 'consumption', label: 'Consumo', copy: 'Salida FEFO vinculable a una atención.' },
  ...(vm.canManage ? [
    { value: 'adjustment_in', label: 'Ajuste de entrada', copy: 'Corrección administrativa de un lote.' },
    { value: 'adjustment_out', label: 'Ajuste de salida', copy: 'Baja, merma o descarte vencido.' },
  ] : []),
])
const isAdjustment = computed(() => vm.form.type.startsWith('adjustment'))
const submit = async () => { await vm.submit(); if (vm.successMessage.value) setTimeout(() => navigateTo(`/inventory/items/${vm.form.itemId}`), 450) }
</script>

<template>
  <div class="inventory-form-page inventory-movement-page">
    <NuxtLink to="/inventory" class="inventory-back"><UIcon name="i-heroicons-arrow-left" /> Volver al inventario</NuxtLink>
    <header><p>Kardex</p><h1>Registrar movimiento</h1><span>El stock se actualizará al confirmar. Los consumos usan primero los lotes próximos a vencer.</span></header>
    <LayoutAppShellLoading v-if="vm.loading.value" variant="services" />
    <form v-else class="inventory-form-panel" @submit.prevent="submit">
      <fieldset class="movement-types">
        <legend>Tipo de movimiento</legend>
        <label v-for="option in movementOptions" :key="option.value" :class="{ selected: vm.form.type === option.value }">
          <input v-model="vm.form.type" type="radio" :value="option.value">
          <span><strong>{{ option.label }}</strong><small>{{ option.copy }}</small></span>
        </label>
      </fieldset>

      <div class="inventory-form-grid">
        <label><span>Buscar insumo</span><input v-model="vm.itemSearch.value" type="search" placeholder="Nombre o SKU"></label>
        <label><span>Insumo</span><select v-model="vm.form.itemId" required><option value="" disabled>Selecciona un insumo</option><option v-for="item in vm.filteredItems.value" :key="item.id" :value="item.id">{{ item.name }} · {{ item.sku }} · {{ item.usableStock }} {{ item.unit }}</option></select></label>
        <label><span>Cantidad</span><input v-model.number="vm.form.quantity" type="number" min="0.001" step="0.001" required></label>
      </div>

      <template v-if="vm.form.type === 'entry'">
        <div class="inventory-form-grid">
          <label><span>Número de lote</span><input v-model="vm.form.lotNumber" required placeholder="LOT-2026-014"></label>
          <label><span>Fecha de vencimiento</span><input v-model="vm.form.expiresOn" type="date"></label>
          <label><span>Proveedor</span><select v-model="vm.form.supplierId"><option value="">Sin proveedor</option><option v-for="supplier in vm.suppliers.value" :key="supplier.id" :value="supplier.id">{{ supplier.name }}</option></select></label>
          <label><span>Costo unitario (PEN)</span><input v-model.number="vm.form.unitCost" type="number" min="0" step="0.0001" placeholder="0.0000"></label>
        </div>
      </template>

      <template v-else-if="vm.form.type === 'consumption'">
        <label><span>Buscar atención</span><input v-model="vm.appointmentSearch.value" type="search" placeholder="Paciente o servicio"></label>
        <label><span>Atención o cita opcional</span><select v-model="vm.form.appointmentId"><option value="">Sin vínculo</option><option v-for="appointment in vm.appointments.value" :key="appointment.id" :value="appointment.id">{{ appointment.patientName }} · {{ appointment.serviceName }} · {{ appointment.timeLabel }}</option></select></label>
        <label><span>Motivo opcional</span><input v-model="vm.form.reason" placeholder="Uso durante consulta"></label>
        <p class="movement-note"><UIcon name="i-heroicons-arrow-path-rounded-square" /> FEFO automático: los lotes vencidos no se consumirán.</p>
      </template>

      <template v-else-if="isAdjustment">
        <label><span>Lote a ajustar</span><select v-model="vm.form.lotId" required><option value="" disabled>Selecciona un lote</option><option v-for="lot in vm.lots.value" :key="lot.id" :value="lot.id">{{ lot.lotNumber }} · disponible {{ lot.currentQuantity }}</option></select></label>
        <label><span>Motivo obligatorio</span><input v-model="vm.form.reason" required placeholder="Conteo físico, merma o descarte"></label>
      </template>

      <label><span>Notas opcionales</span><textarea v-model="vm.form.notes" rows="3" placeholder="Detalle administrativo para el historial." /></label>
      <p v-if="vm.errorMessage.value" class="inventory-form-error" role="alert">{{ vm.errorMessage.value }}</p>
      <p v-if="vm.successMessage.value" class="movement-success" role="status"><UIcon name="i-heroicons-check-circle" /> {{ vm.successMessage.value }}</p>
      <div class="inventory-form-actions"><NuxtLink to="/inventory">Cancelar</NuxtLink><button type="submit" :disabled="vm.pending.value">{{ vm.pending.value ? 'Actualizando stock…' : 'Confirmar movimiento' }}</button></div>
    </form>
  </div>
</template>

<style scoped src="../../../assets/css/inventory-form.css"></style>
<style scoped>
.inventory-movement-page { max-width:68rem }.movement-types { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem;margin:0;border:0;padding:0 }.movement-types legend { grid-column:1/-1;margin-bottom:.2rem;color:#315b5c;font-size:.87rem;font-weight:850 }.movement-types label { display:flex;align-items:flex-start;gap:.7rem;border:1px solid #c8dfdc;border-radius:1rem;padding:.85rem;background:#f9fdfc;cursor:pointer }.movement-types label.selected { border-color:#23827b;background:#e8f6f3;box-shadow:0 0 0 2px rgba(35,130,123,.1) }.movement-types input { width:1rem!important;min-height:auto!important;margin-top:.2rem;padding:0!important }.movement-types label>span { display:grid;gap:.12rem }.movement-types strong { color:#214c4d }.movement-types small { color:#6f8f91;font-weight:500;line-height:1.35 }.movement-note,.movement-success { display:flex;align-items:center;gap:.55rem;margin:0;border-radius:1rem;padding:.8rem .9rem;background:#e8f6f3;color:#22635f;font-weight:700 }.movement-success { background:#e7f8ef;color:#087658 }
@media (max-width:640px) { .movement-types { grid-template-columns:1fr } }
</style>
