# Plan: Pulido de requisitos MVP — OtoGyn webapp

## Contexto

Webapp médica multi-tenant (Nuxt 3 + Vue 3 + Nuxt UI v4 / Tailwind v4 CSS-first + Drizzle/PostgreSQL en Neon, desplegada en Netlify: https://otogyn.netlify.app). Andy pidió pulir 8 requisitos de UX/funcionalidad antes de seguir. Gestor de paquetes: **pnpm** (nunca npm).

**Arquitectura (clean, respetarla en cada feature):**
`app/pages/*` → `app/composables/*` → `src/presentation/view-models/*` (factory MVVM) → `src/application/use-cases/*` vía service-locators en `src/infrastructure/<feature>/service-locator` → repos Drizzle en `src/infrastructure/repositories/*`. Endpoints Nitro en `server/api/**` con validadores Zod en `src/presentation/validators/*` y `requireAuthorizedUser(event, '<perm>')` (endpoints públicos usan `enforcePublicRateLimit` de `server/utils/public-security.ts`).

**Patrón de referencia para búsqueda + paginación (replicar tal cual):** feature Pacientes —
- Página: `app/pages/patients/index.vue` (input search + paginación)
- VM: `src/presentation/view-models/patients/patients-list-view-model.ts` (`searchTerm` con watch + debounce 250ms, `page/pageSize/total/totalPages`, `goToPage`, reset a página 1 al buscar)
- Composable: `app/composables/patients/use-patients-list-view-model.ts`
- Endpoint: `server/api/patients/index.get.ts` con `patientListQuerySchema` (`search`, `filter`, `page` ≥1, `pageSize` máx 50)
- Repo: `src/infrastructure/repositories/drizzle-patient-repository.ts` (`ilike` + `count()` + `limit/offset`)

**Campos reales verificados en `src/infrastructure/database/schema/index.ts`:**
- `appointments`: `startAt`/`endAt` (timestamptz), `status` enum (scheduled, confirmed, checked_in, in_progress, completed, cancelled, no_show), `isUrgent`, `serviceId`, `cancelledAt`, `agreedPrice`, `createdBy` NOT NULL.
- `payments`: `concept`, `notes`, `patientId` (nullable), `paidAt`, índice único `payments_appointment_unique_idx` sobre appointmentId.
- `expenses`: `description`, `notes`, `categoryId` (→ `expenseCategories`), `expenseDate`.
- `doctorAvailability`: `weekday` (0-6), `startTime`/`endTime` varchar(5) HH:MM, `isActive`.
- `blockedTimeSlots`: `startsAt`/`endsAt` timestamptz, `reason`.

**Reglas del proyecto (memoria):** cargas autenticadas en `onMounted` (SSR $fetch pierde cookies → 401); si se crean migraciones Drizzle nuevas, el `when` del journal debe ser > 1783310592002 o se saltan silenciosamente.

**Orden de ejecución recomendado:** R5 → R1 → R4 → R2 → R3 → R7 → R8 → R6 (seed antes de estadísticas para validarlas con datos; dark mode al final por transversal).

---

## R1. Pre-evaluaciones: paginación — ✅ YA IMPLEMENTADO, sin trabajo

`app/pages/pre-evaluacion-forms/index.vue` ya tiene búsqueda (ilike sobre fullName/phone/email) + paginación completa vía `server/api/pre-evaluation-forms/index.get.ts` y `drizzle-pre-evaluation-form-repository.ts`. Solo verificar manualmente que funciona. No tocar.

## R5. Badge "Cancelada" en rojo (quick win, ~5 min)

- `app/components/appointments/appointment-list-item.vue`, computed `statusBadge` (~líneas 30-57): cambiar `cancelled` de tone `'neutral'` → `'danger'` (clases CSS `appointment-status-badge-danger` ya existen: bg `#fff0f3`, texto `#b4234d`).
- Buscar otros mapeos de estado (`grep -rn "cancelled" app/components app/pages`) — detalle de cita, dashboard — y aplicar el mismo tone para consistencia.
- Verificar: lista de citas con una cancelada muestra badge rojo.

## R4. Finanzas: buscador en payments y expenses

Ambas ya tienen paginación server-side (✅); falta búsqueda de texto.

1. Validators: añadir `search: z.string().trim().max(120).optional()` a `paymentListQuerySchema` y al schema de expenses (`src/presentation/validators/`).
2. `drizzle-payment-repository.ts` método `list`: si hay search, `leftJoin(patients, eq(payments.patientId, patients.id))` + `or(ilike(patients.fullName…), ilike(payments.concept…), ilike(payments.notes…))`. Aplicar el mismo where+join a la query de count; usar `countDistinct(payments.id)` por seguridad.
3. `drizzle-expense-repository.ts`: `or(ilike(expenses.description…), ilike(expenses.notes…))`, sin join.
4. Propagar `search` por los use-cases de listado y sus tipos de filtro (capa application).
5. VMs `src/presentation/view-models/finances/payments-list-view-model.ts` y `expenses-list-view-model.ts`: `searchTerm` + debounce 250ms + reset a página 1 (copiar de patients-list-view-model).
6. Páginas `app/pages/finances/payments/index.vue` y `expenses/index.vue`: input de búsqueda sobre la tabla.
7. Los composables de finanzas NO sincronizan con `route.query` (pacientes sí) — mantener así en esta pasada; no ampliar alcance.

Verificar: buscar por nombre de paciente en payments y por descripción en expenses; el total de páginas se recalcula.

## R2. /book (público): buscador + paginación de servicios

Hoy `app/pages/book.vue` carga TODOS los servicios (`GET server/api/public/services.get.ts`, sin params) y los renderiza sin filtro.

1. Nuevo `publicServiceListQuerySchema` en validators: `search`, `page`, `pageSize` (default ~12, máx 50).
2. `server/api/public/services.get.ts`: aceptar esos params, **añadir `enforcePublicRateLimit`** (hoy no lo tiene — usar el patrón de `slots.get.ts` con acción nueva tipo `'public-services'`), filtrar `isActive = true`, devolver `{ items, total }`.
3. Repo de servicios: método paginado con `ilike(services.name, …)`.
4. VM `src/presentation/view-models/booking/booking-screen.ts`: `serviceSearch` (debounce 250ms), `servicePage`, `serviceTotal`; re-fetch al cambiar. **Importante:** guardar el servicio seleccionado en estado propio, no derivado de la lista, para que no se pierda al buscar/paginar.
5. `app/composables/booking/use-booking-screen.ts` + `app/pages/book.vue`: input de búsqueda + paginación bajo el grid de servicios.

Verificar: /book en incógnito → buscar, paginar, completar una reserva end-to-end.

## R3. Disponibilidad: ver bloqueos futuros + rangos

Estado actual: `GET server/api/availability/index.get.ts` devuelve blockedSlots **solo del día actual**; `blockForm` acepta una sola fecha; el horario recurrente se crea de un weekday a la vez.

**a) Visualizar bloqueos futuros**
- Endpoint GET: cambiar la consulta de bloqueos a `endsAt >= now()` orden `startsAt asc` (límite ~100). Antes de cambiar el default, revisar qué otros consumidores usan este endpoint (calendario de citas); si alguno depende de "solo hoy", añadir query param `scope=upcoming|today` y que `/availability` pida `upcoming`.
- Página `app/pages/availability.vue` + VM: sección "Próximos bloqueos" (fecha, rango horario, motivo, botón eliminar — el DELETE `server/api/availability/blocked/[id].delete.ts` ya existe).

