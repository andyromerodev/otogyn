# Plan: Autocompletar diagnósticos (CIE-11 OMS) + plantillas de plan de tratamiento

> **Documento para agentes de IA** (Claude, Codex, Gemini, DeepSeek, OpenCode, humanos…).
> Autocontenido: no depende de ninguna conversación previa. Léelo completo antes de ejecutar una subtarea.

## Objetivo

En la pantalla de atención clínica (wizard de consultas):

1. **Autocompletar diagnósticos** con la API oficial CIE-11 de la OMS (gratuita, respuesta en español), vía un proxy server-side.
2. **Plantillas de plan de tratamiento** propias de la clínica, sugeridas según el diagnóstico seleccionado, con CRUD completo. No existe base internacional gratuita de planes de tratamiento; las plantillas son datos propios en Postgres.

## Reglas para agentes

1. **Ejecuta UNA sola subtarea por sesión.** El objetivo es medir el consumo de tokens por subtarea.
2. Al terminar: corre la **verificación** de la subtarea, actualiza la **tabla de progreso** de este archivo (estado, agente, fecha, tokens aproximados de la sesión) y haz **un commit atómico** con el formato `feat(icd11): ST-N — <título corto>` (incluye este doc actualizado en el commit).
3. Respeta el orden de dependencias: ST-1 requiere ST-0; ST-3 requiere ST-2; ST-4 requiere ST-1; ST-5 requiere ST-3; ST-6 requiere ST-3; ST-7 requiere ST-4 y ST-5.
4. No refactorices código fuera del alcance de tu subtarea.
5. Si encuentras un bloqueo, documéntalo en la columna Notas y detente.

## Tabla de progreso

| Subtarea | Estado | Agente | Fecha | Tokens (aprox.) | Notas |
|---|---|---|---|---|---|
| ST-0 Credenciales OMS | Hecha | usuario | 2026-07-04 | n/a | |
| ST-1 Proxy CIE-11 | Hecha | Claude Fable 5 | 2026-07-04 | ~9k | nuxt.config + server/utils/who-icd-client.ts + server/api/icd11/search.get.ts |
| ST-2 Tabla treatment_templates | Pendiente | | | | |
| ST-3 Backend CRUD plantillas | Pendiente | | | | |
| ST-4 Autocomplete diagnóstico UI | Pendiente | | | | |
| ST-5 Plantillas en step-plan | Pendiente | | | | |
| ST-6 Tests | Pendiente | | | | |
| ST-7 Offline + E2E | Pendiente | | | | |

Estados: `Pendiente` → `En progreso` → `Hecha` (o `Bloqueada`).

## Contexto del proyecto

- **Stack**: Nuxt 3 (carpeta `app/`) + Nitro (`server/`) + Drizzle/Postgres, clean architecture en `src/` (application/dto, application/use-cases, infrastructure). Ver `docs/ARCHITECTURE.md` y `docs/AGENT_FILE_MAP.md`.
- **Patrón de capas**: ruta API (`server/api/...`) → `requireAuthorizedUser(event, 'scope')` → Zod parse → use case (`src/application/use-cases/...`) → repositorio (`src/infrastructure/...`) → `handleApiError(error)` en el catch. Ejemplos de referencia: `server/api/patients/index.get.ts` (GET con query) y `server/api/patients/index.post.ts` (POST con body).
- **Frontend**: las cargas de datos autenticadas van en `onMounted`/handlers con `$fetch` — **NO** usar `await useFetch(...)` en el setup (bloquea la navegación y rompe offline). Los view-models viven en `app/composables/<feature>/`.
- **Formulario de consulta**:
  - `app/components/consultations/step-diagnostico.vue` — diagnósticos `{ description, cie10Code, type }` (el campo `cie10Code` es texto libre hoy; guardará el código CIE-11 sin renombrarse).
  - `app/components/consultations/step-plan.vue` — `treatmentPlan` (textarea), `medications: ConsultationMedication[]` (`{ name, dose, route, frequency, duration, additionalInfo, isUsualMedication }`), `auxiliaryExams: string[]`.
  - Orquestador: `app/composables/consultations/use-consultation-wizard-view-model.ts`.
- **Patrón de picker con búsqueda**: `app/components/pre-evaluation-forms/patient-search-picker.vue` (input + debounce 300 ms en el padre + lista de resultados; sin USelectMenu).
- **Comandos**: `npm run typecheck`, `npm test` (unit + coverage), `npm run test:integration`, `npm run build`, `npm run db:generate`, `npm run db:migrate`.

### ⚠️ Advertencia crítica: migraciones Drizzle

