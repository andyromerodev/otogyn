import { computed, reactive, ref, watch } from 'vue'
import type { AppointmentListResult } from '../../../application/dto/appointment-management'
import type { InventoryItemMutationInput, InventoryItemUpdateInput, InventoryMovementInput, InventoryPageInput, InventorySupplierMutationInput, InventorySupplierUpdateInput } from '../../../application/dto/inventory-management'
import type { InventoryItem, InventoryItemListItem, InventoryLot, InventorySummary, InventorySupplier, InventoryTransaction } from '../../../domain/entities/inventory'
import type { InventoryPageResult } from '../../../domain/repositories/inventory-repository'
import { normalizeApiError } from '../appointments/appointment-view-model.types'

export interface InventoryViewModelDependencies {
  listItems(input: InventoryPageInput): Promise<InventoryPageResult<InventoryItemListItem>>
  getItem(itemId: string): Promise<InventoryItemListItem>
  createItem(input: InventoryItemMutationInput): Promise<InventoryItem>
  updateItem(input: InventoryItemUpdateInput): Promise<InventoryItem>
  listLots(itemId: string): Promise<InventoryLot[]>
  listMovements(itemId: string, page?: number, pageSize?: number): Promise<InventoryPageResult<InventoryTransaction>>
  recordMovement(input: InventoryMovementInput): Promise<InventoryTransaction>
  getSummary(): Promise<InventorySummary>
  listSuppliers(input?: InventoryPageInput): Promise<InventoryPageResult<InventorySupplier>>
  createSupplier(input: InventorySupplierMutationInput): Promise<InventorySupplier>
  updateSupplier(input: InventorySupplierUpdateInput): Promise<InventorySupplier>
  listAppointments?(input: InventoryPageInput): Promise<AppointmentListResult>
}

export const inventoryStatusLabels = {
  all: 'Todos', healthy: 'Disponible', low_stock: 'Stock bajo', out_of_stock: 'Agotado', expiring: 'Por vencer', expired: 'Vencido', inactive: 'Inactivo',
} as const

export const createInventoryListViewModel = (deps: InventoryViewModelDependencies, canManage: boolean) => {
  const items = ref<InventoryItemListItem[]>([])
  const summary = ref<InventorySummary | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const search = ref('')
  const status = ref<keyof typeof inventoryStatusLabels>('all')
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const totalPages = ref(1)
  let timer: ReturnType<typeof setTimeout> | null = null

  const load = async () => {
    loading.value = true
    errorMessage.value = null
    try {
      const [result, currentSummary] = await Promise.all([
        deps.listItems({ search: search.value.trim() || undefined, status: status.value, page: page.value, pageSize: pageSize.value }),
        deps.getSummary(),
      ])
      items.value = result.items
      total.value = result.total
      page.value = result.page
      totalPages.value = result.totalPages
      summary.value = currentSummary
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudo cargar el inventario.').message
    } finally { loading.value = false }
  }
  watch(search, () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { page.value = 1; void load() }, 250)
  })
  const selectStatus = async (next: keyof typeof inventoryStatusLabels) => { status.value = next; page.value = 1; await load() }
  const goToPage = async (next: number) => { if (next >= 1 && next <= totalPages.value) { page.value = next; await load() } }
  const emptyMessage = computed(() => total.value === 0 && !search.value && status.value === 'all'
    ? 'Aún no hay insumos. Registra el primero para comenzar a controlar lotes y vencimientos.'
    : 'No hay insumos que coincidan con la búsqueda y el filtro actual.')
  return { items, summary, loading, errorMessage, search, status, page, pageSize, total, totalPages, canManage, statusLabels: inventoryStatusLabels, emptyMessage, load, selectStatus, goToPage }
}

export const createInventoryItemFormViewModel = (deps: InventoryViewModelDependencies, itemId?: string) => {
  const form = reactive({ name: '', sku: '', barcode: '', description: '', unit: 'unidad', minimumStock: 0, expiryAlertDays: 30, isActive: true })
  const loading = ref(Boolean(itemId))
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const savedItem = ref<InventoryItem | null>(null)
  const load = async () => {
    if (!itemId) return
    loading.value = true
    try {
      const item = await deps.getItem(itemId)
      Object.assign(form, { ...item, barcode: item.barcode ?? '', description: item.description ?? '' })
    } catch (error) { errorMessage.value = normalizeApiError(error, 'No se pudo cargar el insumo.').message }
    finally { loading.value = false }
  }
  const submit = async () => {
    pending.value = true; errorMessage.value = null; successMessage.value = null
    try {
      const input = { ...form, barcode: form.barcode || null, description: form.description || null }
      savedItem.value = itemId ? await deps.updateItem({ id: itemId, ...input }) : await deps.createItem(input)
      successMessage.value = itemId ? 'Cambios guardados.' : 'Insumo registrado.'
    } catch (error) { errorMessage.value = normalizeApiError(error, 'No se pudo guardar el insumo.').message }
    finally { pending.value = false }
  }
  return { form, loading, pending, errorMessage, successMessage, savedItem, load, submit }
}

