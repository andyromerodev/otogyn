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
- E4: dashboard administrativo ya opera con datos reales desde `GET /api/dashboard/summary`; cuando el dia no tiene citas, muestra estado vacio en vez de dejar la tarjeta en blanco.
- E4: frontend de `dashboard` ya fue refactorizado al flujo `Page -> ViewModel -> UseCase -> Repository -> RemoteDataSource -> API`.
- E5: `GET/POST/PATCH /api/patients` y `GET /api/patients/:id` ya persisten/leen desde PostgreSQL con Drizzle; la UI ya registra, lista y edita pacientes reales.
- E5: frontend de `patients` ya fue refactorizado al flujo `Page -> ViewModel -> UseCase -> Repository -> RemoteDataSource -> API`.
- E5.1: listado de `patients` ahora soporta filtros server-side (`all`, `today`, `urgent`, `follow_up`), busqueda por `fullName + administrativeNotes`, chips mobile en una sola fila y paginacion server-side.
- E5.1: `GET /api/patients` ahora acepta `search`, `filter`, `page` y `pageSize`, y responde resultado paginado con `items`, `total`, `allTotal`, `page`, `pageSize`, `totalPages`.
- E5.2: `patients` ya soporta prioridad urgente persistida (`isUrgent`) en create/edit, badge visual rojo en listado y compatibilidad del filtro `urgent` con pacientes urgentes y citas urgentes activas.
- E8: CRUD completo de servicios implementado: `GET/POST/PATCH /api/services` persisten en PostgreSQL con Drizzle.
- E8: `services` ya fue rediseñado a flujo Android-like con listado, alta separada, detalle/edicion y borrado completo.
- E8: al intentar eliminar un servicio con citas asociadas, la UI ya muestra dialogo bloqueado tambien en produccion.
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
- E13: responsividad mobile revisada y cerrada en auth (`login`/`signup`), `dashboard`, `app-shell`, `patients` (lista/detalle), `services`, `settings`, `appointments`, `calendar` y `book`.
- E13: corregido bug de movimiento lateral en mobile (causa raiz: `grid-template-columns` con `1fr` sin `minmax(0, 1fr)`); agregado safety net global `overflow-x: hidden` en `main.css`.
- E13: `book` (reserva publica) ya cumplia los criterios de responsividad sin cambios, validado con el layout `public.vue` (max-width 640px centrado, viewport meta confirmado).
- E13: navegacion mobile rediseñada: bottom-nav fijo de 4 items (Inicio, Pacientes, Agenda, Consultas) reemplaza el menu hamburguesa con drawer; rutas secundarias (Citas, Servicios, Disponibilidad, Ajustes, Reserva publica) se agrupan en el nuevo hub `/consultations`. `app-shell-loading.vue` (skeleton de carga) actualizado para reflejar el bottom-nav.
- E13: `dashboard` rediseñado para acercarse al mockup de referencia: encabezado con saludo dinamico y avatar de iniciales, metricas 2x2 con icono y color por tono, tarjeta de "consulta activa" (derivada del estado `in_progress` ya existente, sin cambios de backend) y agenda de hoy con avatares e icono de completado.
- E13: loading global ya fue ajustado para desktop y mobile con estados visuales sin bloquear la navegacion fija.
- E14: deploy productivo en Netlify ya validado con dominio principal operativo y flujo CLI/documentacion actualizados.
- E14: corregidos bloqueadores reales de release: `pnpm` workspace root local, secrets scanning por `PNPM_FLAGS`/`AUTH_URL`, y `500` SSR de Better Auth en `/login`.
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

## Proximo foco recomendado