El journal `src/infrastructure/database/migrations/meta/_journal.json` tiene timestamps **futuros**. La última migración es `0007_thankful_thunderball` con `when: 1783310592003`. Toda migración nueva **DEBE** tener un `when` **mayor** a ese valor, o Drizzle la salta silenciosamente. Después de `npm run db:generate`, edita el `when` de tu entrada nueva en el journal antes de `npm run db:migrate`.

---

## ST-0 (manual, usuario): Credenciales de la OMS

Sin código. Bloquea ST-1.

1. Registrarse en https://icd.who.int/icdapi ("Register" → API Access).
2. Obtener **Client ID** y **Client Secret**.
3. Agregar a `.env` local y a las variables de entorno de Netlify:
   ```
   WHO_ICD_CLIENT_ID=...
   WHO_ICD_CLIENT_SECRET=...
   ```

## ST-1: Proxy de búsqueda CIE-11

**Objetivo**: endpoint autenticado `GET /api/icd11/search?q=<término>` que devuelve `[{ code, title }]` en español.

**Archivos**:
- `nuxt.config.ts` — en `runtimeConfig` (sección **privada**, fuera de `public`): `whoIcdClientId: process.env.WHO_ICD_CLIENT_ID ?? ''`, `whoIcdClientSecret: process.env.WHO_ICD_CLIENT_SECRET ?? ''`.
- `server/utils/who-icd-client.ts` (nuevo):
  - Token OAuth2 client-credentials: POST `https://icdaccessmanagement.who.int/connect/token` con `grant_type=client_credentials`, `scope=icdapi_access` (form-urlencoded). Cachear el token en memoria de módulo y renovarlo solo cuando falten <5 min para expirar.
  - Búsqueda: GET `https://id.who.int/icd/release/11/2024-01/mms/search?q=<q>&flatResults=true&useFlexisearch=true` con headers `Authorization: Bearer <token>`, `Accept: application/json`, `Accept-Language: es`, `API-Version: v2`.
  - Mapear `destinationEntities` a `{ code: theCode, title }` limpiando los tags `<em class='found'>` que la OMS usa para resaltar coincidencias.
- `server/api/icd11/search.get.ts` (nuevo): patrón de `server/api/patients/index.get.ts` — `requireAuthorizedUser`, Zod query schema (`q: string().trim().min(2).max(100)`), llamar la utilidad, `handleApiError`. Si faltan las credenciales en runtimeConfig, responder 503 con mensaje claro.

**Criterios de aceptación**: con sesión activa, `/api/icd11/search?q=otitis` devuelve códigos CIE-11 con títulos en español; sin sesión devuelve 401; el token se reutiliza entre peticiones (un solo POST de token en logs para búsquedas consecutivas).

**Verificación**: `npm run typecheck` + prueba manual con el dev server.

## ST-2: Tabla `treatment_templates`

**Objetivo**: tabla Drizzle para plantillas de plan de tratamiento.

**Archivos**: `src/infrastructure/database/schema/index.ts` (patrón de `preEvaluationForms`):

```
treatment_templates:
  id uuid pk defaultRandom
  organization_id uuid FK organizations(id) onDelete cascade, notNull
  name text notNull
  diagnosis_code text (nullable)   -- código CIE-11 asociado
  diagnosis_label text (nullable)
  treatment_plan text notNull default ''
  medications jsonb notNull default '[]'   -- ConsultationMedication[]
  auxiliary_exams jsonb notNull default '[]' -- string[]
  created_at / updated_at (helper `timestamps` existente)
  index (organization_id, diagnosis_code)
```

**Pasos**: editar schema → `npm run db:generate` → **editar `_journal.json`: `when` > 1783310592003** (ver advertencia) → `npm run db:migrate`.

**Criterios de aceptación**: la migración 0008 se aplica (no se salta) y la tabla existe en la base.

**Verificación**: `npm run db:migrate` + `npm run typecheck`.

## ST-3: Backend CRUD de plantillas

**Objetivo**: listar/crear/eliminar plantillas vía API autenticada.

**Archivos** (seguir el layering de consultas/servicios existente):
- `src/application/dto/consultation.ts` — tipo `TreatmentTemplate` (+ input de creación).
- `src/application/use-cases/consultations/list-treatment-templates.ts`, `create-treatment-template.ts`, `delete-treatment-template.ts`.
- Repositorio: interfaz + implementación Drizzle en `src/infrastructure/consultations/` (patrón de los repositorios existentes del feature).
- Registrar en el service locator del servidor (donde están `serverServiceLocator.patients`, etc.).
- Rutas: `server/api/consultations/templates/index.get.ts` (filtro opcional `?diagnosisCode=`; siempre scoped a la organización del usuario), `index.post.ts` (Zod con sanitización de strings, límites de longitud — seguir el patrón de sanitización existente en los schemas Zod del proyecto), `[id].delete.ts`.

