# Agent File Map

Generated: 2026-06-21T20:13:26.391Z

Este archivo se genera con `pnpm docs:update` y muestra la distribucion actual del codigo por capa y feature.

## Pages

### patients

- `app/pages/patients/[id].vue`
- `app/pages/patients/index.vue`
- `app/pages/patients/new.vue`

### services

- `app/pages/services/[id].vue`
- `app/pages/services/index.vue`
- `app/pages/services/new.vue`

### shared

- `app/pages/appointments.vue`
- `app/pages/availability.vue`
- `app/pages/book.vue`
- `app/pages/calendar.vue`
- `app/pages/consultations.vue`
- `app/pages/dashboard.vue`
- `app/pages/index.vue`
- `app/pages/login.vue`
- `app/pages/settings.vue`
- `app/pages/signup.vue`

## Composables

### appointments

- `app/composables/appointments/use-appointments-screen.ts`

### calendar

- `app/composables/calendar/use-calendar-screen.ts`

### dashboard

- `app/composables/dashboard/use-dashboard-screen.ts`

### patients

- `app/composables/patients/use-patient-create-screen.ts`
- `app/composables/patients/use-patient-detail-screen.ts`
- `app/composables/patients/use-patients-list-screen.ts`

### services

- `app/composables/services/use-service-create-screen.ts`
- `app/composables/services/use-service-detail-screen.ts`
- `app/composables/services/use-services-list-screen.ts`

### settings

- `app/composables/settings/use-assistants-screen.ts`

### shared

- `app/composables/availability/use-availability-screen.ts`
- `app/composables/booking/use-booking-screen.ts`

## Presentation ViewModels

### appointments

- `src/presentation/view-models/appointments/create-appointments-screen.test.ts`
- `src/presentation/view-models/appointments/create-appointments-screen.ts`

### auth

- `src/presentation/view-models/auth/create-login-screen.test.ts`
- `src/presentation/view-models/auth/create-login-screen.ts`
- `src/presentation/view-models/auth/create-signup-screen.test.ts`
- `src/presentation/view-models/auth/create-signup-screen.ts`

### calendar

- `src/presentation/view-models/calendar/calendar-screen.test.ts`
- `src/presentation/view-models/calendar/calendar-screen.ts`

### dashboard

- `src/presentation/view-models/dashboard/create-dashboard-screen.test.ts`
- `src/presentation/view-models/dashboard/create-dashboard-screen.ts`
- `src/presentation/view-models/dashboard/index.ts`

### patients

- `src/presentation/view-models/patients/create-patient-create-screen.test.ts`
- `src/presentation/view-models/patients/create-patient-create-screen.ts`
- `src/presentation/view-models/patients/create-patient-detail-screen.test.ts`
- `src/presentation/view-models/patients/create-patient-detail-screen.ts`
- `src/presentation/view-models/patients/create-patients-list-screen.test.ts`
- `src/presentation/view-models/patients/create-patients-list-screen.ts`
- `src/presentation/view-models/patients/patient-screen.types.ts`

### services

- `src/presentation/view-models/services/create-service-create-screen.test.ts`
- `src/presentation/view-models/services/create-service-create-screen.ts`
- `src/presentation/view-models/services/create-service-detail-screen.test.ts`
- `src/presentation/view-models/services/create-service-detail-screen.ts`
- `src/presentation/view-models/services/create-services-list-screen.test.ts`
- `src/presentation/view-models/services/create-services-list-screen.ts`
- `src/presentation/view-models/services/service-screen.types.ts`

### settings

- `src/presentation/view-models/settings/create-assistants-screen.test.ts`
- `src/presentation/view-models/settings/create-assistants-screen.ts`

### shared

- `src/presentation/view-models/availability/create-availability-screen.ts`
- `src/presentation/view-models/booking/booking-screen.ts`
- `src/presentation/view-models/dashboard.ts`

## Application UseCases

### appointments

- `src/application/use-cases/appointments/cancel-appointment.ts`
- `src/application/use-cases/appointments/change-appointment-status.ts`
- `src/application/use-cases/appointments/create-appointment.ts`
- `src/application/use-cases/appointments/get-appointment-session-context.ts`
- `src/application/use-cases/appointments/list-appointment-patients.ts`
- `src/application/use-cases/appointments/list-appointment-services.ts`
- `src/application/use-cases/appointments/list-today-appointments.ts`
- `src/application/use-cases/appointments/update-appointment.ts`

