const PWA_RUNTIME_CACHES = ['api-read', 'pages'] as const

// Borra los caches del service worker con datos de pacientes al cerrar sesión,
// para no dejar PHI en Cache Storage en equipos compartidos.
export async function clearPwaCaches(): Promise<void> {
  if (!import.meta.client || !('caches' in window)) {
    return
  }

  await Promise.all(PWA_RUNTIME_CACHES.map(name => caches.delete(name)))
}