**Criterios de aceptación**: GET devuelve solo plantillas de la organización; POST valida y persiste; DELETE elimina por id + organización (no cross-org).

**Verificación**: `npm run typecheck` (tests de use cases llegan en ST-6, pero si es barato inclúyelos aquí).

## ST-4: Autocomplete de diagnóstico en la UI

**Objetivo**: al escribir el diagnóstico, sugerir resultados CIE-11 y autocompletar descripción + código.

**Archivos**:
- `app/components/consultations/diagnosis-search-picker.vue` (nuevo) — copiar el patrón de `app/components/pre-evaluation-forms/patient-search-picker.vue`: props `searchTerm/results/loading`, emits `update:searchTerm/select`.
- `app/components/consultations/step-diagnostico.vue` — integrar el picker por fila de diagnóstico; debounce 300 ms; llamar `$fetch('/api/icd11/search', { query: { q } })` desde el handler (nunca `await useFetch` en setup); al seleccionar, rellenar `description` y `cie10Code` con el código CIE-11. **Mantener la edición manual** de ambos campos como fallback (offline o término no encontrado).
- Manejar el error de red silenciosamente (sin romper el formulario; solo ocultar sugerencias).

**Criterios de aceptación**: escribir "otitis" muestra sugerencias en español; seleccionar llena código y descripción; sin red el formulario sigue funcionando en modo manual.

**Verificación**: `npm run typecheck` + prueba en preview (viewport móvil).

## ST-5: Plantillas en el paso de plan

**Objetivo**: aplicar y guardar plantillas desde `step-plan.vue`.

**Archivos**:
- `app/composables/consultations/use-treatment-templates-view-model.ts` (nuevo) — cargar plantillas (`$fetch` GET en onMounted/handler), `applyTemplate`, `saveAsTemplate` (POST), `deleteTemplate`.
- `app/components/consultations/step-plan.vue` + `app/composables/consultations/use-consultation-wizard-view-model.ts` — selector "Usar plantilla" arriba del plan: lista las plantillas de la organización **priorizando** las que coinciden con el `cie10Code` del paso de diagnóstico; al aplicar, rellena `treatmentPlan`, `medications` y `auxiliaryExams` (confirmar antes de sobrescribir contenido no vacío). Botón "Guardar como plantilla": pide nombre y hace POST con los valores actuales + código/label del primer diagnóstico.

**Criterios de aceptación**: aplicar plantilla rellena los tres campos; guardar crea la plantilla y aparece en la lista; las plantillas del diagnóstico actual aparecen primero.

**Verificación**: `npm run typecheck` + prueba en preview del flujo completo.

## ST-6: Tests

**Objetivo**: cobertura de la lógica nueva.

- Unit (patrón `src/application/use-cases/get-service-detail.test.ts`): use cases de plantillas con repositorio mockeado; `who-icd-client` con fetch mockeado (obtención de token, reuso, expiración, mapeo/limpieza de `<em>`).
- Integration (patrón `server/integration/admin-routes.integration.test.ts`): endpoints de templates (auth requerida, scoping por organización, CRUD feliz).

**Verificación**: `npm test` y `npm run test:integration` en verde (los 148 tests previos + los nuevos).

## ST-7: Pulido offline + verificación E2E

**Objetivo**: cache offline y cierre del feature.

- `nuxt.config.ts` → workbox `runtimeCaching`, regex del cache `api-read`: agregar `icd11/search` y `consultations/templates` a la allowlist de GET (búsquedas repetidas y plantillas disponibles offline).
- E2E en preview: consulta completa — buscar diagnóstico → autocompletar → aplicar plantilla → guardar consulta. `npm run build` en verde.
- Actualizar `docs/DATABASE_MODEL.md` con `treatment_templates` y marcar la tabla de progreso de este doc como cerrada.

**Verificación**: `npm run build` + flujo E2E manual.

---

## Notas de diseño (no cambiar sin razón)

- La llamada a la OMS es **siempre server-side**: la CSP de producción tiene `connect-src 'self'` y las credenciales nunca llegan al navegador.
- No se persisten datos de la OMS en Postgres (solo token en memoria); las plantillas sí son datos propios de la clínica.
- El campo `cie10Code` del modelo de consultas **conserva su nombre** aunque ahora guarde códigos CIE-11 — renombrarlo tocaría el modelo/migraciones de consultas y no aporta valor funcional.
