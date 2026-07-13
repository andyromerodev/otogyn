# Database Model

## Modelo de datos inicial

El modelo parte de una sola organizacion, pero todas las entidades operativas mantienen `organization_id` para preparar multi-tenant futuro.

## Tablas

### Auth base

- `users`
- `sessions`
- `accounts`

### Operacion

- `profiles`
- `organizations`
- `organization_members`
- `patients`
- `services`
- `appointments`
- `doctor_availability`
- `blocked_time_slots`
- `appointment_status_history`
- `audit_logs`
- `inventory_items`
- `inventory_suppliers`
- `inventory_lots`
- `inventory_transactions`
- `inventory_transaction_allocations`

### Atención clínica

- `consultations`
- `pre_evaluation_forms`
- `treatment_templates`

## Campos clave

### patients

- `id`
- `organization_id`
- `full_name`
- `phone`
- `email`
- `birth_date`
- `document_id`
- `administrative_notes`
- `created_at`
- `updated_at`
- `deleted_at`

### services

- `id`
- `organization_id`
- `name`
- `description`
- `default_duration_minutes`
- `price`
- `is_active`
- `created_at`
- `updated_at`

### appointments

- `id`
- `organization_id`
- `patient_id`
- `service_id`
- `professional_id`
- `start_at`
- `end_at`
- `status`
- `is_urgent`
- `reason`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`
- `cancelled_at`

### inventory_items

- `id`, `organization_id`
- `name`, `sku`, `barcode`, `description`
- `unit`, `minimum_stock`, `expiry_alert_days`, `is_active`
- `created_at`, `updated_at`

### inventory_lots

- `id`, `organization_id`, `item_id`, `supplier_id`
- `lot_number`, `expires_on`, `received_at`, `unit_cost`
- `current_quantity` como saldo materializado protegido contra valores negativos

### inventory_transactions

- `id`, `organization_id`, `item_id`, `type`, `quantity`
- `appointment_id` opcional para consumos vinculados a una atencion
- `reason`, `notes`, `created_by`, `created_at`
- Las asignaciones por lote viven en `inventory_transaction_allocations` y forman el kardex auditable.

## Relaciones

- `profiles.user_id -> users.id`
- `organization_members.organization_id -> organizations.id`
- `organization_members.user_id -> users.id`
- `patients.organization_id -> organizations.id`
- `services.organization_id -> organizations.id`
- `appointments.organization_id -> organizations.id`
- `appointments.patient_id -> patients.id`
- `appointments.service_id -> services.id`
- `appointments.professional_id -> users.id`
- `appointment_status_history.appointment_id -> appointments.id`

### treatment_templates

- `id` uuid PK
- `organization_id` FK → organizations(id) ON DELETE CASCADE
- `name` text NOT NULL
- `diagnosis_code` text nullable — código CIE-11 asociado
- `diagnosis_label` text nullable
- `treatment_plan` text NOT NULL default ''
- `medications` jsonb NOT NULL default '[]' — array de `ConsultationMedication`
- `auxiliary_exams` jsonb NOT NULL default '[]' — array de strings
- `created_at`, `updated_at`
- índice compuesto `(organization_id, diagnosis_code)`

## Indices recomendados

- `patients(organization_id, full_name)`
- `services(organization_id, is_active)`
- `appointments(organization_id, start_at)`
- `appointments(organization_id, status, start_at)`
- `appointment_status_history(appointment_id, created_at)`
- `organization_members(organization_id, role)`
- `inventory_items(organization_id, sku)` unico
- `inventory_lots(organization_id, expires_on)`
- `inventory_transactions(organization_id, created_at)`

## Estados de cita

- `scheduled`
- `confirmed`
- `checked_in`
- `in_progress`
- `completed`
- `cancelled`
- `no_show`

## Auditoria minima

- Registrar actor, entidad, accion, timestamp y payload resumido.
- No guardar valores medicos sensibles en el log.

## Drizzle schema esperado

- Schema centralizado en `src/infrastructure/database/schema/index.ts`.
- Tablas auth iniciales se dejan compatibles con una integracion base de Better Auth, pero deben validarse antes de la primera migracion productiva.

## Migraciones

- Generacion con `pnpm db:generate`
- Aplicacion con `pnpm db:migrate`
- La primera migracion solo debe ejecutarse cuando el contrato final de auth este validado contra Better Auth.

## Seed y demo data

- Organizacion demo unica.
- Dra. Ana Garcia como administradora.
- Asistente demo.
- Servicios demo del consultorio.
- Pacientes demo no reales.
- Citas del dia para dashboard y agenda.

## Consideraciones de Neon PostgreSQL

- Usar `sslmode=require`.
- Aprovechar Time Travel para recuperacion puntual.
- Pasar a plan con backups automaticos diarios antes de usar datos reales de pacientes.
