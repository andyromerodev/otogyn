# Agent File Map

Generated: 2026-07-13T03:32:14.529Z

Este archivo se genera con `pnpm docs:update` y muestra la distribucion actual del codigo por capa y feature.

## Pages

### appointments

- `app/pages/appointments/[id].vue`
- `app/pages/appointments/index.vue`
- `app/pages/appointments/new.vue`

### patients

- `app/pages/patients/[id].vue`
- `app/pages/patients/index.vue`
- `app/pages/patients/new.vue`

### services

- `app/pages/services/[id].vue`
- `app/pages/services/index.vue`
- `app/pages/services/new.vue`

### shared

- `app/pages/availability.vue`
- `app/pages/book.vue`
- `app/pages/calendar.vue`
- `app/pages/consultations/[appointmentId].vue`
- `app/pages/consultations/index.vue`
- `app/pages/dashboard.vue`
- `app/pages/finances/categories/index.vue`
- `app/pages/finances/expenses/index.vue`
- `app/pages/finances/expenses/new.vue`
- `app/pages/finances/index.vue`
- `app/pages/finances/payments/index.vue`
- `app/pages/finances/payments/new.vue`
- `app/pages/index.vue`
- `app/pages/inventory/index.vue`
- `app/pages/inventory/items/[id].vue`
- `app/pages/inventory/items/new.vue`
- `app/pages/inventory/movements/new.vue`
- `app/pages/inventory/suppliers.vue`
- `app/pages/login.vue`
- `app/pages/pre-evaluacion-forms/[id].vue`
- `app/pages/pre-evaluacion-forms/index.vue`
- `app/pages/pre-evaluacion.vue`
- `app/pages/settings.vue`
- `app/pages/signup.vue`
- `app/pages/statistics/index.vue`

## Composables

### appointments

- `app/composables/appointments/use-appointment-create-view-model.ts`
- `app/composables/appointments/use-appointment-detail-view-model.ts`
- `app/composables/appointments/use-appointments-list-view-model.ts`

### auth

- `app/composables/auth/use-session-context.ts`

### calendar

- `app/composables/calendar/use-calendar-view-model.ts`

### dashboard

- `app/composables/dashboard/use-dashboard-view-model.ts`

### patients

- `app/composables/patients/use-patient-create-view-model.ts`
- `app/composables/patients/use-patient-detail-view-model.ts`
- `app/composables/patients/use-patients-list-view-model.ts`

### services

- `app/composables/services/use-service-create-view-model.ts`
- `app/composables/services/use-service-detail-view-model.ts`
- `app/composables/services/use-services-list-view-model.ts`

### settings

- `app/composables/settings/use-assistants-screen.ts`

### shared

- `app/composables/availability/use-availability-view-model.ts`
- `app/composables/booking/use-booking-screen.ts`
- `app/composables/consultations/use-consultation-wizard-view-model.ts`
- `app/composables/consultations/use-treatment-templates-view-model.ts`
- `app/composables/finances/use-expense-categories-view-model.ts`
- `app/composables/finances/use-expenses-view-model.ts`
- `app/composables/finances/use-finance-summary-view-model.ts`
- `app/composables/finances/use-payments-view-model.ts`
- `app/composables/inventory/inventory-dependencies.ts`
- `app/composables/inventory/use-inventory-detail-view-model.ts`
- `app/composables/inventory/use-inventory-item-form-view-model.ts`
- `app/composables/inventory/use-inventory-list-view-model.ts`
- `app/composables/inventory/use-inventory-movement-view-model.ts`
- `app/composables/inventory/use-inventory-suppliers-view-model.ts`
- `app/composables/pre-evaluacion/use-pre-evaluacion-screen.ts`
- `app/composables/pre-evaluation-forms/use-pre-evaluation-form-detail-view-model.ts`
- `app/composables/pre-evaluation-forms/use-pre-evaluation-forms-list-view-model.ts`
- `app/composables/pwa/use-network-status.ts`
- `app/composables/statistics/use-appointment-stats-view-model.ts`

## Presentation ViewModels

