# Deploy en Netlify

## Objetivo

Este documento define el flujo oficial de deploy de OtoGyn en Netlify para agentes y humanos.

La app usa:

- Nuxt 4
- Nitro con preset `netlify`
- pnpm
- Better Auth
- Neon PostgreSQL

## Estado actual validado

El deploy ya fue validado con exito en:

- sitio: `otogyn`
- dominio principal: `https://otogyn.netlify.app`
- rama de trabajo validada: `feature/mvp-appointments-platform`

## Reglas obligatorias

- No subir `.env`.
- No imprimir `DATABASE_URL`, `AUTH_SECRET` ni tokens.
- No guardar valores literales de variables sensibles en `README.md`, `netlify.toml` ni otros archivos versionados.
- `PNPM_FLAGS` debe vivir solo en las variables del sitio de Netlify, no en el repositorio.
- Antes de deploy, confirmar que el commit ya fue `push` al remoto correcto.

## Archivos del repo relacionados con deploy

- `netlify.toml`
- `package.json`
- `README.md`

## Configuracion actual del repo

### `netlify.toml`

- build command: `pnpm build`
- publish directory: `dist`
- dev command local: `pnpm dev`

### `package.json`

Scripts utiles:

- `pnpm netlify:dev`
- `pnpm netlify:init`
- `pnpm netlify:link`

## Variables de entorno requeridas en Netlify

Configurar en `Site settings -> Environment variables`:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `PNPM_FLAGS`

### Reglas por variable

- `AUTH_URL` debe ser el dominio real del sitio en Netlify.
- Ejemplo correcto:
  - `https://otogyn.netlify.app`
- `AUTH_URL` no debe incluir `/api/auth`.
- Ejemplo incorrecto:
  - `https://otogyn.netlify.app/api/auth`
- `PNPM_FLAGS` no debe copiarse en documentacion versionada.

## Flujo correcto de primer deploy desde la web

1. Crear o seleccionar el sitio en Netlify.
2. Conectar el repo `andyromerodev/otogyn`.
3. Seleccionar la rama a desplegar.
4. Dejar estos valores:
   - `Base directory`: vacio
   - `Build command`: `pnpm run build`
   - `Publish directory`: `dist`
   - `Functions directory`: dejar default o vacio; Nitro lo resuelve en build
5. Crear las variables de entorno del sitio.
6. Lanzar el deploy.

## Flujo correcto desde CLI

### Login

```bash
pnpm exec netlify login
```

### Buscar sitio

```bash
pnpm exec netlify sites:search otogyn
pnpm exec netlify sites:list
```

### Enlazar carpeta local al sitio

```bash
pnpm exec netlify link --id <site-id>
```

### Ver estado del sitio

```bash
pnpm exec netlify status
```

### Consultar builds y deploys por API

```bash
pnpm exec netlify api listSiteBuilds --data '{"site_id":"<site-id>"}'
pnpm exec netlify api getSite --data '{"site_id":"<site-id>"}'
```

## Checklist antes de deploy

Ejecutar localmente:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Luego verificar:

- `git status` limpio o cambios conscientes
- commit realizado
- commit empujado a GitHub
- `AUTH_URL` correcto en Netlify
- variables sensibles solo en Netlify
- ningun secreto literal en repo

## Checklist despues de deploy

Validar en navegador:

- `/login`
- login real con Better Auth
- `/dashboard`
- `/patients`
- `/calendar`
- `/services`
- logout

Validar tambien:

- la sesion persiste
- las rutas protegidas responden
- no hay error `500` en llamadas server-side

## Errores ya vistos y como resolverlos

### 1. `ERR_PNPM_OUTDATED_LOCKFILE`

Causa:

- `package.json` cambio y `pnpm-lock.yaml` no estaba alineado o no se empujo.

Solucion:

```bash
pnpm install --lockfile-only --ignore-workspace
git add pnpm-lock.yaml package.json
git commit -m "chore(deploy): refresh pnpm lockfile"
git push origin <branch>
```

### 2. Secrets scanner detecta `PNPM_FLAGS`

Causa:

- el valor de `PNPM_FLAGS` aparecia en `README.md` o en `netlify.toml`.

Solucion:

- quitar el valor literal del repo
- dejar `PNPM_FLAGS` solo como variable configurada en Netlify

### 3. `No matching project found`

Causa:

- la carpeta local no estaba enlazada a un sitio existente.

Solucion:

```bash
pnpm exec netlify sites:search otogyn
pnpm exec netlify link --id <site-id>
```

### 4. El build pasa pero la app falla en runtime

Revisar:

- `AUTH_URL`
- `DATABASE_URL`
- tablas de Better Auth y Drizzle aplicadas
- migraciones ejecutadas en la base correcta

### 5. `500 Server Error` en `/login` con `Invalid base URL`

Causa observada:

- Better Auth en SSR puede fallar si el cliente frontend se inicializa con una `baseURL` absoluta incorrecta o si `AUTH_URL` incluye `/api/auth`.
- En este proyecto, el caso real validado en Netlify fue un `500` al abrir `/login` aunque `/api/auth/get-session` respondia bien.

Solucion validada:

- `AUTH_URL` en Netlify debe ser solo el origen:
  - `https://otogyn.netlify.app`
- El cliente frontend de Better Auth debe usar `basePath: '/api/auth'` y no depender de una `baseURL` absoluta para render SSR.

Archivos del fix aplicado:

- `src/infrastructure/auth/client/better-auth-client.ts`
- `app/utils/auth-client.ts`

Validacion posterior al fix:

- `GET /login` responde `200`
- `GET /` responde `302 -> /login` sin error
- `GET /api/auth/get-session` responde `200`

## Regla de ramas

- Para pruebas, puede desplegarse una rama de feature.
- Para produccion real, usar rama estable y proteger el flujo con validacion previa.
- No considerar un branch deploy como cierre final si no paso por checklist funcional.

## Recomendacion de release

- Mantener commits de deploy separados:
  - config de Netlify
  - lockfile
  - fixes de secrets scanning
- No mezclar cambios de negocio con fixes exclusivos de release si puede evitarse.

## Comandos utiles de soporte

```bash
git status
git log --oneline -5
pnpm exec netlify status
pnpm exec netlify sites:list
pnpm exec netlify api listSiteBuilds --data '{"site_id":"<site-id>"}'
```

## Fuente de verdad para agentes

Todo agente que toque deploy debe leer:

1. `AGENTS.md`
2. `docs/AGENT_WORKFLOW.md`
3. `docs/DEPLOY_NETLIFY.md`
4. `docs/DEPLOY_RELEASE_AGENT.md`
