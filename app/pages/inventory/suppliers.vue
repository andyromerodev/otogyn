<script setup lang="ts">
import { useInventorySuppliersViewModel } from '../../composables/inventory/use-inventory-suppliers-view-model'
definePageMeta({ middleware: 'admin' })
const vm = useInventorySuppliersViewModel()
</script>

<template>
  <div class="inventory-suppliers-page">
    <NuxtLink to="/inventory" class="inventory-back"><UIcon name="i-heroicons-arrow-left" /> Volver al inventario</NuxtLink>
    <header><div><p>Abastecimiento</p><h1>Proveedores</h1><span>Directorio operativo independiente de Finanzas.</span></div></header>
    <div class="inventory-suppliers-layout">
      <form class="inventory-form-panel" @submit.prevent="vm.submit">
        <h2>Nuevo proveedor</h2>
        <label><span>Nombre</span><input v-model="vm.form.name" required placeholder="Distribuidora médica"></label>
        <div class="inventory-form-grid"><label><span>Contacto</span><input v-model="vm.form.contactName"></label><label><span>Teléfono</span><input v-model="vm.form.phone" type="tel"></label></div>
        <label><span>Correo</span><input v-model="vm.form.email" type="email"></label>
        <label><span>Notas</span><textarea v-model="vm.form.notes" rows="3" /></label>
        <p v-if="vm.errorMessage.value" class="inventory-form-error">{{ vm.errorMessage.value }}</p>
        <p v-if="vm.successMessage.value" class="supplier-success">{{ vm.successMessage.value }}</p>
        <div class="inventory-form-actions"><button type="submit" :disabled="vm.pending.value">{{ vm.pending.value ? 'Guardando…' : 'Registrar proveedor' }}</button></div>
      </form>
      <section class="supplier-directory">
        <label class="supplier-search"><UIcon name="i-heroicons-magnifying-glass" /><input v-model="vm.search.value" type="search" placeholder="Buscar proveedor" @change="vm.load"></label>
        <LayoutAppShellLoading v-if="vm.loading.value" variant="services" />
        <div v-else-if="vm.suppliers.value.length">
          <article v-for="supplier in vm.suppliers.value" :key="supplier.id">
            <span class="supplier-mark">{{ supplier.name.slice(0, 2).toUpperCase() }}</span>
            <div><strong>{{ supplier.name }}</strong><small>{{ supplier.contactName || supplier.email || supplier.phone || 'Sin datos de contacto' }}</small></div>
            <button type="button" @click="vm.toggle(supplier)">{{ supplier.isActive ? 'Desactivar' : 'Reactivar' }}</button>
          </article>
        </div>
        <p v-else class="supplier-empty">Aún no hay proveedores registrados.</p>
      </section>
    </div>
  </div>
</template>

<style scoped src="../../assets/css/inventory-form.css"></style>
<style scoped>
.inventory-suppliers-page { display:grid;gap:1.2rem;max-width:78rem }.inventory-suppliers-page header p { margin:0;color:#347974;font-size:.78rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase }.inventory-suppliers-page header h1 { margin:.25rem 0;color:#15383a;font-size:2.65rem;letter-spacing:-.05em }.inventory-suppliers-page header span { color:#718f91 }.inventory-suppliers-layout { display:grid;grid-template-columns:minmax(20rem,.75fr) minmax(0,1.25fr);gap:1rem;align-items:start }.inventory-form-panel h2 { margin:0;color:#173b3d;font-size:1.15rem }.supplier-success { color:#08765b;font-weight:700 }.supplier-directory { overflow:hidden;border:1px solid #bedbd8;border-radius:1.55rem;background:rgba(255,255,255,.86) }.supplier-search { display:flex;align-items:center;gap:.6rem;padding:.85rem 1rem;border-bottom:1px solid #d7e9e7;color:#648685 }.supplier-search input { width:100%;border:0;background:transparent;outline:0 }.supplier-directory article { display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:.8rem;padding:1rem;border-bottom:1px solid #dbeae8 }.supplier-directory article:last-child { border-bottom:0 }.supplier-mark { display:grid;width:2.7rem;height:2.7rem;place-items:center;border-radius:.9rem;background:#dff3ef;color:#176e69;font-weight:900 }.supplier-directory article div { display:grid;gap:.18rem }.supplier-directory strong { color:#214a4b }.supplier-directory small { color:#728f91 }.supplier-directory button { min-height:2.6rem;border:1px solid #c6ddda;border-radius:999px;padding:.5rem .75rem;background:transparent;color:#436c6c;font-weight:750 }.supplier-empty { margin:0;padding:1rem;color:#728f91 }
@media (max-width:800px) { .inventory-suppliers-layout { grid-template-columns:1fr } }
</style>