### appointments

- `src/presentation/view-models/appointments/appointment-create-view-model.module.ts`
- `src/presentation/view-models/appointments/appointment-create-view-model.test.ts`
- `src/presentation/view-models/appointments/appointment-create-view-model.ts`
- `src/presentation/view-models/appointments/appointment-detail-view-model.module.ts`
- `src/presentation/view-models/appointments/appointment-detail-view-model.test.ts`
- `src/presentation/view-models/appointments/appointment-detail-view-model.ts`
- `src/presentation/view-models/appointments/appointment-detail.ts`
- `src/presentation/view-models/appointments/appointment-list.test.ts`
- `src/presentation/view-models/appointments/appointment-list.ts`
- `src/presentation/view-models/appointments/appointment-view-model.types.ts`
- `src/presentation/view-models/appointments/appointments-list-view-model.module.ts`
- `src/presentation/view-models/appointments/appointments-list-view-model.test.ts`
- `src/presentation/view-models/appointments/appointments-list-view-model.ts`

### auth

- `src/presentation/view-models/auth/login-view-model.module.ts`
- `src/presentation/view-models/auth/login-view-model.test.ts`
- `src/presentation/view-models/auth/login-view-model.ts`
- `src/presentation/view-models/auth/signup-view-model.module.ts`
- `src/presentation/view-models/auth/signup-view-model.test.ts`
- `src/presentation/view-models/auth/signup-view-model.ts`

### calendar

- `src/presentation/view-models/calendar/calendar-view-model.module.ts`
- `src/presentation/view-models/calendar/calendar-view-model.test.ts`
- `src/presentation/view-models/calendar/calendar-view-model.ts`

### dashboard

- `src/presentation/view-models/dashboard/dashboard-view-model.module.ts`
- `src/presentation/view-models/dashboard/dashboard-view-model.test.ts`
- `src/presentation/view-models/dashboard/dashboard-view-model.ts`
- `src/presentation/view-models/dashboard/index.ts`

### patients

- `src/presentation/view-models/patients/patient-create-view-model.module.ts`
- `src/presentation/view-models/patients/patient-create-view-model.test.ts`
- `src/presentation/view-models/patients/patient-create-view-model.ts`
- `src/presentation/view-models/patients/patient-detail-view-model.module.ts`
- `src/presentation/view-models/patients/patient-detail-view-model.test.ts`
- `src/presentation/view-models/patients/patient-detail-view-model.ts`
- `src/presentation/view-models/patients/patient-view-model.types.ts`
- `src/presentation/view-models/patients/patients-list-view-model.module.ts`
- `src/presentation/view-models/patients/patients-list-view-model.test.ts`
- `src/presentation/view-models/patients/patients-list-view-model.ts`

### services

- `src/presentation/view-models/services/service-create-view-model.module.ts`
- `src/presentation/view-models/services/service-create-view-model.test.ts`
- `src/presentation/view-models/services/service-create-view-model.ts`
- `src/presentation/view-models/services/service-detail-view-model.delete.test.ts`
- `src/presentation/view-models/services/service-detail-view-model.module.ts`
- `src/presentation/view-models/services/service-detail-view-model.test.ts`
- `src/presentation/view-models/services/service-detail-view-model.ts`
- `src/presentation/view-models/services/service-view-model.types.ts`
- `src/presentation/view-models/services/services-list-view-model.module.ts`
- `src/presentation/view-models/services/services-list-view-model.test.ts`
- `src/presentation/view-models/services/services-list-view-model.ts`

### settings

- `src/presentation/view-models/settings/create-assistants-screen.test.ts`
- `src/presentation/view-models/settings/create-assistants-screen.ts`

### shared