**b) Bloqueo por rango de fechas (endpoint bulk transaccional)**
- Nuevo `server/api/availability/blocked/bulk.post.ts` + `blockedSlotBulkMutationSchema`: `{ startDate, endDate, startTime, endTime, reason? }`; el servidor expande día a día (máx 31 días) aplicando startTime/endTime a cada día.
- Use-case nuevo `create-blocked-slots-bulk` + método `createMany` en el repo, dentro de `db.transaction`.
- VM `blockForm` (`src/presentation/view-models/availability/availability-view-model.ts`): fecha única → `startDate`/`endDate` (endDate opcional = mismo día). Simplificar llamando siempre al bulk.

**c) Horario recurrente multi-día**
- Extender el schema de `POST server/api/availability/index.post.ts` para aceptar `weekdays: number[]` (1-7 elementos, valores 0-6), con retrocompatibilidad vía `.transform` desde `weekday` singular, o crear `server/api/availability/bulk.post.ts`. Insertar en transacción.
- VM `form`: `weekday` → `weekdays[]`; UI: checkbox group L-D.
- En el use-case, evitar duplicados weekday+franja contra los existentes (o al menos no fallar la transacción completa).
- Sin migraciones (mismas tablas).

Verificar: crear horario L-M-V de una vez → 3 filas; bloqueo de 3 días → 3 bloqueos en "Próximos bloqueos"; los slots de /book excluyen esos días.

