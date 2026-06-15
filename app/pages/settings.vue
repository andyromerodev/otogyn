<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
})
</script>

<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Configuracion"
      title="Governance del MVP"
      description="Las opciones criticas del MVP ya quedan restringidas a `admin_doctor` con roles resueltos desde `organization_members`."
    />

    <div class="surface-card placeholder-panel">
      Ajustes futuros: disponibilidad, asistentes, politicas de reserva y reglas de entorno.
    </div>
  </div>
</template>