- `src/presentation/view-models/availability/availability-view-model.module.ts`
- `src/presentation/view-models/availability/availability-view-model.ts`
- `src/presentation/view-models/booking/booking-screen.ts`
- `src/presentation/view-models/consultations/consultation-wizard-view-model.ts`
- `src/presentation/view-models/dashboard.ts`
- `src/presentation/view-models/finances/expense-categories-view-model.module.ts`
- `src/presentation/view-models/finances/expense-categories-view-model.test.ts`
- `src/presentation/view-models/finances/expense-categories-view-model.ts`
- `src/presentation/view-models/finances/expenses-list-view-model.module.ts`
- `src/presentation/view-models/finances/expenses-list-view-model.test.ts`
- `src/presentation/view-models/finances/expenses-list-view-model.ts`
- `src/presentation/view-models/finances/finance-summary-view-model.module.ts`
- `src/presentation/view-models/finances/finance-summary-view-model.ts`
- `src/presentation/view-models/finances/payment-create-form.test.ts`
- `src/presentation/view-models/finances/payment-create-form.ts`
- `src/presentation/view-models/finances/payments-list-view-model.module.ts`
- `src/presentation/view-models/finances/payments-list-view-model.test.ts`
- `src/presentation/view-models/finances/payments-list-view-model.ts`
- `src/presentation/view-models/inventory/inventory-view-models.test.ts`
- `src/presentation/view-models/inventory/inventory-view-models.ts`
- `src/presentation/view-models/layout/app-shell-sign-out.test.ts`
- `src/presentation/view-models/layout/app-shell-sign-out.ts`
- `src/presentation/view-models/pre-evaluacion/pre-evaluacion-screen.ts`
- `src/presentation/view-models/pre-evaluation-forms/pre-evaluation-form-detail-view-model.module.ts`
- `src/presentation/view-models/pre-evaluation-forms/pre-evaluation-form-detail-view-model.ts`
- `src/presentation/view-models/pre-evaluation-forms/pre-evaluation-forms-list-view-model.module.ts`
- `src/presentation/view-models/pre-evaluation-forms/pre-evaluation-forms-list-view-model.ts`
- `src/presentation/view-models/statistics/appointment-stats-view-model.ts`

## Application UseCases

### appointments

- `src/application/use-cases/appointments/cancel-appointment.ts`
- `src/application/use-cases/appointments/change-appointment-status.ts`
- `src/application/use-cases/appointments/create-appointment.ts`
- `src/application/use-cases/appointments/get-appointment-available-slots.ts`
- `src/application/use-cases/appointments/get-appointment-detail.ts`
- `src/application/use-cases/appointments/get-appointment-session-context.ts`
- `src/application/use-cases/appointments/list-appointment-patients.ts`
- `src/application/use-cases/appointments/list-appointment-services.ts`
- `src/application/use-cases/appointments/list-appointments.ts`
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
- `src/application/use-cases/services/delete-service.ts`
- `src/application/use-cases/services/get-service-detail.ts`
- `src/application/use-cases/services/get-service-screen-context.ts`
- `src/application/use-cases/services/list-services.ts`
- `src/application/use-cases/services/update-service.ts`

### shared

