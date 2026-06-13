<template>
  <div class="page-grid">
    <SharedSectionHeader
      eyebrow="Reserva publica"
      title="Solicitud de cita publica"
      description="La pagina publica solo mostrara disponibilidad necesaria. Nunca expondra otros pacientes ni datos internos."
    />

    <div class="surface-card placeholder-panel booking-card">
      <p>Servicios disponibles: Consulta ORL, Audiometria, Lavado de oido, Control sinusitis, Seguimiento vertigo.</p>
      <p class="muted-text">
        El formulario real quedara conectado a disponibilidad y validaciones server-side en una siguiente iteracion.
      </p>
      <UButton color="primary" variant="solid">Solicitar cita</UButton>
    </div>
  </div>
</template>

<style scoped>
.booking-card {
  display: grid;
  gap: 1rem;
}
</style>
