# Prompt Claude Code — Modulo E6.1 Appointments

## Contexto

Trabaja sobre este repo:

- `/Users/andy/Documents/OtoGyn/otogynwebapp`

Debes respetar estrictamente:

- `/Users/andy/Documents/OtoGyn/otogynwebapp/AGENTS.md`
- `/Users/andy/Documents/OtoGyn/otogynwebapp/docs/AGENT_WORKFLOW.md`
- `/Users/andy/Documents/OtoGyn/otogynwebapp/docs/ANDROID_STYLE_ARCHITECTURE.md`
- `/Users/andy/Documents/OtoGyn/otogynwebapp/docs/AGENT_FILE_MAP.md`

## Regla obligatoria de arquitectura

Frontend obligatorio:

- `Screen/Page -> ViewModel/Composable -> UseCase -> Repository -> RemoteDataSource`

Backend obligatorio:

- `API Route -> Authorization/Validation -> UseCase -> Repository`

No improvises otra arquitectura.

No pongas `$fetch`, `useFetch`, Drizzle ni Better Auth directo dentro de pages.
No mezcles create/edit/list en una sola screen.
No rompas endpoints existentes si no es necesario.

## Objetivo general

Refactorizar `appointments` para que deje de ser una sola pantalla monolítica y pase a este flujo:

- `/appointments` => listado puro
- `/appointments/new` => crear cita
- `/appointments/:id` => detalle/edición/cancelación/cambio de estado

El backend actual ya existe en gran parte. Debes reutilizarlo y adaptar solo lo necesario.

## Estado actual que debes asumir

- Hoy existe `app/pages/appointments.vue` mezclando:
  - crear
  - editar
  - cancelar
  - cambiar estado
  - listado de hoy
- `patients` y `services` ya son la referencia correcta del flujo y separación
- Disponibilidad ya existe
- Validación de colisiones ya existe
- Roles y permisos ya existen
- Calendario ya existe
- Persistencia real PostgreSQL + Drizzle ya existe

## Restricciones

- No cambies schema ni migraciones salvo que sea estrictamente necesario y puedas justificarlo
- No cambies el contrato de negocio de citas sin necesidad
- No metas mocks
- No rompas auth ni permisos
- Debes mantener `assistant` con acceso permitido según reglas actuales
- Debes mantener `admin_doctor` con control completo según reglas actuales
- Sigue naming y estilo Android-like del repo
- Si detectas deuda previa, no la expandas: encapsúlala

---

# SUBTAREA 1 — Auditoría y plan corto

## Objetivo

Inspecciona el módulo actual de citas y produce un plan corto antes de editar.

## Debes revisar

- page actual de appointments
- composable actual
- viewmodel actual
- use cases actuales de appointments
- repositories y remote data sources actuales
- endpoints server actuales de appointments
- cómo navegan `patients` y `services`

## Entrega esperada

Antes de editar, responde con:

- archivos actuales involucrados
- qué se va a conservar
- qué se va a dividir
- nuevas rutas a crear
- nuevos composables/viewmodels a crear
- riesgos

## Luego de eso

Detente y espera confirmación.

---

# SUBTAREA 2 — Separación de rutas y pantallas

## Objetivo

Convertir appointments a tres screens.

## Implementación requerida

Crear o adaptar:

- `app/pages/appointments/index.vue`
- `app/pages/appointments/new.vue`
- `app/pages/appointments/[id].vue`

Eliminar dependencia funcional de:

- `app/pages/appointments.vue`

Si hace falta mantener compatibilidad temporal, haz redirect limpio, pero el estado final deseado es por carpetas como `patients` y `services`.

## Comportamiento esperado

### `/appointments`

- screen de listado puro
- no formulario inline
- muestra citas del día o listado operativo claro
- CTA para crear nueva cita
- cada item navega a detalle

### `/appointments/new`

- screen dedicada para crear cita
- reutiliza lógica actual de create
- al guardar exitosamente:
  - navegar a `/appointments`

### `/appointments/:id`

- screen de detalle de cita
- mostrar datos actuales
- permitir editar
- permitir cancelar
- permitir cambiar estado
- si ya existe reprogramación con update, reutilizarla

## Arquitectura frontend requerida

Separar como mínimo:

- `app/composables/appointments/use-appointments-list-screen.ts`
- `app/composables/appointments/use-appointment-create-screen.ts`
- `app/composables/appointments/use-appointment-detail-screen.ts`

Y sus viewmodels equivalentes en:

- `src/presentation/view-models/appointments/`

## Entrega esperada

Cuando termines:

- resume archivos creados/modificados
- explica si dejaste compatibilidad temporal
- ejecuta:
  - `pnpm typecheck`
  - `pnpm lint`

Luego detente y espera confirmación.

---

# SUBTAREA 3 — Refactor de ViewModels y UseCases

## Objetivo

Quitar el screen model monolítico y dejar responsabilidades separadas.

## Implementación requerida

Debes separar responsabilidades en viewmodels distintos:

