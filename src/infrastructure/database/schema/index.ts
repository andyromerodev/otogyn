import {
  boolean,
  index,
  integer,
  jsonb,
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
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    ...timestamps,
  },
  (table) => [index('accounts_user_idx').on(table.userId)],
)

export const verifications = pgTable(
  'verifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    identifier: varchar('identifier', { length: 255 }).notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index('verifications_identifier_idx').on(table.identifier)],
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
    isActive: boolean('is_active').default(true).notNull(),
    deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
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
    isUrgent: boolean('is_urgent').default(false).notNull(),
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

export const doctorAvailability = pgTable(
  'doctor_availability',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    weekday: integer('weekday').notNull(),
    startTime: varchar('start_time', { length: 5 }).notNull(),
    endTime: varchar('end_time', { length: 5 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    index('doctor_availability_org_weekday_idx').on(table.organizationId, table.weekday),
  ],
)

export const blockedTimeSlots = pgTable(
  'blocked_time_slots',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    reason: varchar('reason', { length: 255 }),
    ...timestamps,
  },
  (table) => [
    index('blocked_time_slots_org_range_idx').on(table.organizationId, table.startsAt, table.endsAt),
  ],
)

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

export const preEvalSymptomDurationEnum = pgEnum('pre_eval_symptom_duration', [
  'lt_1mo',
  '1_3mo',
  '3_12mo',
  'gt_1yr',
])

export const preEvalSymptomPatternEnum = pgEnum('pre_eval_symptom_pattern', [
  'constant',
  'intermittent',
  'worsening',
])

export const preEvalYesNoEnum = pgEnum('pre_eval_yes_no', ['yes', 'no'])

export const preEvalImprovementEnum = pgEnum('pre_eval_improvement', ['yes', 'partial', 'no'])

export const preEvalStatusEnum = pgEnum('pre_eval_status', [
  'pending_review',
  'reviewed',
  'scheduled',
  'dismissed',
])

export const preEvaluationForms = pgTable(
  'pre_evaluation_forms',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'set null' }),

    fullName: varchar('full_name', { length: 180 }).notNull(),
    age: integer('age'),
    city: varchar('city', { length: 120 }),
    phone: varchar('phone', { length: 40 }).notNull(),
    email: varchar('email', { length: 255 }),

    mainReasons: jsonb('main_reasons').$type<string[]>().notNull().default([]),
    mainReasonOtherText: text('main_reason_other_text'),
    complaintDescription: text('complaint_description'),

    symptomDuration: preEvalSymptomDurationEnum('symptom_duration'),
    symptomPattern: preEvalSymptomPatternEnum('symptom_pattern'),

    associatedSymptoms: jsonb('associated_symptoms').$type<string[]>().notNull().default([]),
    aggravatingFactors: jsonb('aggravating_factors').$type<string[]>().notNull().default([]),

    hasPriorRefluxDiagnosis: preEvalYesNoEnum('has_prior_reflux_diagnosis'),
    hasPriorTreatment: preEvalYesNoEnum('has_prior_treatment'),
    priorMedicationUsed: text('prior_medication_used'),
    treatmentImprovement: preEvalImprovementEnum('treatment_improvement'),

    priorExams: jsonb('prior_exams').$type<string[]>().notNull().default([]),
    attachmentKeys: jsonb('attachment_keys').$type<string[]>().notNull().default([]),

    alertSigns: jsonb('alert_signs').$type<string[]>().notNull().default([]),
    consultationExpectations: jsonb('consultation_expectations').$type<string[]>().notNull().default([]),

    consentInfoTruthful: boolean('consent_info_truthful').default(false).notNull(),
    consentUnderstandsNotConsultation: boolean('consent_understands_not_consultation')
      .default(false)
      .notNull(),

    status: preEvalStatusEnum('status').default('pending_review').notNull(),

    ...timestamps,
  },
  (table) => [
    index('pre_evaluation_forms_org_created_idx').on(table.organizationId, table.createdAt),
  ],
)

export const consultationStatusEnum = pgEnum('consultation_status', ['draft', 'completed'])

export interface ConsultationAdditionalExam {
  name: string
  findings: string
}

export interface ConsultationDiagnosis {
  description: string
  cie10Code: string | null
  type: 'presuntivo' | 'definitivo' | 'recurrente'
}

export interface ConsultationMedication {
  name: string
  dose: string | null
  route: string | null
  frequency: string | null
  duration: string | null
  additionalInfo: string | null
  isUsualMedication: boolean
}

export const consultations = pgTable(
  'consultations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'restrict' })
      .notNull(),
    appointmentId: uuid('appointment_id')
      .references(() => appointments.id, { onDelete: 'restrict' })
      .notNull()
      .unique(),
    patientId: uuid('patient_id')
      .references(() => patients.id, { onDelete: 'restrict' })
      .notNull(),
    createdBy: uuid('created_by')
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    // Anamnesis
    anamnesisText: text('anamnesis_text'),
    attachmentKeys: jsonb('attachment_keys').$type<string[]>().notNull().default([]),
    // Examen físico
    bloodPressure: varchar('blood_pressure', { length: 20 }),
    heartRate: integer('heart_rate'),
    respiratoryRate: integer('respiratory_rate'),
    oxygenSaturation: integer('oxygen_saturation'),
    temperature: numeric('temperature', { precision: 4, scale: 1 }),
    additionalExams: jsonb('additional_exams').$type<ConsultationAdditionalExam[]>().notNull().default([]),
    // Diagnóstico
    diagnoses: jsonb('diagnoses').$type<ConsultationDiagnosis[]>().notNull().default([]),
    appreciation: text('appreciation'),
    // Plan
    medications: jsonb('medications').$type<ConsultationMedication[]>().notNull().default([]),
    treatmentPlan: text('treatment_plan'),
    auxiliaryExams: jsonb('auxiliary_exams').$type<string[]>().notNull().default([]),
    status: consultationStatusEnum('status').default('draft').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index('consultations_org_patient_idx').on(table.organizationId, table.patientId, table.createdAt),
  ],
)

export const publicRateLimits = pgTable(
  'public_rate_limits',
  {
    key: varchar('key', { length: 180 }).primaryKey(),
    count: integer('count').default(0).notNull(),
    resetAt: timestamp('reset_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('public_rate_limits_reset_idx').on(table.resetAt),
  ],
)