### assistants

- `src/application/use-cases/assistants/check-assistant-email.ts`
- `src/application/use-cases/assistants/create-assistant.ts`
- `src/application/use-cases/assistants/deactivate-assistant.ts`
- `src/application/use-cases/assistants/delete-assistant.ts`
- `src/application/use-cases/assistants/get-assistant-screen-context.ts`
- `src/application/use-cases/assistants/list-assistants.ts`
- `src/application/use-cases/assistants/reactivate-assistant.ts`
- `src/application/use-cases/assistants/update-assistant.ts`

### auth

- `src/application/use-cases/auth/authorize-server-action.ts`
- `src/application/use-cases/auth/get-access-status.test.ts`
- `src/application/use-cases/auth/get-access-status.ts`
- `src/application/use-cases/auth/get-current-session.test.ts`
- `src/application/use-cases/auth/get-current-session.ts`
- `src/application/use-cases/auth/resolve-server-session.ts`
- `src/application/use-cases/auth/sign-in.test.ts`
- `src/application/use-cases/auth/sign-in.ts`
- `src/application/use-cases/auth/sign-out.test.ts`
- `src/application/use-cases/auth/sign-out.ts`
- `src/application/use-cases/auth/sign-up.test.ts`
- `src/application/use-cases/auth/sign-up.ts`

### calendar

- `src/application/use-cases/calendar/free-slots.ts`
- `src/application/use-cases/calendar/frontend/get-calendar-day.ts`
- `src/application/use-cases/calendar/frontend/get-calendar-month.ts`
- `src/application/use-cases/calendar/frontend/get-calendar-week.ts`
- `src/application/use-cases/calendar/get-calendar-day.test.ts`
- `src/application/use-cases/calendar/get-calendar-day.ts`
- `src/application/use-cases/calendar/get-calendar-month.test.ts`
- `src/application/use-cases/calendar/get-calendar-month.ts`
- `src/application/use-cases/calendar/get-calendar-week.test.ts`
- `src/application/use-cases/calendar/get-calendar-week.ts`

### dashboard

- `src/application/use-cases/dashboard/get-dashboard-summary.ts`
- `src/application/use-cases/dashboard/get-dashboard-today-appointments.ts`

### patients

- `src/application/use-cases/patients/create-patient.ts`
- `src/application/use-cases/patients/get-patient-detail.ts`
- `src/application/use-cases/patients/list-patients.ts`
- `src/application/use-cases/patients/update-patient.ts`

### services

- `src/application/use-cases/services/create-service.ts`
- `src/application/use-cases/services/get-service-detail.ts`
- `src/application/use-cases/services/get-service-screen-context.ts`
- `src/application/use-cases/services/list-services.ts`
- `src/application/use-cases/services/update-service.ts`

### shared

