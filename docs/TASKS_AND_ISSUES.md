# Tasks And Issues

## Modulos

Convencion sugerida de nombre visible:

- `Modulo E1: Arquitectura base del MVP`
- `Modulo E2: Backend y base de datos con Neon`
- `Modulo E3: Auth y roles`

### E1. Arquitectura base

- Crear reglas del repositorio, docs y estructura Clean Architecture.
- Aceptacion: estructura base creada, AGENTS listo, docs y subagentes disponibles.
- Prioridad: alta
- Labels: `epic`, `architecture`, `docs`, `mvp`
  Nota: se mantiene el label tecnico `epic` en GitHub, aunque en documentacion funcional usamos `modulo`.
- Estimacion: M

### E2. Backend y base de datos con Neon

- Configurar Drizzle, schema inicial, migraciones y seed.
- Aceptacion: configuracion base lista y documentada.
- Prioridad: alta
- Labels: `epic`, `backend`, `database`, `mvp`
- Estimacion: M

### E3. Auth y roles

- Integrar Better Auth y permisos por `organization_members`.
- Aceptacion: sesion server-side y guardas base definidas.
- Prioridad: alta
- Labels: `epic`, `auth`, `security`, `assistant-role`
- Estimacion: M

### E4. Dashboard administrativo

- Implementar dashboard con metricas y agenda del dia.
- Aceptacion: datos reales o mock claramente separados.
- Prioridad: alta
- Labels: `epic`, `dashboard`, `ui`
- Estimacion: M

### E5. Pacientes

- CRUD administrativo basico de pacientes.
- Aceptacion: listado, detalle, creacion y edicion con validaciones.
- Prioridad: alta
- Labels: `epic`, `patients`, `backend`, `ui`
- Estimacion: M

### E6. Citas

- Crear, editar, cancelar y cambiar estado.
- Aceptacion: sin doble reserva y con reglas de negocio minimas.
- Prioridad: alta
- Labels: `epic`, `appointments`, `backend`
- Estimacion: L

### E7. Agenda y calendario ✅ IMPLEMENTADO

- Vista diaria y semanal basica con huecos disponibles.
- Aceptacion: calendario usable en desktop y mobile.
- Prioridad: media
- Labels: `epic`, `appointments`, `ui`
- Estimacion: M
- Endpoints: `GET /api/calendar/day?date=YYYY-MM-DD`, `GET /api/calendar/week?date=YYYY-MM-DD`
- Use cases: `GetCalendarDayUseCase`, `GetCalendarWeekUseCase` (backend + frontend)
- UI: `/calendar` — vista dia y semana, bloqueos, huecos libres, disponibilidad
- Tests: `get-calendar-day.test.ts` (4 casos)

### E8. Servicios medicos

- CRUD de servicios con duracion base y activacion.
- Aceptacion: catalogo administrativo funcional.
- Prioridad: media
- Labels: `epic`, `services`, `backend`, `ui`
- Estimacion: S

### E9. Disponibilidad

- Horarios de atencion, bloqueos y dias no laborables.
- Aceptacion: reglas de disponibilidad persistidas y reutilizables.
- Prioridad: media
- Labels: `epic`, `appointments`, `database`
- Estimacion: M

### E10. Reserva publica ✅ IMPLEMENTADO

- Formulario y flujo publico de reserva sin autenticacion.
- Aceptacion: nunca expone datos de otros pacientes.
- Prioridad: media
- Labels: `epic`, `ui`, `security`
- Estimacion: M
- Endpoints publicos: `GET /api/public/services`, `GET /api/public/slots`, `POST /api/public/booking`
- Use cases: `GetPublicServicesUseCase`, `GetPublicSlotsUseCase`, `CreatePublicBookingUseCase`
- Helper: `getPublicContext()` resuelve organizacionId + systemUserId sin sesion
- UI: wizard 4 pasos — servicio → fecha/slot → datos → confirmacion
- Layout: `layouts/public.vue` limpio sin nav admin
- Tests: `create-public-booking.test.ts` (3 casos)

### E11. Seguridad y privacidad

- Hardening de permisos, logs y datos sensibles.
- Aceptacion: reglas documentadas y aplicadas en endpoints criticos.
- Prioridad: alta
- Labels: `epic`, `security`, `mvp`
- Estimacion: M

### E12. Testing

- Tests de reglas de agenda, validaciones y casos de uso.
- Aceptacion: `pnpm test` cubre reglas criticas.
- Prioridad: alta
- Labels: `epic`, `testing`
- Estimacion: S

### E13. UI/UX responsive

- Layout administrativo, bottom navigation y estados base.
- Aceptacion: experiencia coherente en desktop y mobile.
- Prioridad: media
- Labels: `epic`, `ui`, `mvp`
- Estimacion: M

