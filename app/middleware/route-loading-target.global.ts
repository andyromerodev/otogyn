export default defineNuxtRouteMiddleware((to, from) => {
  if (!import.meta.client || to.path === from.path) {
    return
  }

  const routeLoadingTarget = useState<string>('route-loading-target', () => to.path)
  routeLoadingTarget.value = to.path
})