- `src/application/use-cases/availability/create-availability.test.ts`
- `src/application/use-cases/availability/create-availability.ts`
- `src/application/use-cases/availability/create-blocked-slot.ts`
- `src/application/use-cases/availability/delete-blocked-slot.ts`
- `src/application/use-cases/availability/frontend/create-availability.ts`
- `src/application/use-cases/availability/frontend/create-blocked-slot.ts`
- `src/application/use-cases/availability/frontend/delete-blocked-slot.ts`
- `src/application/use-cases/availability/frontend/list-availability.ts`
- `src/application/use-cases/availability/frontend/toggle-availability-active.ts`
- `src/application/use-cases/availability/frontend/update-availability.ts`
- `src/application/use-cases/availability/list-availability.ts`
- `src/application/use-cases/availability/list-blocked-slots.ts`
- `src/application/use-cases/availability/toggle-availability-active.ts`
- `src/application/use-cases/availability/update-availability.ts`
- `src/application/use-cases/booking/create-public-booking.test.ts`
- `src/application/use-cases/booking/create-public-booking.ts`
- `src/application/use-cases/booking/frontend/create-public-booking.ts`
- `src/application/use-cases/booking/frontend/get-public-services.ts`
- `src/application/use-cases/booking/frontend/get-public-slots.ts`
- `src/application/use-cases/booking/get-public-services.ts`
- `src/application/use-cases/booking/get-public-slots.test.ts`
- `src/application/use-cases/booking/get-public-slots.ts`
- `src/application/use-cases/cancel-appointment.test.ts`
- `src/application/use-cases/cancel-appointment.ts`
- `src/application/use-cases/change-appointment-status.test.ts`
- `src/application/use-cases/change-appointment-status.ts`
- `src/application/use-cases/create-assistant.ts`
- `src/application/use-cases/create-patient.test.ts`
- `src/application/use-cases/create-patient.ts`
- `src/application/use-cases/create-service.test.ts`
- `src/application/use-cases/create-service.ts`
- `src/application/use-cases/deactivate-assistant.ts`
- `src/application/use-cases/delete-assistant.ts`
- `src/application/use-cases/get-dashboard-summary.test.ts`
- `src/application/use-cases/get-dashboard-summary.ts`
- `src/application/use-cases/get-patient-detail.ts`
- `src/application/use-cases/get-service-detail.test.ts`
- `src/application/use-cases/get-service-detail.ts`
- `src/application/use-cases/get-today-appointments.ts`
- `src/application/use-cases/list-assistants.ts`
- `src/application/use-cases/list-patients.test.ts`
- `src/application/use-cases/list-patients.ts`
- `src/application/use-cases/list-services.test.ts`
- `src/application/use-cases/list-services.ts`
- `src/application/use-cases/reactivate-assistant.ts`
- `src/application/use-cases/remove-assistant.ts`
- `src/application/use-cases/schedule-appointment.test.ts`
- `src/application/use-cases/schedule-appointment.ts`
- `src/application/use-cases/update-appointment.test.ts`
- `src/application/use-cases/update-appointment.ts`
- `src/application/use-cases/update-assistant.ts`
- `src/application/use-cases/update-patient.test.ts`
- `src/application/use-cases/update-patient.ts`
- `src/application/use-cases/update-service.test.ts`
- `src/application/use-cases/update-service.ts`

## Application DTOs

### shared

- `src/application/dto/appointment-management.ts`
- `src/application/dto/assistant-management.ts`
- `src/application/dto/auth.ts`
- `src/application/dto/availability-management.ts`
- `src/application/dto/calendar.ts`
- `src/application/dto/dashboard-management.ts`
- `src/application/dto/dashboard.ts`
- `src/application/dto/patient-management.ts`
- `src/application/dto/public-booking.ts`
- `src/application/dto/server-auth.ts`
- `src/application/dto/service-management.ts`

## Application Ports

### shared

- `src/application/ports/appointment-management-repository.ts`
- `src/application/ports/assistant-management-repository.ts`
- `src/application/ports/availability-management-repository.ts`
- `src/application/ports/booking-repository.ts`
- `src/application/ports/calendar-repository.ts`
- `src/application/ports/dashboard-management-repository.ts`
- `src/application/ports/patient-management-repository.ts`
- `src/application/ports/service-management-repository.ts`

## Domain Repositories

### shared

- `src/domain/repositories/appointment-repository.ts`
- `src/domain/repositories/assistant-repository.ts`
- `src/domain/repositories/auth-repository.ts`
- `src/domain/repositories/availability-repository.ts`
- `src/domain/repositories/patient-repository.ts`
- `src/domain/repositories/server-auth-repository.ts`
- `src/domain/repositories/service-repository.ts`

## Infrastructure ServiceLocators

### appointments

- `src/infrastructure/appointments/service-locator.ts`

### assistants

- `src/infrastructure/assistants/service-locator.ts`

### auth

- `src/infrastructure/auth/server-service-locator.ts`

### calendar

- `src/infrastructure/calendar/service-locator.ts`

### dashboard

- `src/infrastructure/dashboard/service-locator.ts`

### patients

- `src/infrastructure/patients/service-locator.ts`

### services

- `src/infrastructure/services/service-locator.ts`

### shared

- `src/infrastructure/availability/service-locator.ts`
- `src/infrastructure/booking/service-locator.ts`

## Infrastructure RemoteDataSources

### appointments

- `src/infrastructure/appointments/remote/appointment-remote-data-source.ts`
- `src/infrastructure/appointments/remote/http-appointment-remote-data-source.ts`

### assistants

- `src/infrastructure/assistants/remote/assistant-remote-data-source.ts`
- `src/infrastructure/assistants/remote/http-assistant-remote-data-source.ts`

### auth

- `src/infrastructure/auth/remote/auth-remote-data-source.ts`
- `src/infrastructure/auth/remote/better-auth-remote-data-source.ts`

### calendar

- `src/infrastructure/calendar/remote/calendar-remote-data-source.ts`
- `src/infrastructure/calendar/remote/http-calendar-remote-data-source.ts`

