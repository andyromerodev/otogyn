# Plan de migración: Netlify → Cloudflare Workers

Objetivo: servir OtoGyn en `https://otogyn.tamayoclinic.com` desde Cloudflare Workers, en la misma cuenta donde ya vive `tamayoclinic.com`.

Estrategia: migrar el código, desplegar primero en `*.workers.dev` con el plan **Workers Free**, medir CPU y pasar a **Workers Paid ($5/mes)** solo si aparecen errores `1102` (CPU excedida) de forma consistente.

Netlify sigue en producción hasta el corte (Fase 6). Ambos builds conviven durante la migración.

---

## 1. Resumen de decisiones

| Tema | Hoy (Netlify) | Destino (Cloudflare) |
|---|---|---|
| Runtime | Nitro preset Netlify (autodetectado) | Nitro preset `cloudflare_module` + `nodejs_compat` |
| Base de datos | Neon vía `postgres` (singleton global) | Neon vía **Hyperdrive** (cliente por request, caché desactivada) |
| Adjuntos | Netlify Blobs + fallback a disco | **R2** (bucket `otogyn-attachments`) |
| Rate limit edge | Edge functions con `rateLimit` | **Workers Rate Limiting binding** |
| Rate limit app | Tabla `public_rate_limits` | Se mantiene igual |
| Secrets | Variables de Netlify | `wrangler secret put` / variables del Worker |
| Dominio | `*.netlify.app` | Custom Domain `otogyn.tamayoclinic.com` |
| Deploy | Netlify Git | `wrangler deploy` (luego Workers Builds opcional) |

## 2. Límites relevantes (verificados en docs oficiales, oct 2026)

| Recurso | Workers Free | Workers Paid |
|---|---|---|
| CPU por request | **10 ms** | 30 s por defecto (hasta 5 min) |
| Requests | 100.000/día | 10M/mes incluidos |
| Hyperdrive | 100.000 queries/día | Ilimitado |
| R2 | 10 GB, 1M ops clase A, 10M clase B al mes | Igual + pago por uso |
| Rate Limiting binding | Disponible | Disponible |
| Body de request | 100 MB (plan Free de la zona) | Igual |

Riesgo conocido: las docs indican que auth + SSR suelen consumir **10–20 ms de CPU**. El login usa `scrypt` (Better Auth, `hashPassword` de `better-auth/crypto`), probablemente en JS puro dentro de Workers. Es el candidato principal a provocar `1102` en Free.

Pages no evita este límite: las Pages Functions se facturan como Workers con los mismos límites.

---

## 3. Inventario de cambios (hallazgos del código)

### 3.1 Bloqueantes

1. **Cliente de base de datos global.**
   `src/infrastructure/database/drizzle/client.ts` guarda `dbInstance` a nivel de módulo, con `prepare: false`.
   `server/utils/server-service-locator.ts` construye los 13 repositorios, los adapters y los use cases al importar el módulo. `getBetterAuth()` también retiene la misma conexión.
   En Workers, reutilizar una conexión entre requests produce `Cannot perform I/O on behalf of a different request`.
2. **Adjuntos en Netlify Blobs con fallback a disco.**
   `src/infrastructure/storage/netlify-blobs-attachment-storage.ts` usa `@netlify/blobs` y, si falla, escribe en `.data/blobs` con `node:fs`.
   En Workers eso **pierde datos en silencio**: la subida devuelve una key pero el archivo no queda guardado.
3. **Rate limit en edge functions de Netlify.**
   Los archivos de `netlify/edge-functions/*` no existen en Cloudflare.

### 3.2 Ajustes necesarios

4. **Valores fijados en build** (`nuxt.config.ts`): `public.authEnabled`, `public.authBaseURL`, `whoIcdClientId` y `whoIcdClientSecret` se calculan con `process.env` al compilar. Hay que sobrescribirlos en runtime con `NUXT_PUBLIC_AUTH_ENABLED`, `NUXT_PUBLIC_AUTH_BASE_URL`, `NUXT_WHO_ICD_CLIENT_ID` y `NUXT_WHO_ICD_CLIENT_SECRET`.
5. **Email "fire-and-forget".** `create-pre-evaluation-form.ts` envía con Resend sin `await`. En Workers la promesa se cancela al responder, así que hay que registrarla con `waitUntil`.
6. **IP del cliente.** `public-security.ts` prioriza `x-forwarded-for`. En Cloudflare el header confiable es `cf-connecting-ip`.
7. **Headers de assets estáticos.** Workers Assets sirve `/sw.js` y `/manifest.webmanifest` sin pasar por Nitro, así que los `routeRules` no aplican. Se necesita `public/_headers`.
8. **`process.env`.** Con `nodejs_compat` y `compatibility_date` ≥ 2025-04-01, `process.env` se llena con vars y secrets. Las lecturas actuales siguen funcionando.