- `src/application/use-cases/availability/create-availability.test.ts`
- `src/application/use-cases/availability/create-availability.ts`
- `src/application/use-cases/availability/create-blocked-slot.ts`
- `src/application/use-cases/availability/create-bulk-availability.ts`
- `src/application/use-cases/availability/create-bulk-blocked-slots.ts`
- `src/application/use-cases/availability/delete-blocked-slot.ts`
- `src/application/use-cases/availability/frontend/create-availability.ts`
- `src/application/use-cases/availability/frontend/create-blocked-slot.ts`
- `src/application/use-cases/availability/frontend/create-bulk-availability.ts`
- `src/application/use-cases/availability/frontend/create-bulk-blocked-slots.ts`
- `src/application/use-cases/availability/frontend/delete-blocked-slot.ts`
- `src/application/use-cases/availability/frontend/list-availability.ts`
- `src/application/use-cases/availability/frontend/list-upcoming-blocked-slots.ts`
- `src/application/use-cases/availability/frontend/toggle-availability-active.ts`
- `src/application/use-cases/availability/frontend/update-availability.ts`
- `src/application/use-cases/availability/list-availability.ts`
- `src/application/use-cases/availability/list-blocked-slots.ts`
- `src/application/use-cases/availability/list-upcoming-blocked-slots.ts`
- `src/application/use-cases/availability/toggle-availability-active.ts`
- `src/application/use-cases/availability/update-availability.ts`
- `src/application/use-cases/booking/create-public-booking.integration.test.ts`
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
- `src/application/use-cases/consultations/complete-consultation.test.ts`
- `src/application/use-cases/consultations/complete-consultation.ts`
- `src/application/use-cases/consultations/create-treatment-template.ts`
- `src/application/use-cases/consultations/delete-treatment-template.ts`
- `src/application/use-cases/consultations/frontend/complete-consultation.ts`
- `src/application/use-cases/consultations/frontend/get-consultation-by-appointment.ts`
- `src/application/use-cases/consultations/frontend/list-consultations-by-patient.ts`
- `src/application/use-cases/consultations/frontend/start-consultation.ts`
- `src/application/use-cases/consultations/frontend/update-consultation.ts`
- `src/application/use-cases/consultations/frontend/upload-consultation-attachment.ts`
- `src/application/use-cases/consultations/get-consultation-by-appointment.ts`
- `src/application/use-cases/consultations/list-patient-consultations.ts`
- `src/application/use-cases/consultations/list-treatment-templates.ts`
- `src/application/use-cases/consultations/start-consultation.test.ts`
- `src/application/use-cases/consultations/start-consultation.ts`
- `src/application/use-cases/consultations/treatment-templates.test.ts`
- `src/application/use-cases/consultations/update-consultation.test.ts`
- `src/application/use-cases/consultations/update-consultation.ts`
- `src/application/use-cases/create-assistant.ts`
- `src/application/use-cases/create-patient.test.ts`
- `src/application/use-cases/create-patient.ts`
- `src/application/use-cases/create-service.test.ts`
- `src/application/use-cases/create-service.ts`
- `src/application/use-cases/deactivate-assistant.ts`
- `src/application/use-cases/delete-assistant.ts`
- `src/application/use-cases/delete-service.integration.test.ts`
- `src/application/use-cases/delete-service.test.ts`
- `src/application/use-cases/delete-service.ts`
- `src/application/use-cases/finances/create-expense-category.test.ts`
- `src/application/use-cases/finances/create-expense-category.ts`
- `src/application/use-cases/finances/create-expense.test.ts`
- `src/application/use-cases/finances/create-expense.ts`
- `src/application/use-cases/finances/create-payment.test.ts`
- `src/application/use-cases/finances/create-payment.ts`
- `src/application/use-cases/finances/delete-expense.test.ts`
- `src/application/use-cases/finances/delete-expense.ts`
- `src/application/use-cases/finances/delete-payment.test.ts`
- `src/application/use-cases/finances/delete-payment.ts`
- `src/application/use-cases/finances/get-finance-summary.test.ts`
- `src/application/use-cases/finances/get-finance-summary.ts`
- `src/application/use-cases/finances/list-expense-categories.ts`
- `src/application/use-cases/finances/list-expenses.test.ts`
- `src/application/use-cases/finances/list-expenses.ts`
- `src/application/use-cases/finances/list-payments.test.ts`
- `src/application/use-cases/finances/list-payments.ts`
- `src/application/use-cases/finances/update-expense-category.test.ts`
- `src/application/use-cases/finances/update-expense-category.ts`
- `src/application/use-cases/finances/update-expense.test.ts`
- `src/application/use-cases/finances/update-expense.ts`
- `src/application/use-cases/finances/update-payment.test.ts`
- `src/application/use-cases/finances/update-payment.ts`
- `src/application/use-cases/get-appointment-available-slots.test.ts`
- `src/application/use-cases/get-appointment-available-slots.ts`
- `src/application/use-cases/get-appointment-detail.test.ts`
- `src/application/use-cases/get-appointment-detail.ts`
- `src/application/use-cases/get-appointment-stats.ts`
- `src/application/use-cases/get-dashboard-summary.test.ts`
- `src/application/use-cases/get-dashboard-summary.ts`
- `src/application/use-cases/get-patient-detail.ts`
- `src/application/use-cases/get-service-detail.test.ts`
- `src/application/use-cases/get-service-detail.ts`
- `src/application/use-cases/get-today-appointments.ts`
- `src/application/use-cases/inventory/fefo.test.ts`
- `src/application/use-cases/inventory/fefo.ts`
- `src/application/use-cases/inventory/inventory-use-cases.ts`
- `src/application/use-cases/inventory/inventory.integration.test.ts`
- `src/application/use-cases/list-appointments.test.ts`
- `src/application/use-cases/list-appointments.ts`
- `src/application/use-cases/list-assistants.ts`
- `src/application/use-cases/list-patients.test.ts`
- `src/application/use-cases/list-patients.ts`
- `src/application/use-cases/list-services.test.ts`
- `src/application/use-cases/list-services.ts`
- `src/application/use-cases/pre-evaluation-forms/create-patient-from-pre-evaluation-form.test.ts`
- `src/application/use-cases/pre-evaluation-forms/create-patient-from-pre-evaluation-form.ts`
- `src/application/use-cases/pre-evaluation-forms/create-pre-evaluation-form.test.ts`
- `src/application/use-cases/pre-evaluation-forms/create-pre-evaluation-form.ts`
- `src/application/use-cases/pre-evaluation-forms/frontend/create-patient-from-pre-evaluation-form.ts`
- `src/application/use-cases/pre-evaluation-forms/frontend/get-pre-evaluation-form-detail.ts`
- `src/application/use-cases/pre-evaluation-forms/frontend/link-pre-evaluation-form-to-patient.ts`
- `src/application/use-cases/pre-evaluation-forms/frontend/list-pre-evaluation-forms.ts`
- `src/application/use-cases/pre-evaluation-forms/frontend/submit-pre-evaluation-form.ts`
- `src/application/use-cases/pre-evaluation-forms/frontend/upload-pre-evaluation-attachment.ts`
- `src/application/use-cases/pre-evaluation-forms/get-pre-evaluation-form-detail.ts`
- `src/application/use-cases/pre-evaluation-forms/link-pre-evaluation-form-to-patient.test.ts`
- `src/application/use-cases/pre-evaluation-forms/link-pre-evaluation-form-to-patient.ts`
- `src/application/use-cases/pre-evaluation-forms/list-pre-evaluation-forms.ts`
- `src/application/use-cases/pre-evaluation-forms/upload-pre-evaluation-attachment.ts`
- `src/application/use-cases/reactivate-assistant.ts`
- `src/application/use-cases/remove-assistant.ts`
- `src/application/use-cases/schedule-appointment.integration.test.ts`
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
- `src/application/dto/appointment-stats.ts`
- `src/application/dto/assistant-management.ts`
- `src/application/dto/auth.ts`
- `src/application/dto/availability-management.ts`
- `src/application/dto/calendar.ts`
- `src/application/dto/consultation-update-payload.ts`
- `src/application/dto/consultation.ts`
- `src/application/dto/dashboard-management.ts`
- `src/application/dto/dashboard.ts`
- `src/application/dto/expense.ts`
- `src/application/dto/finance-summary.ts`
- `src/application/dto/inventory-management.ts`
- `src/application/dto/patient-management.ts`
- `src/application/dto/payment.ts`
- `src/application/dto/pre-evaluation-form-management.ts`
- `src/application/dto/pre-evaluation-form.ts`
- `src/application/dto/public-booking.ts`
- `src/application/dto/server-auth.ts`
- `src/application/dto/service-management.ts`

