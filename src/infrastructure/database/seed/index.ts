/**
 * Seed script — inserts demo data into the connected DATABASE_URL.
 *
 * Usage:
 *   pnpm db:seed                 # inserts if org has <50 patients
 *   pnpm db:seed -- --reset      # deletes all demo-org data first, then inserts
 *
 * SAFETY: only touches rows whose organizationId === DEMO_ORG_SLUG (see below).
 * Never modifies users, organizations, or organization_members tables.
 * Idempotency guard: aborts (without --reset) when the demo org already has ≥50 patients.
 */

import 'dotenv/config'
import { faker } from '@faker-js/faker'
import { and, count, eq, inArray } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {
  appointments,
  appointmentStatusHistory,
  blockedTimeSlots,
  consultations,
  doctorAvailability,
  expenseCategories,
  expenses,
  inventoryItems,
  inventoryLots,
  inventorySuppliers,
  inventoryTransactionAllocations,
  inventoryTransactions,
  organizationMembers,
  organizations,
  patients,
  payments,
  preEvaluationForms,
  services,
  users,
} from '../schema'

// ─── Config ──────────────────────────────────────────────────────────────────

faker.seed(42)

// Org slug: --org-slug=<slug> arg > SEED_ORG_SLUG env var > first org in DB
const argSlug = process.argv.find((a) => a.startsWith('--org-slug='))?.split('=')[1]
const ORG_SLUG: string | undefined = argSlug ?? process.env.SEED_ORG_SLUG
const ABORT_THRESHOLD = 50 // don't insert if org already has this many patients (without --reset)
const RESET = process.argv.includes('--reset')

// ─── DB ──────────────────────────────────────────────────────────────────────

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
// max:1 ensures all queries share the same connection so FK checks see prior inserts
const conn = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 })
const db = drizzle(conn)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86_400_000)
}