## R7. Seed masivo de datos

**⚠️ DECISIÓN DEL USUARIO: el seed corre contra la BD de producción/Neon (la misma de otogyn.netlify.app), datos fake mezclados con lo que exista.** Aún así: el flag `--reset` solo debe borrar datos de la organización demo del seed, jamás tocar otras organizaciones ni users ajenos.

1. `pnpm add -D @faker-js/faker`.
2. Reescribir `src/infrastructure/database/seed/index.ts` (script `pnpm db:seed` — hoy solo imprime JSON de `src/infrastructure/mock/demo-data`, no inserta). Usar el mismo cliente Drizzle de la app con `DATABASE_URL`.
3. `faker.seed(42)` (reproducible), inserts en lotes de 100-500. Idempotencia: si la org demo ya tiene >N pacientes, abortar salvo `--reset` (borra en orden inverso de FKs: statusHistory → payments → consultations → appointments → preEvaluationForms → expenses → blockedTimeSlots → doctorAvailability → services → patients; NO borra users/org).
4. Volumen (nombres/textos en español con faker/locale es):
   - 1 organización demo + user demo (necesario para `createdBy` NOT NULL) — reutilizar la org/user existente de Andy si el seed debe verse en su cuenta; **preguntar en runtime no es posible: por defecto usar la organización existente del usuario real para que los datos se vean en la app desplegada.**
   - ~10-15 services activos (precio, duración).
   - ~200 patients (~10% isUrgent).
   - Availability weekdays 1-5 con 2 franjas + ~15 blockedTimeSlots pasados/futuros.
   - ~1000 appointments en ±6 meses: pasadas 70% completed / 15% cancelled (con `cancelledAt`) / 10% no_show; futuras scheduled/confirmed; `startAt` en horario laboral, `endAt = startAt + duración`, `agreedPrice` del servicio.
   - Payments: 1 por cita completed (respetar índice único por appointmentId), `paidAt ≈ startAt`.
   - ~8 expenseCategories + ~300 expenses en 12 meses.
   - ~50 preEvaluationForms (leer campos reales del schema).
5. Sin migraciones nuevas ⇒ no aplica la regla del journal timestamp.

Verificar: `pnpm db:seed`, login en la app, revisar listados, dashboard, finanzas y estadísticas con volumen.

## R8. Sección de estadísticas de citas

Ya instalados: `chart.js` ^4.5 + `vue-chartjs` (patrón en `app/components/finances/finance-monthly-charts.client.vue`); precedente de agregación: `server/api/dashboard/summary.get.ts` (`getDashboardSummaryUseCase`).

