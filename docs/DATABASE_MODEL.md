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

## Indices recomendados

- `patients(organization_id, full_name)`
- `services(organization_id, is_active)`
- `appointments(organization_id, start_at)`
- `appointments(organization_id, status, start_at)`
- `appointment_status_history(appointment_id, created_at)`
- `organization_members(organization_id, role)`

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
