import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'scheduled',
  'confirmed',
  'checked_in',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
])

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  ...timestamps,
})

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: varchar('ip_address', { length: 80 }),
    userAgent: text('user_agent'),
    ...timestamps,
  },
  (table) => [index('sessions_user_idx').on(table.userId)],
)

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    accountId: varchar('account_id', { length: 255 }).notNull(),
    providerId: varchar('provider_id', { length: 100 }).notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    passwordHash: text('password_hash'),
    ...timestamps,
  },
  (table) => [index('accounts_user_idx').on(table.userId)],
)

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  specialty: varchar('specialty', { length: 120 }),
  phone: varchar('phone', { length: 40 }),
  ...timestamps,
})

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 180 }).notNull(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  ...timestamps,
})

export const organizationMembers = pgTable(
  'organization_members',
  {
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: varchar('role', { length: 40 }).notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.organizationId, table.userId] }),
    index('organization_members_role_idx').on(table.organizationId, table.role),
  ],
)

export const patients = pgTable(
  'patients',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    fullName: varchar('full_name', { length: 180 }).notNull(),
    phone: varchar('phone', { length: 40 }).notNull(),
    email: varchar('email', { length: 255 }),
    birthDate: timestamp('birth_date', { mode: 'date' }),
    documentId: varchar('document_id', { length: 40 }),
    administrativeNotes: text('administrative_notes'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index('patients_org_name_idx').on(table.organizationId, table.fullName)],
)

export const services = pgTable(
  'services',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 180 }).notNull(),
    description: text('description'),
    defaultDurationMinutes: integer('default_duration_minutes').notNull(),
    price: numeric('price', { precision: 10, scale: 2 }),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
  },
  (table) => [index('services_org_active_idx').on(table.organizationId, table.isActive)],
)

export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    patientId: uuid('patient_id')
      .references(() => patients.id, { onDelete: 'restrict' })
      .notNull(),
    serviceId: uuid('service_id')
      .references(() => services.id, { onDelete: 'restrict' })
      .notNull(),
    professionalId: uuid('professional_id').references(() => users.id, { onDelete: 'set null' }),
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }).notNull(),
    status: appointmentStatusEnum('status').notNull(),
    isUrgent: boolean('is_urgent').default(false).notNull(),
    reason: varchar('reason', { length: 255 }),
    notes: text('notes'),
    createdBy: uuid('created_by')
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index('appointments_org_start_idx').on(table.organizationId, table.startAt),
    index('appointments_org_status_start_idx').on(table.organizationId, table.status, table.startAt),
  ],
)

export const doctorAvailability = pgTable('doctor_availability', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  weekday: integer('weekday').notNull(),
  startTime: varchar('start_time', { length: 5 }).notNull(),
  endTime: varchar('end_time', { length: 5 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
})

export const blockedTimeSlots = pgTable('blocked_time_slots', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  reason: varchar('reason', { length: 255 }),
  ...timestamps,
})

export const appointmentStatusHistory = pgTable(
  'appointment_status_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    appointmentId: uuid('appointment_id')
      .references(() => appointments.id, { onDelete: 'cascade' })
      .notNull(),
    previousStatus: appointmentStatusEnum('previous_status'),
    nextStatus: appointmentStatusEnum('next_status').notNull(),
    changedBy: uuid('changed_by')
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('appointment_status_history_idx').on(table.appointmentId, table.createdAt)],
)

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  entityName: varchar('entity_name', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 64 }).notNull(),
  action: varchar('action', { length: 80 }).notNull(),
  metadataJson: text('metadata_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