1. Endpoint `server/api/appointments/stats.get.ts` + `appointmentStatsQuerySchema` (`range: week|month|year` + fechas from/to derivadas). Auth igual que dashboard summary.
2. Use-case `get-appointment-stats-use-case` + método(s) de agregación en `drizzle-appointment-repository.ts`, filtrando `organizationId` + `startAt` between:
   - Conteos por `status` (group by).
   - Serie mensual y semanal: `date_trunc('month'|'week', start_at)` con conteos por estado (usar `sql<string>` como el repo de finanzas).
   - Por servicio (join `services`, group by name).
   - Por día de semana (`extract(dow from start_at)`).
   - Urgentes (`isUrgent`), duración promedio (`avg(extract(epoch from end_at - start_at))/60`).
   - Tasa de cancelación derivada en el use-case (cancelled/total).
3. VM `src/presentation/view-models/statistics/appointment-stats-view-model.ts` + composable + página `app/pages/statistics/index.vue` (carga en `onMounted`; enlace en sidebar/navegación).
4. UI: tarjetas KPI (total, completadas, canceladas, no-show, % cancelación, urgentes, duración media) + gráficos en componente `.client.vue`: barras apiladas por mes/estado, doughnut por servicio, barras por día de semana. Selector semana/mes/año con re-fetch.

Verificar: con seed cargado, los totales cuadran con la lista de citas filtrada por los mismos criterios.

## R6. Tema oscuro (toda la app, incluida /book) — transversal, en sub-fases

Estado: NO existe. Tailwind v4 CSS-first vía `@nuxt/ui` v4.8.2 (sin tailwind.config.js); `app/assets/css/main.css` fija `color-scheme: light`; colores mayormente hardcodeados (`text-slate-900`, `bg-teal-700`, `#fff0f3`…) + CSS vars custom en `:root` (`--page-bg`, `--card-bg`, `--border-color`, `--shadow-soft`) usadas por `.surface-card`, `.muted-text`, `.pill`.

**6.1 Infraestructura (no rompe nada):**
- `main.css`: quitar `color-scheme: light` fijo; añadir bloque `.dark { … }` con variantes oscuras de las CSS vars (paleta slate-950/900/800); añadir tokens que falten (`--text-primary`, `--text-muted`).
- Nuxt UI v4 ya integra `@nuxtjs/color-mode` y `@custom-variant dark` → verificar que no esté deshabilitado en `nuxt.config.ts`; default `preference: 'light'`.
- Toggle sol/luna con `useColorMode()` en el topbar (layout `app/layouts/default.vue` o componente topbar).

**6.2 Superficies compartidas:** `.surface-card`/`.muted-text`/`.pill` funcionan gratis tras 6.1. Layout, sidebar, topbar: reemplazar hardcodeos por vars o variantes `dark:`.

**6.3 Pasada por dominios (un commit por grupo, app siempre usable en light):**
1) dashboard, 2) patients, 3) appointments + availability, 4) finanzas (**gráficos chart.js: definir colores desde JS leyendo `useColorMode()` y re-render al cambiar de modo**), 5) pre-evaluaciones + settings, 6) **/book y demás páginas públicas** (incluidas en el alcance por decisión del usuario — el paciente externo ve el modo de su dispositivo; usar `preference: 'system'` o exponer el toggle también ahí).
- Estrategia: preferir variantes `dark:` de Tailwind sobre inventar decenas de vars nuevas. Ejecutar `grep -rn "slate-900\|teal-700\|bg-white" app/` al iniciar para dimensionar (~30-45 archivos estimados).
- Riesgos: contraste de badges con hex hardcodeados (`#fff0f3` etc. necesitan variante dark), flash of wrong theme (color-mode lo maneja con script inline).

Verificar por sub-fase: alternar el toggle en cada página, revisar contraste de textos, badges y gráficos en ambos modos, y /book en modo oscuro del sistema.

---

## Verificación global

- `pnpm dev` local; probar cada flujo en el navegador (Andy verifica funcionalidad manualmente, pero cada agente debe verificar con el preview antes de entregar).
- Ejecutar la suite de tests existente tras cambios en repos/use-cases/validators y añadir tests para los nuevos (bulk de bloqueos, weekdays múltiples, search en payments/expenses, stats).
- Al final: seed corrido, estadísticas cuadran, dark mode sin regresiones en light.