### E14. Deploy

- Checklist de build, entorno y backups.
- Aceptacion: ruta clara a un despliegue seguro.
- Prioridad: media
- Labels: `epic`, `docs`, `backend`
- Estimacion: S

## Orden recomendado

1. E1 Arquitectura base
2. E2 Backend y base de datos
3. E3 Auth y roles
4. E4 Dashboard
5. E5 Pacientes
6. E8 Servicios
7. E6 Citas
8. E9 Disponibilidad
9. E7 Agenda y calendario
10. E10 Reserva publica
11. E11 Seguridad y privacidad
12. E12 Testing
13. E13 UI/UX responsive
14. E14 Deploy

## Estado actual

- E1: base de arquitectura, docs y subagentes creada.
- E2: Drizzle, schema inicial y migracion base ya aplicados.
- E3: Better Auth activo, session guards SSR-safe y rol resuelto por `organization_members`.
- E3: permisos por accion ya centralizados en backend con `requireAuthorizedUser(event, action)`.
- E3: resolucion server-side de sesion y autorizacion ya separada en mini-feature de auth con `server auth repository`, use cases y service locator.
- E3: gestion de asistentes ya implementada con crear, editar, desvincular, reactivar y eliminar.
- E3 pendiente: permisos finos adicionales por modulo si se amplian configuraciones criticas.
- E4: dashboard inicial con mock data ya operativo.
- E4: frontend de `dashboard` ya fue refactorizado al flujo `Page -> ViewModel -> UseCase -> Repository -> RemoteDataSource -> API`.
- E5: `GET/POST/PATCH /api/patients` y `GET /api/patients/:id` ya persisten/leen desde PostgreSQL con Drizzle; la UI ya registra, lista y edita pacientes reales.
- E5: frontend de `patients` ya fue refactorizado al flujo `Page -> ViewModel -> UseCase -> Repository -> RemoteDataSource -> API`.
- E8: CRUD completo de servicios implementado: `GET/POST/PATCH /api/services` persisten en PostgreSQL con Drizzle.
- E8: edicion de servicio con formulario inline y activacion/desactivacion via toggle ya implementados en UI.
- E8: permisos endurecidos: asistentes solo leen servicios, admin_doctor escribe (create/update/toggle).
- E8: tests para `UpdateServiceUseCase` (5 tests) y view model de services (5 tests) integrados.
- E6: crear, editar, cancelar y cambiar estado de citas ya operan con PostgreSQL validando paciente, servicio, disponibilidad inicial y choques.
- E6: frontend de `appointments` ya fue refactorizado al flujo `Page -> ViewModel -> UseCase -> Repository -> RemoteDataSource -> API`.
- E12: pruebas base de auth/use cases y reglas criticas ya integradas en `pnpm test`.
- E9: base de disponibilidad implementada: `GET/POST/PATCH/POST toggle /api/availability` y `POST/DELETE /api/availability/blocked` persisten en PostgreSQL con Drizzle.
- E9: UI administrativa de disponibilidad con grid semanal, edicion inline, toggle activo/inactivo, y gestion de bloqueos horarios.
- E9: permisos endurecidos: assistant read-only, admin_doctor full CRUD en availability:read/write.
- E9: tests de use cases de disponibilidad y bloqueos integrados (6 tests).
- E9: indices agregados a `doctor_availability` y `blocked_time_slots`.
- Existe `pnpm docs:update` para regenerar el inventario tecnico consumido por otros agentes.

## Issues propuestos

1. Crear base de arquitectura y documentacion del MVP.
2. Configurar Drizzle, schema y scripts de base de datos.
3. Integrar Better Auth con sesion server-side.
4. Implementar dashboard administrativo con mock data.
5. Crear modulo de pacientes.
6. Crear modulo de servicios medicos.
7. Implementar reglas y endpoints de citas.
8. Implementar disponibilidad y bloqueos horarios.
9. Implementar calendario diario/semanal.
10. Crear flujo publico de reserva.
11. Aplicar hardening de seguridad y privacidad.
12. Aumentar cobertura de pruebas criticas.
13. Pulir experiencia responsive y estados de UI.
14. Preparar deploy, backups y checklist productivo.

## Sincronizacion con GitHub

- Issue `E3: Auth y roles`: ya cubre login, signup, persistencia de sesion, `session-context` y middleware `admin`.
- Issue `E3: Auth y roles`: ya cubre tambien permisos de escritura diferenciados en endpoints base.
- Proximo update recomendado para `E3`: cerrar cuando existan permisos por rol aplicados tambien en mas endpoints criticos y UI de gestion de asistentes/configuracion.