/** Returns a random working-hour start time on the given date (Lima TZ, 09:00–17:00). */
function randomWorkSlot(date: Date, durationMinutes: number): { startAt: Date; endAt: Date } {
  // Build a Lima-midnight for the date then add hours
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  // Lima is UTC-5 always (no DST)
  const maxStartHour = 17 - Math.ceil(durationMinutes / 60)
  const hour = faker.number.int({ min: 9, max: Math.max(9, maxStartHour) })
  const minute = faker.helpers.arrayElement([0, 15, 30, 45])

  const isoStr = `${year}-${month}-${day}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00-05:00`
  const startAt = new Date(isoStr)
  return { startAt, endAt: addMinutes(startAt, durationMinutes) }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function randomPastDate(daysBack: number) {
  return addDays(new Date(), -faker.number.int({ min: 1, max: daysBack }))
}

function randomFutureDate(daysAhead: number) {
  return addDays(new Date(), faker.number.int({ min: 1, max: daysAhead }))
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  OtoGyn seed starting…')

  // 1. Resolve target org
  let org
  if (ORG_SLUG) {
    ;[org] = await db.select().from(organizations).where(eq(organizations.slug, ORG_SLUG)).limit(1)
    if (!org) {
      console.error(`❌  Organization with slug "${ORG_SLUG}" not found.`)
      process.exit(1)
    }
  } else {
    // Fallback: first org in DB
    ;[org] = await db.select().from(organizations).limit(1)
    if (!org) {
      console.error('❌  No organizations found in the database.')
      process.exit(1)
    }
    console.log(`ℹ️   No --org-slug provided; using first org found: "${org.slug}"`)
  }

  const orgId = org.id
  console.log(`✅  Found org: ${org.name} (${orgId})`)

  // 2. Resolve a member user (createdBy FK)
  const [member] = await db
    .select({ userId: organizationMembers.userId })
    .from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.isActive, true)))
    .limit(1)

  if (!member) {
    console.error('❌  No active member found in the demo org.')
    process.exit(1)
  }

  const [creatorUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, member.userId))
    .limit(1)

  if (!creatorUser) {
    console.error('❌  Creator user not found.')
    process.exit(1)
  }

  const createdBy = creatorUser.id
  console.log(`✅  Using creator: ${creatorUser.email}`)

  // 3. Idempotency guard
  const [{ value: patientCount }] = await db
    .select({ value: count() })
    .from(patients)
    .where(eq(patients.organizationId, orgId))

  if (Number(patientCount) >= ABORT_THRESHOLD && !RESET) {
    console.log(`ℹ️  Demo org already has ${patientCount} patients. Run with --reset to clear and re-seed.`)
    process.exit(0)
  }

  // 4. --reset: delete in reverse FK order
  if (RESET) {
    console.log('🗑️   Resetting demo org data…')

    // appointmentStatusHistory → payments → consultations → appointments
    // preEvaluationForms → expenses → blockedTimeSlots → doctorAvailability → services → patients
    const apptIds = (
      await db.select({ id: appointments.id }).from(appointments).where(eq(appointments.organizationId, orgId))
    ).map((r) => r.id)

    if (apptIds.length) {
      await db.delete(appointmentStatusHistory).where(inArray(appointmentStatusHistory.appointmentId, apptIds))
      await db.delete(payments).where(inArray(payments.appointmentId, apptIds))
      await db.delete(consultations).where(inArray(consultations.appointmentId, apptIds))
    }

    await db.delete(appointments).where(eq(appointments.organizationId, orgId))
    const inventoryTransactionIds = (await db.select({ id: inventoryTransactions.id }).from(inventoryTransactions).where(eq(inventoryTransactions.organizationId, orgId))).map((row) => row.id)
    if (inventoryTransactionIds.length) {
      await db.delete(inventoryTransactionAllocations).where(inArray(inventoryTransactionAllocations.transactionId, inventoryTransactionIds))
    }
    await db.delete(inventoryTransactions).where(eq(inventoryTransactions.organizationId, orgId))
    await db.delete(inventoryLots).where(eq(inventoryLots.organizationId, orgId))
    await db.delete(inventorySuppliers).where(eq(inventorySuppliers.organizationId, orgId))
    await db.delete(inventoryItems).where(eq(inventoryItems.organizationId, orgId))
    await db.delete(preEvaluationForms).where(eq(preEvaluationForms.organizationId, orgId))
    await db.delete(expenses).where(eq(expenses.organizationId, orgId))
    await db.delete(blockedTimeSlots).where(eq(blockedTimeSlots.organizationId, orgId))
    await db.delete(doctorAvailability).where(eq(doctorAvailability.organizationId, orgId))
    await db.delete(services).where(eq(services.organizationId, orgId))
    await db.delete(patients).where(eq(patients.organizationId, orgId))

    console.log('✅  Demo org data cleared.')
  }

  // ─── 5. Services ────────────────────────────────────────────────────────────

  const serviceData = [
    { name: 'Consulta general de gastroenterología', durationMinutes: 45, price: '120.00' },
    { name: 'Evaluación de reflujo gastroesofágico', durationMinutes: 60, price: '150.00' },
    { name: 'Seguimiento de tratamiento', durationMinutes: 30, price: '80.00' },
    { name: 'Endoscopía diagnóstica (valoración)', durationMinutes: 30, price: '100.00' },
    { name: 'Consulta de nutrición clínica', durationMinutes: 45, price: '90.00' },
    { name: 'Evaluación de dispepsia funcional', durationMinutes: 45, price: '130.00' },
    { name: 'Control post-procedimiento', durationMinutes: 20, price: '60.00' },
    { name: 'Evaluación de síndrome de intestino irritable', durationMinutes: 50, price: '140.00' },
    { name: 'Teleorientación gastrointestinal', durationMinutes: 25, price: '50.00' },
    { name: 'Evaluación pediátrica gastroenterológica', durationMinutes: 40, price: '110.00' },
    { name: 'Consulta de motilidad esofágica', durationMinutes: 60, price: '160.00' },
    { name: 'Control de úlcera péptica', durationMinutes: 30, price: '85.00' },
  ]

  const now = new Date()
  const serviceRows = await db
    .insert(services)
    .values(
      serviceData.map((s) => ({
        id: crypto.randomUUID(),
        organizationId: orgId,
        name: s.name,
        description: faker.lorem.sentence({ min: 8, max: 16 }),
        defaultDurationMinutes: s.durationMinutes,
        price: s.price,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .returning()

  console.log(`✅  Inserted ${serviceRows.length} services.`)

  // ─── 6. Doctor availability ──────────────────────────────────────────────────

  const availabilityRows = [1, 2, 3, 4, 5].flatMap((weekday) => [
    {
      id: crypto.randomUUID(),
      organizationId: orgId,
      weekday,
      startTime: '08:00',
      endTime: '13:00',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      organizationId: orgId,
      weekday,
      startTime: '15:00',
      endTime: '19:00',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ])

  await db.insert(doctorAvailability).values(availabilityRows)
  console.log(`✅  Inserted ${availabilityRows.length} availability slots.`)

  // ─── 7. Blocked time slots ───────────────────────────────────────────────────

  const blockedReasons = ['Almuerzo', 'Reunión médica', 'Congreso', 'Feriado nacional', 'Descanso', null]
  const blockedRows = []

  for (let i = 0; i < 15; i++) {
    const isPast = i < 8
    const date = isPast ? randomPastDate(90) : randomFutureDate(60)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const startHour = faker.number.int({ min: 12, max: 14 })
    const startsAt = new Date(`${year}-${month}-${day}T${String(startHour).padStart(2, '0')}:00:00-05:00`)
    const endsAt = addMinutes(startsAt, faker.helpers.arrayElement([30, 60, 90, 120]))

    blockedRows.push({
      id: crypto.randomUUID(),
      organizationId: orgId,
      startsAt,
      endsAt,
      reason: faker.helpers.arrayElement(blockedReasons),
      createdAt: now,
      updatedAt: now,
    })
  }

  await db.insert(blockedTimeSlots).values(blockedRows)
  console.log(`✅  Inserted ${blockedRows.length} blocked time slots.`)

  // ─── 8. Patients ─────────────────────────────────────────────────────────────

  const PATIENT_COUNT = 200
  const patientRows = []

  for (let i = 0; i < PATIENT_COUNT; i++) {
    const sex = faker.helpers.arrayElement(['male', 'female'] as const)
    const firstName = faker.person.firstName(sex)
    const lastName = `${faker.person.lastName()} ${faker.person.lastName()}`
    patientRows.push({
      id: crypto.randomUUID(),
      organizationId: orgId,
      fullName: `${firstName} ${lastName}`,
      phone: `9${faker.number.int({ min: 10000000, max: 99999999 })}`,
      email: faker.helpers.maybe(() => faker.internet.email({ firstName, lastName }), { probability: 0.6 }) ?? null,
      birthDate: faker.date.birthdate({ min: 18, max: 75, mode: 'age' }),
      documentId: faker.helpers.maybe(() => faker.number.int({ min: 10000000, max: 99999999 }).toString(), { probability: 0.7 }) ?? null,
      administrativeNotes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) ?? null,
      isUrgent: Math.random() < 0.1,
      deletedAt: null,
      createdAt: randomPastDate(365),
      updatedAt: now,
    })
  }

  for (const batch of chunk(patientRows, 100)) {
    await db.insert(patients).values(batch)
  }
  console.log(`✅  Inserted ${patientRows.length} patients.`)

  // ─── 9. Appointments ──────────────────────────────────────────────────────────

  // Pre-build non-overlapping 60-min slots for future appointments.
  // The constraint only fires for scheduled/confirmed/checked_in/in_progress.
  // Past appointments (completed/cancelled/no_show) are exempt — random times are fine.
  const futureSlotPool: Date[] = []
  for (let d = 1; d <= 90; d++) {
    const date = addDays(now, d)
    const dow = date.getDay()
    if (dow === 0 || dow === 6) continue // weekdays only
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    for (const hour of [9, 10, 11, 12, 15, 16, 17, 18]) {
      futureSlotPool.push(new Date(`${year}-${month}-${day}T${String(hour).padStart(2, '0')}:00:00-05:00`))
    }
  }
  faker.helpers.shuffle(futureSlotPool)
  let futureSlotIdx = 0

  const APPOINTMENT_COUNT = 1000
  const pastStatusWeights = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'cancelled', 'cancelled', 'cancelled', 'no_show', 'no_show'] as const
  const futureStatusWeights = ['scheduled', 'scheduled', 'scheduled', 'confirmed', 'confirmed'] as const

  const appointmentRows = []
  const paymentRows = []
  const statusHistoryRows = []
  const appointmentIdsWithPayment = new Set<string>()

  for (let i = 0; i < APPOINTMENT_COUNT * 2 && appointmentRows.length < APPOINTMENT_COUNT; i++) {
    const patient = faker.helpers.arrayElement(patientRows)
    const service = faker.helpers.arrayElement(serviceRows)
    const durationMinutes = service.defaultDurationMinutes
    const isPast = Math.random() < 0.7

    let startAt: Date
    let endAt: Date

    if (isPast) {
      const daysOffset = faker.number.int({ min: 1, max: 180 })
      const baseDate = addDays(now, -daysOffset)
      const slot = randomWorkSlot(baseDate, durationMinutes)
      startAt = slot.startAt
      endAt = slot.endAt
    } else {
      if (futureSlotIdx >= futureSlotPool.length) break
      startAt = futureSlotPool[futureSlotIdx++]
      endAt = addMinutes(startAt, durationMinutes)
    }

    const status = isPast
      ? faker.helpers.arrayElement(pastStatusWeights)
      : faker.helpers.arrayElement(futureStatusWeights)

    const cancelledAt = status === 'cancelled' ? addMinutes(startAt, -faker.number.int({ min: 60, max: 1440 })) : null

    const apptId = crypto.randomUUID()
    const agreedPrice = service.price

    appointmentRows.push({
      id: apptId,
      organizationId: orgId,
      patientId: patient.id,
      serviceId: service.id,
      agreedPrice,
      professionalId: createdBy,
      startAt,
      endAt,
      status,
      isUrgent: Math.random() < 0.05,
      reason: faker.helpers.maybe(() => faker.lorem.sentence({ min: 4, max: 10 }), { probability: 0.5 }) ?? null,
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) ?? null,
      createdBy,
      updatedBy: null,
      cancelledAt,
      createdAt: addMinutes(startAt, -faker.number.int({ min: 60, max: 2880 })),
      updatedAt: now,
    })

    statusHistoryRows.push({
      id: crypto.randomUUID(),
      appointmentId: apptId,
      previousStatus: null,
      nextStatus: 'scheduled' as const,
      changedBy: createdBy,
      createdAt: addMinutes(startAt, -faker.number.int({ min: 60, max: 2880 })),
    })

    // Payment for completed appointments (unique per appointmentId)
    if (status === 'completed' && !appointmentIdsWithPayment.has(apptId)) {
      appointmentIdsWithPayment.add(apptId)
      paymentRows.push({
        id: crypto.randomUUID(),
        organizationId: orgId,
        patientId: patient.id,
        appointmentId: apptId,
        consultationId: null,
        amount: agreedPrice ?? '100.00',
        method: faker.helpers.arrayElement(['efectivo', 'tarjeta', 'transferencia'] as const),
        concept: `Pago por ${service.name}`,
        paidAt: addMinutes(startAt, faker.number.int({ min: -10, max: 30 })),
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.15 }) ?? null,
        createdBy,
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  for (const batch of chunk(appointmentRows, 200)) {
    await db.insert(appointments).values(batch)
  }
  console.log(`✅  Inserted ${appointmentRows.length} appointments.`)

  for (const batch of chunk(statusHistoryRows, 200)) {
    await db.insert(appointmentStatusHistory).values(batch)
  }
  console.log(`✅  Inserted ${statusHistoryRows.length} status history rows.`)

  for (const batch of chunk(paymentRows, 200)) {
    await db.insert(payments).values(batch)
  }
  console.log(`✅  Inserted ${paymentRows.length} payments.`)

  // ─── 10. Expense categories + expenses ───────────────────────────────────────

  const categoryNames = [
    'Insumos médicos',
    'Equipamiento',
    'Alquiler de consultorio',
    'Marketing',
    'Servicios básicos',
    'Capacitación y congresos',
    'Software y licencias',
    'Personal administrativo',
  ]

  const categoryRows = await db
    .insert(expenseCategories)
    .values(
      categoryNames.map((name) => ({
        id: crypto.randomUUID(),
        organizationId: orgId,
        name,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .returning()

  console.log(`✅  Inserted ${categoryRows.length} expense categories.`)

  const EXPENSE_COUNT = 300
  const expenseDescriptions = [
    'Guantes descartables caja x100',
    'Alcohol gel litro',
    'Papel para camilla',
    'Mascarillas N95',
    'Publicación en redes sociales',
    'Servicio de agua y luz',
    'Suscripción software HIS',
    'Honorarios secretaria',
    'Impresión de material informativo',
    'Registro SUNAT',
    'Reparación de equipo',
    'Alquiler mensual',
    'Insumos de limpieza',
    'Carpetas y materiales de oficina',
  ]

  const expenseRows = []
  for (let i = 0; i < EXPENSE_COUNT; i++) {
    const category = faker.helpers.arrayElement(categoryRows)
    const daysBack = faker.number.int({ min: 0, max: 365 })
    expenseRows.push({
      id: crypto.randomUUID(),
      organizationId: orgId,
      categoryId: category.id,
      amount: faker.commerce.price({ min: 20, max: 800, dec: 2 }),
      description: faker.helpers.arrayElement(expenseDescriptions),
      expenseDate: addDays(now, -daysBack),
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.25 }) ?? null,
      createdBy,
      createdAt: now,
      updatedAt: now,
    })
  }

  for (const batch of chunk(expenseRows, 100)) {
    await db.insert(expenses).values(batch)
  }
  console.log(`✅  Inserted ${expenseRows.length} expenses.`)

  // ─── 11. Inventory ──────────────────────────────────────────────────────────

  const supplierRows = await db.insert(inventorySuppliers).values([
    { organizationId: orgId, name: 'MedSupply Perú', contactName: 'Rosa Vega', phone: '999111222', email: 'ventas@example.test' },
    { organizationId: orgId, name: 'Clínica Distribuciones', contactName: 'Luis Rojas', phone: '999333444' },
  ]).returning()

  const inventoryItemRows = await db.insert(inventoryItems).values([
    { organizationId: orgId, name: 'Guantes de nitrilo M', sku: 'INS-GUA-NIT-M', unit: 'par', minimumStock: '20.000', expiryAlertDays: 60 },
    { organizationId: orgId, name: 'Gasas estériles 10 × 10', sku: 'INS-GAS-1010', unit: 'unidad', minimumStock: '30.000', expiryAlertDays: 45 },
    { organizationId: orgId, name: 'Solución salina 0.9%', sku: 'INS-SAL-100', unit: 'frasco', minimumStock: '8.000', expiryAlertDays: 90 },
    { organizationId: orgId, name: 'Bajalenguas de madera', sku: 'INS-BAJ-MAD', unit: 'unidad', minimumStock: '25.000', expiryAlertDays: 30 },
  ]).returning()

  const inventoryLotRows = await db.insert(inventoryLots).values(inventoryItemRows.map((item, index) => ({
    organizationId: orgId,
    itemId: item.id,
    supplierId: supplierRows[index % supplierRows.length]!.id,
    lotNumber: `DEMO-${String(index + 1).padStart(3, '0')}`,
    expiresOn: index === 2
      ? addDays(now, -10).toISOString().slice(0, 10)
      : addDays(now, index === 0 ? 35 : 180 + index * 30).toISOString().slice(0, 10),
    receivedAt: addDays(now, -30),
    unitCost: ['0.4500', '0.1800', '4.2500', '0.0900'][index],
    currentQuantity: ['12.000', '90.000', '6.000', '50.000'][index],
  }))).returning()

  const inventoryTransactionRows = await db.insert(inventoryTransactions).values(inventoryItemRows.map((item, index) => ({
    organizationId: orgId,
    itemId: item.id,
    type: 'entry' as const,
    quantity: ['12.000', '90.000', '6.000', '50.000'][index]!,
    reason: 'Stock demo inicial',
    createdBy,
    createdAt: addDays(now, -30),
  }))).returning()

  await db.insert(inventoryTransactionAllocations).values(inventoryTransactionRows.map((transaction, index) => ({
    transactionId: transaction.id,
    lotId: inventoryLotRows[index]!.id,
    quantityDelta: transaction.quantity,
  })))

  console.log(`✅  Inserted ${inventoryItemRows.length} inventory items and demo lots.`)

  // ─── 12. Pre-evaluation forms ─────────────────────────────────────────────────

  const mainReasonOptions = ['reflujo', 'gastritis', 'dolor abdominal', 'nauseas', 'control', 'otro']
  const associatedSymptomOptions = ['acidez', 'regurgitación', 'dolor pecho', 'disfagia', 'eructos']
  const aggravatingFactorOptions = ['comidas grasas', 'café', 'alcohol', 'estrés', 'acostarse']
  const alertSignOptions = ['pérdida de peso', 'sangrado', 'disfagia progresiva', 'anemia']
  const expectationOptions = ['diagnóstico', 'tratamiento', 'segunda opinión', 'exámenes']
  const priorExamOptions = ['endoscopía', 'ecografía', 'pH-metría', 'manometría', 'TAC']
  const statusOptions = ['pending_review', 'reviewed', 'scheduled', 'dismissed'] as const
  const symptomDurationOptions = ['lt_1mo', '1_3mo', '3_12mo', 'gt_1yr'] as const
  const symptomPatternOptions = ['constant', 'intermittent', 'worsening'] as const
  const yesNoOptions = ['yes', 'no'] as const
  const improvementOptions = ['yes', 'partial', 'no'] as const

  const preEvalRows = []
  for (let i = 0; i < 50; i++) {
    const sex = faker.helpers.arrayElement(['male', 'female'] as const)
    const firstName = faker.person.firstName(sex)
    const lastName = faker.person.lastName()
    const hasPrior = Math.random() > 0.5
    const linkedPatient = faker.helpers.maybe(() => faker.helpers.arrayElement(patientRows), { probability: 0.4 })

    preEvalRows.push({
      id: crypto.randomUUID(),
      organizationId: orgId,
      patientId: linkedPatient?.id ?? null,
      fullName: `${firstName} ${lastName}`,
      age: faker.number.int({ min: 18, max: 75 }),
      city: faker.helpers.arrayElement(['Lima', 'Callao', 'Miraflores', 'San Isidro', 'Surco', 'La Molina']),
      phone: `9${faker.number.int({ min: 10000000, max: 99999999 })}`,
      email: faker.helpers.maybe(() => faker.internet.email({ firstName, lastName }), { probability: 0.55 }) ?? null,
      mainReasons: faker.helpers.arrayElements(mainReasonOptions, { min: 1, max: 3 }),
      mainReasonOtherText: null,
      complaintDescription: faker.lorem.paragraph({ min: 1, max: 3 }),
      symptomDuration: faker.helpers.arrayElement(symptomDurationOptions),
      symptomPattern: faker.helpers.arrayElement(symptomPatternOptions),
      associatedSymptoms: faker.helpers.arrayElements(associatedSymptomOptions, { min: 0, max: 3 }),
      aggravatingFactors: faker.helpers.arrayElements(aggravatingFactorOptions, { min: 0, max: 3 }),
      hasPriorRefluxDiagnosis: hasPrior ? 'yes' : 'no',
      hasPriorTreatment: hasPrior ? faker.helpers.arrayElement(yesNoOptions) : 'no',
      priorMedicationUsed: hasPrior ? (faker.helpers.maybe(() => faker.lorem.words(3)) ?? null) : null,
      treatmentImprovement: hasPrior ? faker.helpers.arrayElement(improvementOptions) : null,
      priorExams: faker.helpers.arrayElements(priorExamOptions, { min: 0, max: 3 }),
      attachmentKeys: [],
      alertSigns: faker.helpers.arrayElements(alertSignOptions, { min: 0, max: 2 }),
      consultationExpectations: faker.helpers.arrayElements(expectationOptions, { min: 1, max: 3 }),
      consentInfoTruthful: true,
      consentUnderstandsNotConsultation: true,
      status: faker.helpers.arrayElement(statusOptions),
      createdAt: randomPastDate(180),
      updatedAt: now,
    })
  }

  for (const batch of chunk(preEvalRows, 50)) {
    await db.insert(preEvaluationForms).values(batch)
  }
  console.log(`✅  Inserted ${preEvalRows.length} pre-evaluation forms.`)

  // ─── Done ────────────────────────────────────────────────────────────────────

  console.log('\n🎉  Seed complete!')
  console.log(`    Org:          ${org.name}`)
  console.log(`    Services:     ${serviceRows.length}`)
  console.log(`    Patients:     ${patientRows.length}`)
  console.log(`    Appointments: ${appointmentRows.length}`)
  console.log(`    Payments:     ${paymentRows.length}`)
  console.log(`    Expenses:     ${expenseRows.length}`)
  console.log(`    Inventory:    ${inventoryItemRows.length}`)
  console.log(`    Pre-evals:    ${preEvalRows.length}`)

  await conn.end()
}

main().catch((err) => {
  console.error('SEED ERROR:', err?.message ?? err)
  if (err?.cause) console.error('CAUSE:', err.cause?.message ?? err.cause)
  process.exit(1)
})
