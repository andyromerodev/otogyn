// Estado global de conectividad. setupNetworkListeners() es idempotente y
// solo corre en cliente; llamarlo desde el shell en onMounted.
export const useNetworkStatus = () => {
  const isOnline = useState<boolean>('network-online', () => true)
  const listenersReady = useState<boolean>('network-listeners-ready', () => false)

  const setupNetworkListeners = () => {
    if (!import.meta.client || listenersReady.value) {
      return
    }

    listenersReady.value = true
    isOnline.value = navigator.onLine

    window.addEventListener('online', () => {
      isOnline.value = true
    })
    window.addEventListener('offline', () => {
      isOnline.value = false
    })
  }

  return { isOnline, setupNetworkListeners }
}