1. `E11.1 Hardening final de produccion`
   - ✅ headers de seguridad HTTP agregados via `routeRules['/**'].headers` en `nuxt.config.ts` (Nitro, agnostico de Netlify): `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. CSP solo se activa en produccion (`NODE_ENV === 'production'`) para no romper HMR/devtools en dev; `script-src`/`style-src` requieren `'unsafe-inline'` porque Nuxt SSR inyecta el payload `__NUXT__` y el bootstrap de color-mode sin nonce.
   - pendiente: definir CORS explicito para `/api/public/*` si el formulario publico se consume fuera del mismo dominio (no hay requisito confirmado todavia, se deja pendiente a proposito)
   - ✅ constraint en DB contra doble reserva: migracion `0004_appointments_no_overlap.sql` agrega `EXCLUDE USING gist (organization_id WITH =, tstzrange(start_at, end_at) WITH &&) WHERE status IN (activos)` sobre `appointments` (requiere extension `btree_gist`). Defensa extra a nivel de PostgreSQL ademas de la transaccion SERIALIZABLE existente en `saveWithLock`. Validado manualmente: inserta cita, intenta solapar, PostgreSQL rechaza con `conflicting key value violates exclusion constraint`.
2. `E12.1 Testing de integracion critica` ✅ IMPLEMENTADO
   - Infraestructura nueva: `pnpm test:integration` (`vitest.integration.config.ts`), separada del `pnpm test` normal (mockeado) porque golpea una Neon branch de test real (`TEST_DATABASE_URL`, "schema only", sin datos de pacientes reales) y, para los smoke HTTP, un servidor Nitro real via `@nuxt/test-utils`.
   - Refactor: los repositorios Drizzle (`patient`, `service`, `appointment`, `availability`, `assistant`) ahora aceptan el cliente DB por constructor (`constructor(private readonly db: DrizzleClient = getDrizzleClient())`) en vez de crearlo ellos mismos. Permite inyectar una transaccion de test y mantiene el comportamiento en produccion (default value = singleton de siempre).
   - `src/infrastructure/database/test/test-db.ts`: helper `withTestTransaction` — cada test corre dentro de una transaccion que siempre hace ROLLBACK, sin dejar datos residuales. Casos con un error esperado (ej. FK restrict) usan un SAVEPOINT anidado para no envenenar la transaccion externa.
   - `src/infrastructure/database/test/fixtures.ts`: builders (`seedTestOrganization`, `seedTestPatient`, etc.) para poblar datos de prueba dentro de la transaccion.
   - Tests reales agregados (UseCase + Repository + Postgres real, sin mocks): `schedule-appointment.integration.test.ts` (doble reserva rechazada por el constraint de DB), `create-public-booking.integration.test.ts` (flujo publico completo), `delete-service.integration.test.ts` (borrado bloqueado por FK real y borrado exitoso sin citas).
   - `login.integration.test.ts` y `admin-routes.integration.test.ts` (smoke tests): levantan un Nitro real via `@nuxt/test-utils` contra la branch de test y ejecutan signup -> signin -> rutas protegidas (`/api/patients`, `/api/services`, `/api/dashboard/summary`) con sesion real de better-auth, mas verificacion de 401 sin sesion. Cleanup explicito por email marcado (`test-*@otogyn.test`) en `afterAll`, ya que better-auth maneja su propio estado y no participa de la transaccion de rollback.
   - Verificado: 5 archivos / 11 tests, 3 corridas consecutivas en verde, DB de test queda en 0 filas despues de cada corrida.
3. `E6.1 Polish de citas` ✅ IMPLEMENTADO
   - ✅ Reprogramacion mas fluida: nuevo `GetAppointmentAvailableSlotsUseCase` (backend, `src/application/use-cases/get-appointment-available-slots.ts`) reutiliza `computeFreeSlots` como `GetPublicSlotsUseCase`, pero excluye la propia cita de los intervalos ocupados via `excludeAppointmentId` (asi su horario actual no se muestra como ocupado al reprogramar). Nuevo endpoint `GET /api/appointments/available-slots`. En `[id].vue`, al editar aparece un buscador de horarios (fecha + grid de slots del servicio seleccionado) que llena "Inicio" con un click, ademas del campo manual existente.
   - ✅ Mensajes mas claros: se encontro y corrigio un bug real — `normalizeApiError` leia `error.statusMessage` (getter de ofetch sobre el *reason phrase* HTTP), que h3 sanea eliminando cualquier caracter fuera de ASCII imprimible antes de enviarlo (`sanitizeStatusMessage`), mutilando tildes. Ahora lee el mensaje real desde `error.data` (el JSON de la respuesta), intacto. Verificado en vivo: la respuesta trae `statusMessage` correcto y la UI lo muestra sin corrupcion.
   - ✅ Estados mas claros: `normalizeApiError` ahora devuelve `{ message, kind }` (`'validation'` 4xx vs `'server'` 5xx); la UI de `new.vue` y `[id].vue` estiliza cada uno distinto (ambar accionable vs rojo con sugerencia de reintentar). `actionPending` unico se separo en `cancelingPending` y `changingStatusPending` para que cada boton muestre su propio estado ("Cancelando..." vs "Actualizando estado...") en vez de deshabilitar todo a la vez.
   - Verificado en navegador real (dev server + DB real): selector de horarios funciona y llena el formulario, guardado exitoso persiste y limpia el error previo, guardado fallido (fuera de horario) muestra mensaje ambar especifico sin corromper el estado de la cita.