### 3.3 Sin cambios

- `node:crypto` y `Buffer` en `public-security.ts` funcionan con `nodejs_compat`.
- WHO ICD (fetch, token cacheado por isolate) y el SDK de Resend (usa fetch).
- Uploads de hasta 8 MB con `readMultipartFormData`: entran en los 128 MB de memoria.
- No hay timers ni top-level await en el servidor.

---

## 4. Fases

### Fase 0 — Preparación (sin código)

- [ ] Crear la rama `feat/cloudflare-workers`.
- [ ] Instalar `wrangler` como devDependency y hacer login con la cuenta de Cloudflare de `tamayoclinic.com`.
- [ ] Inventariar Netlify Blobs: cantidad de objetos y tamaño total por store (`pre-evaluation-attachments` y `consultation-attachments`).
- [ ] En Neon, crear una **rama de staging** (copia de producción) para las pruebas, así no se tocan datos de pacientes.
- [ ] Obtener de Neon el connection string **directo (no pooler)** para Hyperdrive, tanto de staging como de producción.
- [ ] Crear los recursos de staging:

```bash
pnpm exec wrangler hyperdrive create otogyn-db-staging --connection-string="<neon-staging-direct>" --caching-disabled
```

```bash
pnpm exec wrangler r2 bucket create otogyn-attachments-staging
```

`--caching-disabled` es intencional: Hyperdrive **no invalida su caché al escribir**. Sin ese flag, una cita recién creada podría no aparecer hasta 60 s después. En una app clínica con sesiones y agenda, la lectura fresca es obligatoria.

### Fase 1 — Build para Workers (en paralelo a Netlify)

- [ ] Agregar `wrangler.jsonc` en la raíz (borrador; validar rutas de salida con la doc de Nitro 2.13):

```jsonc
{
  "name": "otogyn",
  "main": "./.output/server/index.mjs",
  "assets": { "directory": "./.output/public", "binding": "ASSETS" },
  "compatibility_date": "2026-10-17",
  "compatibility_flags": ["nodejs_compat"],
  "workers_dev": true,
  "observability": { "enabled": true },
  "hyperdrive": [{ "binding": "HYPERDRIVE", "id": "<id-staging>" }],
  "r2_buckets": [{ "binding": "ATTACHMENTS", "bucket_name": "otogyn-attachments-staging" }],
  "ratelimits": [
    { "name": "PUBLIC_GET_LIMITER", "namespace_id": "1001", "simple": { "limit": 45, "period": 60 } },
    { "name": "PUBLIC_POST_LIMITER", "namespace_id": "1002", "simple": { "limit": 6, "period": 60 } }
  ]
}
```

- [ ] Agregar scripts en `package.json`, sin tocar el build de Netlify:
  - `build:cf`: `NITRO_PRESET=cloudflare_module nuxt build`
  - `preview:cf`: `pnpm build:cf && wrangler dev`
  - `deploy:cf`: `pnpm build:cf && wrangler deploy`
- [ ] Verificar el tamaño del bundle con `wrangler deploy --dry-run` y el tiempo de arranque (`startup_time_ms` < 1 s).
- [ ] Desarrollo local: Hyperdrive usa `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` como variable de entorno. **Nunca** poner `localConnectionString` con credenciales dentro de `wrangler.jsonc`.

### Fase 2 — Cambios de código

Orden sugerido: un commit atómico por punto.

**2.1 Composición por request (resuelve el bloqueante 1)**

- [ ] `client.ts`: reemplazar el singleton por la factory `createDrizzleClient(connectionString)` con `prepare: true` y `max: 5`. Hyperdrive desaconseja `prepare: false` con Postgres.js porque puede colgar queries.
- [ ] Resolver el connection string por request: `event.context.cloudflare?.env?.HYPERDRIVE?.connectionString ?? process.env.DATABASE_URL`. El fallback permite que `nuxt dev`, los tests y drizzle-kit sigan funcionando en Node.
- [ ] `server-service-locator.ts`: convertirlo en `createServerServices(deps)` y cachear el contenedor en `event.context` (un contenedor por request).
- [ ] Para no tocar los **86 archivos** que importan `serverServiceLocator`, mantener el mismo objeto exportado, pero con getters que resuelven el contenedor del request actual vía `useEvent()` (`nitro.experimental.asyncContext: true`, que usa `AsyncLocalStorage`, disponible con `nodejs_compat`).
  - Alternativa explícita: cambiar las 86 rutas a `useServerServices(event)`. Es más claro, pero el diff es enorme. Recomendado: getters + async context.