export const createInventoryDetailViewModel = (deps: InventoryViewModelDependencies, itemId: string) => {
  const item = ref<InventoryItemListItem | null>(null)
  const lots = ref<InventoryLot[]>([])
  const movements = ref<InventoryTransaction[]>([])
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const load = async () => {
    loading.value = true; errorMessage.value = null
    try {
      const [detail, lotItems, history] = await Promise.all([deps.getItem(itemId), deps.listLots(itemId), deps.listMovements(itemId, 1, 20)])
      item.value = detail; lots.value = lotItems; movements.value = history.items
    } catch (error) { errorMessage.value = normalizeApiError(error, 'No se pudo cargar el detalle del insumo.').message }
    finally { loading.value = false }
  }
  return { item, lots, movements, loading, errorMessage, load }
}

export const createInventoryMovementViewModel = (deps: InventoryViewModelDependencies, canManage: boolean, initialItemId?: string) => {
  const items = ref<InventoryItemListItem[]>([])
  const suppliers = ref<InventorySupplier[]>([])
  const lots = ref<InventoryLot[]>([])
  const appointments = ref<AppointmentListResult['items']>([])
  const itemSearch = ref('')
  const appointmentSearch = ref('')
  const form = reactive({ type: 'entry' as InventoryMovementInput['type'], itemId: initialItemId ?? '', quantity: 1, notes: '', lotNumber: '', expiresOn: '', supplierId: '', unitCost: null as number | null, appointmentId: '', lotId: '', reason: '' })
  const loading = ref(false)
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  let appointmentSearchTimer: ReturnType<typeof setTimeout> | null = null

  const filteredItems = computed(() => {
    const query = itemSearch.value.trim().toLocaleLowerCase('es')
    return query
      ? items.value.filter((item) => `${item.name} ${item.sku}`.toLocaleLowerCase('es').includes(query))
      : items.value
  })
  watch(appointmentSearch, () => {
    if (!deps.listAppointments) return
    if (appointmentSearchTimer) clearTimeout(appointmentSearchTimer)
    appointmentSearchTimer = setTimeout(async () => {
      appointments.value = (await deps.listAppointments!({ search: appointmentSearch.value.trim() || undefined, pageSize: 20 })).items
    }, 250)
  })

  const loadLots = async () => { lots.value = form.itemId ? await deps.listLots(form.itemId) : [] }
  watch(() => form.itemId, () => { form.lotId = ''; void loadLots() })
  const load = async () => {
    loading.value = true
    try {
      const [itemPage, supplierPage, appointmentPage] = await Promise.all([
        deps.listItems({ status: 'all', pageSize: 50 }), deps.listSuppliers({ pageSize: 50 }), deps.listAppointments?.({ pageSize: 20 }) ?? Promise.resolve(null),
      ])
      items.value = itemPage.items.filter((item) => item.isActive)
      suppliers.value = supplierPage.items.filter((supplier) => supplier.isActive)
      appointments.value = appointmentPage?.items ?? []
      if (!form.itemId && items.value[0]) form.itemId = items.value[0].id
      await loadLots()
    } catch (error) { errorMessage.value = normalizeApiError(error, 'No se pudieron cargar las opciones del movimiento.').message }
    finally { loading.value = false }
  }
  const submit = async () => {
    pending.value = true; errorMessage.value = null; successMessage.value = null
    try {
      let input: InventoryMovementInput
      const base = { itemId: form.itemId, quantity: Number(form.quantity), notes: form.notes || null }
      if (form.type === 'entry') input = { ...base, type: 'entry', lotNumber: form.lotNumber, expiresOn: form.expiresOn || null, supplierId: form.supplierId || null, unitCost: form.unitCost }
      else if (form.type === 'consumption') input = { ...base, type: 'consumption', appointmentId: form.appointmentId || null, reason: form.reason || null }
      else input = { ...base, type: form.type, lotId: form.lotId, reason: form.reason }
      await deps.recordMovement(input)
      successMessage.value = 'Movimiento registrado y stock actualizado.'
    } catch (error) { errorMessage.value = normalizeApiError(error, 'No se pudo registrar el movimiento.').message }
    finally { pending.value = false }
  }
  return { items, filteredItems, suppliers, lots, appointments, itemSearch, appointmentSearch, form, loading, pending, errorMessage, successMessage, canManage, load, submit }
}

export const createInventorySuppliersViewModel = (deps: InventoryViewModelDependencies) => {
  const suppliers = ref<InventorySupplier[]>([])
  const loading = ref(false)
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const search = ref('')
  const form = reactive({ name: '', contactName: '', phone: '', email: '', notes: '', isActive: true })
  const load = async () => { loading.value = true; try { suppliers.value = (await deps.listSuppliers({ search: search.value, pageSize: 50 })).items } catch (error) { errorMessage.value = normalizeApiError(error, 'No se pudieron cargar los proveedores.').message } finally { loading.value = false } }
  const submit = async () => { pending.value = true; errorMessage.value = null; try { await deps.createSupplier({ ...form, contactName: form.contactName || null, phone: form.phone || null, email: form.email || null, notes: form.notes || null }); Object.assign(form, { name: '', contactName: '', phone: '', email: '', notes: '', isActive: true }); successMessage.value = 'Proveedor registrado.'; await load() } catch (error) { errorMessage.value = normalizeApiError(error, 'No se pudo registrar el proveedor.').message } finally { pending.value = false } }
  const toggle = async (supplier: InventorySupplier) => { await deps.updateSupplier({ id: supplier.id, isActive: !supplier.isActive }); await load() }
  return { suppliers, loading, pending, errorMessage, successMessage, search, form, load, submit, toggle }
}
