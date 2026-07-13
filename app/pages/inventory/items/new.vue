<script setup lang="ts">
import { useInventoryItemFormViewModel } from '../../../composables/inventory/use-inventory-item-form-view-model'
definePageMeta({ middleware: 'admin' })
const vm = useInventoryItemFormViewModel()
const submit = async () => { await vm.submit(); if (vm.savedItem.value) await navigateTo(`/inventory/items/${vm.savedItem.value.id}`) }
</script>

<template>
  <div class="inventory-form-page">
    <NuxtLink to="/inventory" class="inventory-back"><UIcon name="i-heroicons-arrow-left" /> Volver al inventario</NuxtLink>
    <header><p>Catálogo de insumos</p><h1>Nuevo insumo</h1><span>Define la unidad base y los umbrales antes de registrar el primer lote.</span></header>
    <form class="inventory-form-panel" @submit.prevent="submit">
      <div class="inventory-form-grid">
        <label><span>Nombre</span><input v-model="vm.form.name" required placeholder="Guantes de nitrilo"></label>
        <label><span>SKU interno</span><input v-model="vm.form.sku" required placeholder="INS-GUA-NIT-M"></label>
        <label><span>Código de barras opcional</span><input v-model="vm.form.barcode" placeholder="7751234567890"></label>
        <label><span>Unidad base</span><input v-model="vm.form.unit" required placeholder="unidad, par, ml o g"></label>
        <label><span>Stock mínimo</span><input v-model.number="vm.form.minimumStock" type="number" min="0" step="0.001" required></label>
        <label><span>Alertar antes de vencer</span><div class="inventory-input-suffix"><input v-model.number="vm.form.expiryAlertDays" type="number" min="0" max="3650" required><em>días</em></div></label>
      </div>
      <label><span>Descripción opcional</span><textarea v-model="vm.form.description" rows="3" placeholder="Presentación o uso administrativo del insumo." /></label>
      <p v-if="vm.errorMessage.value" class="inventory-form-error" role="alert">{{ vm.errorMessage.value }}</p>
      <div class="inventory-form-actions"><NuxtLink to="/inventory">Cancelar</NuxtLink><button type="submit" :disabled="vm.pending.value">{{ vm.pending.value ? 'Guardando insumo…' : 'Registrar insumo' }}</button></div>
    </form>
  </div>
</template>

<style scoped src="../../../assets/css/inventory-form.css"></style>