- [ ] `better-auth.ts`: crear la instancia de Better Auth por request (o cacheada en `event.context`) con el cliente de ese request.
- [ ] Cerrar la conexión al terminar el request con `event.waitUntil(...)` (verificar la API disponible en h3 v1 / Nitro 2.13).
- [ ] Tests: unit test del contenedor (dos requests no comparten cliente) y correr la suite actual de vitest.

**2.2 Adjuntos en R2 (resuelve el bloqueante 2)**

- [ ] Nuevo adapter `src/infrastructure/storage/r2-attachment-storage.ts` que implementa `AttachmentStoragePort`:
  - Key en R2: `<store>/<key>`, por ejemplo `pre-evaluation-attachments/<uuid>.pdf`.
  - `contentType` en `httpMetadata`.
  - Si falla, **lanzar error** (sin fallback silencioso).
- [ ] Dejar el adapter de disco solo para desarrollo local en Node, seleccionado explícitamente y nunca como fallback.
- [ ] Tests unitarios con un bucket fake en memoria.

**2.3 Rate limiting (resuelve el bloqueante 3)**

- [ ] En `server/middleware/rate-limit.ts`, antes del limitador de base de datos, aplicar `PUBLIC_GET_LIMITER` y `PUBLIC_POST_LIMITER` a las mismas rutas `/api/public/*`, con key `ip:path`.
- [ ] `public-security.ts`: leer primero `cf-connecting-ip`.
- [ ] Nota: el binding cuenta por ubicación de Cloudflare y es eventualmente consistente. Para este caso de uso alcanza, y el limitador de base de datos sigue como segunda capa.

**2.4 Ajustes menores**

- [ ] Registrar el envío de email de pre-evaluación con `waitUntil`, mediante un puerto o desde la ruta.
- [ ] Mover a runtime los valores de build de `nuxt.config.ts` (ver 3.2.4).
- [ ] Agregar `public/_headers` con `Cache-Control` para `/sw.js` y `/manifest.webmanifest`, y headers de seguridad para los assets.

### Fase 3 — Deploy a `workers.dev` (plan Free, datos de staging)

- [ ] Cargar los secrets (uno por comando, `wrangler secret put <NOMBRE>`):
  - `AUTH_SECRET`
  - `AUTH_URL` = `https://otogyn.<subdominio>.workers.dev`
  - `PUBLIC_FORM_SECRET`
  - `RESEND_API_KEY`
  - `CLINIC_NOTIFICATION_EMAIL`
  - `RESEND_FROM_EMAIL`
  - `NUXT_PUBLIC_AUTH_ENABLED`
  - `NUXT_PUBLIC_AUTH_BASE_URL`
  - `NUXT_WHO_ICD_CLIENT_ID`
  - `NUXT_WHO_ICD_CLIENT_SECRET`
- [ ] Ejecutar `pnpm deploy:cf`.
- [ ] Usar un remitente o destinatario de prueba en Resend para no notificar a la clínica durante las pruebas.

### Fase 4 — Medición de CPU (decide Free o Paid)

- [ ] Recorrer este guion al menos 3 veces:
  1. Login y logout.
  2. Dashboard (SSR).
  3. Listado y detalle de pacientes.
  4. Calendario (mes, semana, día).
  5. Crear y editar una cita.
  6. Crear una consulta con adjunto PDF de 8 MB y descargarlo.
  7. Búsqueda CIE-11.
  8. Flujo público de reserva y pre-evaluación con upload.
- [ ] Revisar en el dashboard: Workers → otogyn → **Metrics** (CPU p50/p99) y **Errors → Exceeded CPU Time Limits**.
- [ ] Ver resultados en vivo con `wrangler tail` (outcome `exceededCpu`).
- [ ] **Criterio:** si alguna ruta da `1102` de forma consistente (no un pico aislado), activar **Workers Paid ($5/mes)**. No requiere cambios de código.
- [ ] Alternativa evaluada y **no recomendada**: cambiar `scrypt` por un hash más barato. Obliga a migrar los hashes existentes y baja el margen de seguridad para ahorrar $5/mes.

