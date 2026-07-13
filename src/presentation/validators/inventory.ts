import { z } from 'zod'

const nullableText = (max: number) => z.string().trim().max(max).nullable().optional()

export const inventoryItemSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(180),
  sku: z.string().trim().min(1, 'El SKU es obligatorio.').max(80),
  barcode: nullableText(120),
  description: nullableText(2000),
  unit: z.string().trim().min(1, 'La unidad base es obligatoria.').max(40),
  minimumStock: z.number().min(0).max(99999999999),
  expiryAlertDays: z.number().int().min(0).max(3650).default(30),
  isActive: z.boolean().optional().default(true),
})

export const inventoryItemUpdateSchema = inventoryItemSchema.partial()

export const inventoryListQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.enum(['all', 'healthy', 'low_stock', 'out_of_stock', 'expiring', 'expired', 'inactive']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
})

export const inventorySupplierSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(180),
  contactName: nullableText(180),
  phone: nullableText(40),
  email: z.string().trim().email('El correo no es válido.').max(255).nullable().optional().or(z.literal('')),
  notes: nullableText(2000),
  isActive: z.boolean().optional().default(true),
})

export const inventorySupplierUpdateSchema = inventorySupplierSchema.partial()

const movementBase = {
  itemId: z.string().uuid('ID de insumo inválido.'),
  quantity: z.number().positive('La cantidad debe ser mayor a cero.').max(99999999999),
  notes: nullableText(2000),
}

export const inventoryMovementSchema = z.discriminatedUnion('type', [
  z.object({
    ...movementBase,
    type: z.literal('entry'),
    lotNumber: z.string().trim().min(1, 'El lote es obligatorio.').max(120),
    expiresOn: z.string().date().nullable().optional(),
    supplierId: z.string().uuid('ID de proveedor inválido.').nullable().optional(),
    unitCost: z.number().min(0).max(99999999).nullable().optional(),
    receivedAt: z.coerce.date().optional(),
  }),
  z.object({
    ...movementBase,
    type: z.literal('consumption'),
    appointmentId: z.string().uuid('ID de cita inválido.').nullable().optional(),
    reason: nullableText(255),
  }),
  z.object({
    ...movementBase,
    type: z.enum(['adjustment_in', 'adjustment_out']),
    lotId: z.string().uuid('ID de lote inválido.'),
    reason: z.string().trim().min(1, 'El motivo es obligatorio.').max(255),
  }),
])

export const inventoryMovementListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
})