### dashboard

- `src/infrastructure/dashboard/remote/dashboard-remote-data-source.ts`
- `src/infrastructure/dashboard/remote/http-dashboard-remote-data-source.ts`

### patients

- `src/infrastructure/patients/remote/http-patient-remote-data-source.test.ts`
- `src/infrastructure/patients/remote/http-patient-remote-data-source.ts`
- `src/infrastructure/patients/remote/patient-remote-data-source.ts`

### services

- `src/infrastructure/services/remote/http-service-remote-data-source.ts`
- `src/infrastructure/services/remote/service-remote-data-source.ts`

### shared

- `src/infrastructure/availability/remote/availability-remote-data-source.ts`
- `src/infrastructure/availability/remote/http-availability-remote-data-source.ts`
- `src/infrastructure/booking/remote/booking-remote-data-source.ts`
- `src/infrastructure/booking/remote/http-booking-remote-data-source.ts`

## Infrastructure Repository Implementations

### appointments

- `src/infrastructure/appointments/repositories/appointment-management-repository-impl.ts`

### assistants

- `src/infrastructure/assistants/repositories/assistant-management-repository-impl.ts`

### auth

- `src/infrastructure/auth/repositories/better-auth-repository.ts`
- `src/infrastructure/auth/repositories/better-auth-server-repository.ts`

### calendar

- `src/infrastructure/calendar/repositories/calendar-repository-impl.ts`

### dashboard

- `src/infrastructure/dashboard/repositories/dashboard-management-repository-impl.ts`

### patients

- `src/infrastructure/patients/repositories/patient-management-repository-impl.ts`

### services

- `src/infrastructure/services/repositories/service-management-repository-impl.ts`

### shared

- `src/infrastructure/availability/repositories/availability-management-repository-impl.ts`
- `src/infrastructure/booking/repositories/booking-repository-impl.ts`
- `src/infrastructure/repositories/drizzle-appointment-repository.ts`
- `src/infrastructure/repositories/drizzle-assistant-repository.ts`
- `src/infrastructure/repositories/drizzle-availability-repository.ts`
- `src/infrastructure/repositories/drizzle-patient-repository.ts`
- `src/infrastructure/repositories/drizzle-service-repository.ts`

## Server API

### appointments

- `server/api/appointments/[id].patch.ts`
- `server/api/appointments/[id]/cancel.post.ts`
- `server/api/appointments/[id]/status.post.ts`
- `server/api/appointments/index.post.ts`
- `server/api/appointments/patients.get.ts`
- `server/api/appointments/today.get.ts`

### assistants

- `server/api/assistants/[id].delete.ts`
- `server/api/assistants/[id].patch.ts`
- `server/api/assistants/[id]/deactivate.post.ts`
- `server/api/assistants/[id]/reactivate.post.ts`
- `server/api/assistants/email-status.get.ts`
- `server/api/assistants/index.get.ts`
- `server/api/assistants/index.post.ts`

### auth

- `server/api/auth/[...all].ts`
- `server/api/auth/session-context.get.ts`

### calendar

- `server/api/calendar/day.get.ts`
- `server/api/calendar/month.get.ts`
- `server/api/calendar/week.get.ts`

### dashboard

- `server/api/dashboard/summary.get.ts`

### patients

- `server/api/patients/[id].get.ts`
- `server/api/patients/[id].patch.ts`
- `server/api/patients/index.get.ts`
- `server/api/patients/index.post.ts`

### services

- `server/api/services/[id].get.ts`
- `server/api/services/[id].patch.ts`
- `server/api/services/index.get.ts`
- `server/api/services/index.post.ts`

### shared

- `server/api/availability/[id].patch.ts`
- `server/api/availability/[id]/toggle.post.ts`
- `server/api/availability/blocked/[id].delete.ts`
- `server/api/availability/blocked/index.post.ts`
- `server/api/availability/index.get.ts`
- `server/api/availability/index.post.ts`
- `server/api/public/booking.post.ts`
- `server/api/public/services.get.ts`
- `server/api/public/slots.get.ts`

## Server Utils

### shared

- `server/utils/authorization.test.ts`
- `server/utils/authorization.ts`
- `server/utils/get-current-user.test.ts`
- `server/utils/get-current-user.ts`
- `server/utils/get-public-context.ts`
- `server/utils/handle-api-error.ts`
- `server/utils/mock-runtime.ts`
- `server/utils/server-service-locator.ts`

