# Agent Workflow

## Objetivo

Este documento es la guia operativa para cualquier agente que continue el trabajo en OtoGyn sin romper el patron arquitectonico actual.

Convencion de gestion funcional:

- usamos `modulo` como nombre visible para cada bloque grande de trabajo
- formato sugerido: `Modulo Ex: Nombre`
- en GitHub puede mantenerse el label tecnico `epic` por compatibilidad, pero la documentacion funcional debe hablar de `modulos`

La regla principal es:

`Screen/Page -> ViewModel/Composable -> UseCase -> Repository -> RemoteDataSource`

y en backend:

`API Route -> Authorization/Validation -> UseCase -> Repository`

## Estado real actual

Las siguientes areas ya estan implementadas con persistencia real en PostgreSQL y no deben reescribirse como mocks:

- `auth`
- `dashboard`
- `patients`
- `services`
- `appointments`
- `assistants`

Los mocks siguen existiendo solo como respaldo y referencia en `src/infrastructure/mock/`.

## Forma de trabajo obligatoria

1. Leer `AGENTS.md` antes de tocar arquitectura.
2. Leer `docs/ANDROID_STYLE_ARCHITECTURE.md`.
3. Leer este archivo.
4. Revisar `docs/AGENT_FILE_MAP.md` para ubicar las piezas actuales.
5. Trabajar issue por issue, sin mezclar features.
6. Mantener cambios pequenos y por responsabilidad.
7. Si el trabajo toca deploy o release, leer `docs/DEPLOY_NETLIFY.md` y `docs/DEPLOY_RELEASE_AGENT.md`.
8. Ejecutar validacion minima antes de cerrar:
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`

## Regla de implementacion por feature

Cuando se agregue o refactorice una feature, el flujo esperado es:

### Frontend

- `app/pages/...`
  - Screen delgada.
- `app/composables/...`
  - ViewModel/composable de pantalla.
- `src/presentation/view-models/...`
  - fabrica o constructor de Screen/ViewModel cuando aplique.
- `src/application/use-cases/...`
  - casos de uso por accion.
- `src/application/dto/...`
  - DTOs de entrada/salida.
- `src/application/ports/...`
  - puertos de aplicacion si la feature ya sigue el patron frontend actual.
- `src/domain/repositories/...`
  - contratos de dominio cuando aplique.
- `src/infrastructure/<feature>/remote/...`
  - llamadas HTTP o SDK.
- `src/infrastructure/<feature>/repositories/...`
  - implementacion concreta del repositorio.
- `src/infrastructure/<feature>/service-locator.ts`
  - wiring compartido del frontend.

### Backend

- `server/api/...`
  - endpoint delgado.
- `server/utils/authorization.ts`
  - validacion de permisos por accion.
- `server/utils/server-service-locator.ts`
  - wiring server-side compartido.
- `src/application/use-cases/...`
  - logica de negocio real.
- `src/infrastructure/repositories/...`
  - repositorios Drizzle.

## Que no debe hacer un agente

- No llamar `$fetch` directo desde `page` para ejecutar negocio.
- No llamar Better Auth directo desde una `page`.
- No usar Drizzle directo desde `server/api`.
- No meter reglas de permisos en componentes.
- No duplicar wiring de repositorios/use cases en varios endpoints.
- No mover el dominio hacia dependencias de Nuxt, Vue o Drizzle.
- No introducir mocks cuando ya existe infraestructura real.

## Implementaciones clave ya existentes

### Auth frontend

- Login y signup siguen estilo Android.
- Better Auth del cliente esta encapsulado en infraestructura.
- La UI no llama el SDK directamente.

### Auth server-side

- La resolucion de sesion ya esta separada en una mini-feature server auth.
- Los permisos por accion estan centralizados.
- `session-context` es la fuente de verdad para guards de navegacion.

### Dashboard

- Usa ViewModel + UseCases + repositorio remoto.
- Consume backend real para resumen y agenda del dia.

### Patients

- Persistencia real.
- Listado, detalle, creacion y edicion implementados.
- Sigue el flujo estilo Android.

### Services

- Persistencia real.
- Listado y creacion implementados.
- Edicion avanzada y filtros siguen pendientes.

### Appointments

- Persistencia real.
- Crear, editar, cancelar y cambiar estado implementados.
- Validacion de disponibilidad y colisiones incluida.

### Assistants

- Crear, editar, desvincular, reactivar y eliminar implementados.
- Los usuarios desactivados no deben operar como usuarios activos.

## Permisos actuales

### `admin_doctor`

- Puede gestionar asistentes.
- Puede gestionar servicios.
- Puede gestionar pacientes.
- Puede crear, editar, cancelar y cambiar estado de citas.
- Puede editar citas completadas.

### `assistant`

- Puede gestionar pacientes.
- Puede crear, editar, cancelar y cambiar estado de citas.
- Puede leer servicios.
- No puede gestionar asistentes.
- No puede escribir servicios.
- No puede acceder a configuraciones criticas.

## Patron de validacion para endpoints

Cada endpoint debe verse conceptualmente asi:

```ts
export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'patients:write')
    const payload = await readBody(event)
    const input = patientSchema.parse(payload)

    return await serverServiceLocator.patients.createPatientUseCase.execute({
      organizationId: session.organizationId,
      fullName: input.fullName,
      phone: input.phone,
    })
  } catch (error) {
    handleApiError(error)
  }
})
```

## Cuando actualizar documentacion

Actualizar documentacion cuando ocurra cualquiera de estos casos:

- se agrega una feature nueva
- se cambia un flujo arquitectonico
- se agrega o endurece permisos
- se agregan endpoints
- se cambia el wiring de service locators
- se cambia el contrato auth/session

## Comandos de documentacion

- `pnpm docs:update`
  - regenera el inventario tecnico de archivos por feature/capa
- `pnpm docs:inventory`
  - alias del inventario tecnico

## Flujo recomendado para otro agente

1. Leer `AGENTS.md`
2. Leer `docs/ANDROID_STYLE_ARCHITECTURE.md`
3. Leer `docs/AGENT_WORKFLOW.md`
4. Ejecutar `pnpm docs:update`
5. Revisar `docs/AGENT_FILE_MAP.md`
6. Implementar una sola feature
7. Si toca deploy, leer `docs/DEPLOY_NETLIFY.md` y `docs/DEPLOY_RELEASE_AGENT.md`
8. Ejecutar `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
9. Actualizar `docs/TASKS_AND_ISSUES.md` si cambia el estado