## Application Ports

### shared

- `src/application/ports/appointment-management-repository.ts`
- `src/application/ports/assistant-management-repository.ts`
- `src/application/ports/attachment-storage.ts`
- `src/application/ports/availability-management-repository.ts`
- `src/application/ports/booking-repository.ts`
- `src/application/ports/calendar-repository.ts`
- `src/application/ports/consultation-repository.ts`
- `src/application/ports/dashboard-management-repository.ts`
- `src/application/ports/expense-management-repository.ts`
- `src/application/ports/finance-summary-management-repository.ts`
- `src/application/ports/inventory-management-repository.ts`
- `src/application/ports/notification-service.ts`
- `src/application/ports/patient-management-repository.ts`
- `src/application/ports/payment-management-repository.ts`
- `src/application/ports/pre-evaluation-form-management-repository.ts`
- `src/application/ports/pre-evaluation-form-repository.ts`
- `src/application/ports/service-management-repository.ts`
- `src/application/ports/treatment-template-repository.ts`

## Domain Repositories

### shared

- `src/domain/repositories/appointment-repository.ts`
- `src/domain/repositories/assistant-repository.ts`
- `src/domain/repositories/auth-repository.ts`
- `src/domain/repositories/availability-repository.ts`
- `src/domain/repositories/consultation-repository.ts`
- `src/domain/repositories/expense-category-repository.ts`
- `src/domain/repositories/expense-repository.ts`
- `src/domain/repositories/finance-report-repository.ts`
- `src/domain/repositories/inventory-repository.ts`
- `src/domain/repositories/patient-repository.ts`
- `src/domain/repositories/payment-repository.ts`
- `src/domain/repositories/pre-evaluation-form-repository.ts`
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
- `src/infrastructure/consultations/service-locator.ts`
- `src/infrastructure/finances/service-locator.ts`
- `src/infrastructure/inventory/service-locator.ts`
- `src/infrastructure/pre-evaluation-forms/service-locator.ts`

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
- `src/infrastructure/consultations/remote/consultation-remote-data-source.ts`
- `src/infrastructure/consultations/remote/http-consultation-remote-data-source.ts`
- `src/infrastructure/finances/remote/http-expense-remote-data-source.ts`
- `src/infrastructure/finances/remote/http-finance-summary-remote-data-source.ts`
- `src/infrastructure/finances/remote/http-payment-remote-data-source.ts`
- `src/infrastructure/inventory/remote/http-inventory-remote-data-source.ts`
- `src/infrastructure/inventory/remote/inventory-remote-data-source.ts`
- `src/infrastructure/pre-evaluation-forms/remote/http-pre-evaluation-form-management-remote-data-source.ts`
- `src/infrastructure/pre-evaluation-forms/remote/http-pre-evaluation-form-remote-data-source.ts`
- `src/infrastructure/pre-evaluation-forms/remote/pre-evaluation-form-management-remote-data-source.ts`
- `src/infrastructure/pre-evaluation-forms/remote/pre-evaluation-form-remote-data-source.ts`

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
- `src/infrastructure/consultations/repositories/consultation-repository-impl.ts`
- `src/infrastructure/finances/repositories/expense-management-repository-impl.ts`
- `src/infrastructure/finances/repositories/finance-summary-management-repository-impl.ts`
- `src/infrastructure/finances/repositories/payment-management-repository-impl.ts`
- `src/infrastructure/inventory/repositories/inventory-management-repository-impl.ts`
- `src/infrastructure/pre-evaluation-forms/repositories/pre-evaluation-form-management-repository-impl.ts`
- `src/infrastructure/pre-evaluation-forms/repositories/pre-evaluation-form-repository-impl.ts`
- `src/infrastructure/repositories/drizzle-appointment-repository.ts`
- `src/infrastructure/repositories/drizzle-assistant-repository.ts`
- `src/infrastructure/repositories/drizzle-availability-repository.ts`
- `src/infrastructure/repositories/drizzle-consultation-repository.ts`
- `src/infrastructure/repositories/drizzle-expense-category-repository.ts`
- `src/infrastructure/repositories/drizzle-expense-repository.ts`
- `src/infrastructure/repositories/drizzle-finance-report-repository.ts`
- `src/infrastructure/repositories/drizzle-inventory-repository.ts`
- `src/infrastructure/repositories/drizzle-patient-repository.find-by-exact-phone-and-email.integration.test.ts`
- `src/infrastructure/repositories/drizzle-patient-repository.ts`
- `src/infrastructure/repositories/drizzle-payment-repository.ts`
- `src/infrastructure/repositories/drizzle-pre-evaluation-form-repository.ts`
- `src/infrastructure/repositories/drizzle-service-repository.ts`
- `src/infrastructure/repositories/drizzle-treatment-template-repository.ts`

