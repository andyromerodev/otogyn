import { z } from 'zod'

export const expenseSchema = z.object({
  categoryId: z.string().uuid('ID de categoría invalido.'),
  amount: z.number().positive('El monto debe ser mayor a cero.').max(99999999.99),
  description: z.string().trim().min(1, 'La descripción es obligatoria.').max(255),
  expenseDate: z.coerce.date(),
  notes: z.string().max(2000).nullable().optional(),
})

export const updateExpenseSchema = expenseSchema.partial()

export const expenseListQuerySchema = z.object({
  categoryId: z.string().uuid('ID de categoría invalido.').optional(),
  expenseDateFrom: z.coerce.date().optional(),
  expenseDateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
  search: z.string().trim().max(120).optional(),
})

export const expenseCategorySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(120),
})

export const updateExpenseCategorySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(120).optional(),
  isActive: z.boolean().optional(),
})