### List screen

Debe encargarse de:

- cargar citas a mostrar
- loading
- error state
- navegación a create/detail

### Create screen

Debe encargarse de:

- form state
- carga de pacientes
- carga de servicios
- submit create
- mensajes de error/success
- navegación al listado

### Detail screen

Debe encargarse de:

- cargar detalle por id
- edición
- cancelación
- cambio de estado
- mensajes
- navegación de regreso

## Use cases

Revisa los actuales y reutiliza todo lo posible, pero si falta capa limpia debes crearla.

Debe existir separación clara entre:

- listar citas para screen
- crear cita
- obtener detalle
- actualizar cita
- cancelar cita
- cambiar estado

## Repositorio / datasource

No pongas HTTP en page ni en viewmodel.
Si falta método en repository o remote datasource, créalo.

## Entrega esperada

Al terminar:

- lista de nuevos viewmodels/usecases/contracts creados
- explicación breve de cómo quedó el flujo
- ejecuta:
  - `pnpm test`
  - `pnpm typecheck`

Luego detente y espera confirmación.

---

# SUBTAREA 4 — Backend mínimo faltante para detalle

## Objetivo

Completar backend si falta endpoint de detalle.

## Implementación requerida

Verifica si ya existe soporte real para:

- `GET /api/appointments/:id`

Si no existe, implementarlo.

## Reglas

- validar sesión
- validar permiso adecuado
- resolver id desde params
- usar use case
- usar repository real
- devolver `404` si no existe
- no meter Drizzle en `server/api`

## Si falta en capas

Agregar lo necesario en:

- dto
- repository contract
- repository impl
- remote datasource frontend
- use case frontend/backend

## Entrega esperada

Cuando termines:

- confirma si el endpoint ya existía o fue creado
- lista archivos backend tocados
- ejecuta:
  - `pnpm test`
  - `pnpm build`

Luego detente y espera confirmación.

---

# SUBTAREA 5 — UI de listado estilo clínico

## Objetivo

Mejorar `/appointments` para que visualmente deje de parecer una screen técnica mezclada.

## Requisitos de UI

Debe sentirse coherente con `patients` y `services`, pero adaptada a citas.

### En `/appointments`

- header grande
- subtítulo operativo
- lista vertical clara
- cada item debe mostrar mínimo:
  - hora
  - paciente
  - servicio
  - estado
  - urgente si aplica
- CTA de crear cita:
  - FAB en mobile
  - botón visible en desktop

### No implementar aún

- filtros complejos si no existen
- búsqueda avanzada si no existe
- nuevas reglas de negocio

## Navegación

- tocar card => `/appointments/:id`

## Entrega esperada

Cuando termines:

- screenshots conceptuales descritas en texto breve
- archivos UI modificados
- ejecuta:
  - `pnpm typecheck`
  - `pnpm lint`

Luego detente y espera confirmación.

---

# SUBTAREA 6 — Detalle de cita usable

## Objetivo

Hacer `/appointments/:id` realmente útil para operación.

## Requisitos mínimos

Debe permitir:

- ver datos de la cita
- editar cita
- cambiar estado
- cancelar cita
- mostrar error si acción no permitida
- mostrar loading y error states limpios

## Requisitos de UX

- no todo editable al mismo tiempo si eso ensucia la vista
- puedes usar modo lectura + editar, como en services
- cancelación debe tener confirmación si hoy no la tiene
- si una acción falla por regla de negocio, mostrar mensaje claro

## Entrega esperada

Al terminar:

- resume UX final del detalle
- lista acciones soportadas
- ejecuta:
  - `pnpm test`
  - `pnpm build`

Luego detente y espera confirmación.

---

# SUBTAREA 7 — Documentación y cierre

## Objetivo

Actualizar documentación del repo al nuevo estado del módulo.

## Debes actualizar

- `docs/TASKS_AND_ISSUES.md`
- `docs/AGENT_FILE_MAP.md`
- cualquier doc mínima necesaria si cambia el mapa de arquitectura

## También

Ejecuta:

```bash
pnpm docs:update
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Entrega final esperada

- resumen de lo implementado
- comandos ejecutados y resultado real
- archivos creados
- archivos modificados
- riesgos pendientes
- próximos pasos sugeridos para appointments

---

# Criterios de aceptación global

El trabajo se considera correcto solo si al final:

- `appointments` ya no depende de una sola screen monolítica
- existen rutas separadas:
  - `/appointments`
  - `/appointments/new`
  - `/appointments/:id`
- la page no llama HTTP directo
- el flujo respeta patrón Android-like
- la UI de citas queda consistente con patients/services
- create/detail/update/cancel/status siguen funcionando con persistencia real
- permisos siguen respetándose
- docs quedan actualizados

# Importante

- Trabaja por subtarea
- No hagas todo de golpe
- Después de cada subtarea, detente y reporta
- Si detectas un conflicto fuerte con la arquitectura existente, explica el conflicto y propone la corrección mínima compatible