## Server API

### appointments

- `server/api/appointments/[id].get.ts`
- `server/api/appointments/[id].patch.ts`
- `server/api/appointments/[id]/cancel.post.ts`
- `server/api/appointments/[id]/status.post.ts`
- `server/api/appointments/available-slots.get.ts`
- `server/api/appointments/index.get.ts`
- `server/api/appointments/index.post.ts`
- `server/api/appointments/patients.get.ts`
- `server/api/appointments/stats.get.ts`
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
- `server/api/auth/login.integration.test.ts`
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

- `server/api/services/[id].delete.ts`
- `server/api/services/[id].get.ts`
- `server/api/services/[id].patch.ts`
- `server/api/services/index.get.ts`
- `server/api/services/index.post.ts`

### shared

- `server/api/availability/[id].patch.ts`
- `server/api/availability/[id]/toggle.post.ts`
- `server/api/availability/blocked/[id].delete.ts`
- `server/api/availability/blocked/bulk.post.ts`
- `server/api/availability/blocked/index.post.ts`
- `server/api/availability/bulk.post.ts`
- `server/api/availability/index.get.ts`
- `server/api/availability/index.post.ts`
- `server/api/consultations/[id].patch.ts`
- `server/api/consultations/[id]/attachments.post.ts`
- `server/api/consultations/[id]/attachments/[key].get.ts`
- `server/api/consultations/[id]/complete.post.ts`
- `server/api/consultations/by-appointment/[appointmentId].get.ts`
- `server/api/consultations/index.post.ts`
- `server/api/consultations/patient/[patientId].get.ts`
- `server/api/consultations/templates/[id].delete.ts`
- `server/api/consultations/templates/index.get.ts`
- `server/api/consultations/templates/index.post.ts`
- `server/api/expense-categories/[id].patch.ts`
- `server/api/expense-categories/index.get.ts`
- `server/api/expense-categories/index.post.ts`
- `server/api/expenses/[id].delete.ts`
- `server/api/expenses/[id].patch.ts`
- `server/api/expenses/index.get.ts`
- `server/api/expenses/index.post.ts`
- `server/api/finances/export.get.ts`
- `server/api/finances/summary.get.ts`
- `server/api/icd11/search.get.ts`
- `server/api/inventory/items/[id].get.ts`
- `server/api/inventory/items/[id].patch.ts`
- `server/api/inventory/items/[id]/lots.get.ts`
- `server/api/inventory/items/[id]/movements.get.ts`
- `server/api/inventory/items/index.get.ts`
- `server/api/inventory/items/index.post.ts`
- `server/api/inventory/movements/index.post.ts`
- `server/api/inventory/summary.get.ts`
- `server/api/inventory/suppliers/[id].patch.ts`
- `server/api/inventory/suppliers/index.get.ts`
- `server/api/inventory/suppliers/index.post.ts`
- `server/api/payments/[id].delete.ts`
- `server/api/payments/[id].patch.ts`
- `server/api/payments/index.get.ts`
- `server/api/payments/index.post.ts`
- `server/api/pre-evaluation-forms/[id].get.ts`
- `server/api/pre-evaluation-forms/[id]/attachments/[key].get.ts`
- `server/api/pre-evaluation-forms/[id]/create-patient.post.ts`
- `server/api/pre-evaluation-forms/[id]/link.post.ts`
- `server/api/pre-evaluation-forms/index.get.ts`
- `server/api/public/booking.post.ts`
- `server/api/public/pre-evaluacion.post.ts`
- `server/api/public/pre-evaluacion/upload.post.ts`
- `server/api/public/security-token.get.ts`
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
- `server/utils/public-security.ts`
- `server/utils/server-service-locator.ts`
- `server/utils/who-icd-client.test.ts`
- `server/utils/who-icd-client.ts`