### Fase 5 — Migración de adjuntos (Netlify Blobs → R2)

- [ ] Script local `scripts/migrate-blobs-to-r2.ts`, ejecutado en Node:
  - Leer con `@netlify/blobs` (`getStore({ name, siteID, token })`, `list()`, `get()` con metadata).
  - Escribir en R2 con la API S3 (token de R2) usando la **misma key** `<store>/<key>`, para que las referencias en la base de datos sigan siendo válidas.
- [ ] Verificar que coincidan la cantidad de objetos y el tamaño por store.
- [ ] Ejecutar una copia completa antes del corte y una **copia delta** durante el corte, o congelar las subidas en esa ventana.
- [ ] Crear el bucket de producción `otogyn-attachments` con R2 y apuntar el binding a él.

### Fase 6 — Corte a `otogyn.tamayoclinic.com`

- [ ] Crear el Hyperdrive de producción (`--caching-disabled`) contra Neon producción y actualizar el `id` en `wrangler.jsonc`.
- [ ] Actualizar `AUTH_URL` y `NUXT_PUBLIC_AUTH_BASE_URL` a `https://otogyn.tamayoclinic.com`.
- [ ] Agregar el dominio en `wrangler.jsonc`. Cloudflare crea el DNS y el certificado; hoy no existe ningún registro `otogyn`, así que no hay conflicto.

```jsonc
"routes": [{ "pattern": "otogyn.tamayoclinic.com", "custom_domain": true }]
```

- [ ] Hacer la copia delta de blobs, `pnpm deploy:cf` y una prueba rápida con el guion de la Fase 4.
- [ ] En Netlify: redirect 301 de `*.netlify.app` al dominio nuevo. Mantener el sitio 1–2 semanas como respaldo.

Efectos esperados para quienes usan la app:
- Tendrán que **volver a iniciar sesión**: las cookies son por dominio.
- La **PWA instalada** desde `netlify.app` hay que reinstalarla desde el dominio nuevo.

Rollback: volver a usar la URL de Netlify. La base de datos Neon es la misma, pero los adjuntos subidos a R2 después del corte **no** estarán en Netlify Blobs. Por eso el rollback solo es razonable en las primeras horas.

### Fase 7 — Limpieza

- [ ] Eliminar `@netlify/blobs`, `netlify-cli`, `netlify.toml`, `netlify/edge-functions/`, el adapter de Netlify Blobs y los scripts `netlify:*`.
- [ ] Docs: reemplazar `DEPLOY_NETLIFY.md` por `DEPLOY_CLOUDFLARE.md`. Actualizar `README.md`, `DEPLOY_RELEASE_AGENT.md` y `.opencode/agents/deploy-release-manager.md`.
- [ ] Deploy continuo (opcional): conectar **Workers Builds** a GitHub. Los deploys no consumen créditos como en Netlify.
- [ ] Pasado el periodo de respaldo, quien administra la cuenta borra el sitio de Netlify y sus blobs. Es un borrado permanente.

---

## 5. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| `1102` en login u otras páginas SSR con el plan Free | Fase 4 mide antes del corte; pasar a Paid no requiere código |
| Lecturas viejas por la caché de Hyperdrive | Hyperdrive con `--caching-disabled` |
| Pérdida silenciosa de adjuntos | Adapter R2 sin fallback; migración con verificación de conteos |
| Conexiones compartidas entre requests | Contenedor por request + test que lo valida |
| Valores de build incorrectos en runtime | Overrides `NUXT_*` en las variables del Worker |
| Probar contra datos reales | Rama de Neon y bucket R2 de staging |
| Rollback después de subir adjuntos nuevos | Ventana corta de respaldo y copia delta planificada |

## 6. Costo estimado

- **Plan Free:** $0, si la Fase 4 no muestra `1102`.
- **Plan Paid:** $5/mes. Incluye 10M requests, 30M ms de CPU, Hyperdrive ilimitado y R2 dentro del free tier (10 GB).

## 7. Pendientes por verificar durante la implementación

- Rutas de salida exactas del preset `cloudflare_module` en Nitro 2.13 y si conviene que Nitro genere la config de wrangler.
- API de `waitUntil` disponible en h3 v1 para cerrar la conexión y enviar emails en segundo plano.
- Si el esquema usa columnas de tipo array (define si se puede usar `fetch_types: false`).
- Región de Neon, para evaluar `placement` del Worker cerca de la base de datos.
