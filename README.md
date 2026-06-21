# OtoGyn Web App MVP

MVP para gestion de citas, pacientes, servicios y reservas de una doctora otorrinolaringologa. La base actual prioriza arquitectura limpia, privacidad de datos y una transicion controlada desde mock data hacia Neon PostgreSQL con Better Auth y Drizzle.

## Forma de trabajo

Este repositorio se organiza por **modulos** grandes de producto, por ejemplo:

- `Modulo E3: Auth y roles`
- `Modulo E5: Pacientes`
- `Modulo E6: Citas`

Cada modulo se divide en tareas o issues mas pequenos.

El patron obligatorio de implementacion es:

- frontend: `Screen/Page -> ViewModel/Composable -> UseCase -> Repository -> RemoteDataSource`
- backend: `API Route -> Authorization/Validation -> UseCase -> Repository`

Antes de continuar trabajo con otros agentes:

```bash
pnpm docs:update
```

Luego revisar:

- `AGENTS.md`
- `docs/ANDROID_STYLE_ARCHITECTURE.md`
- `docs/AGENT_WORKFLOW.md`
- `docs/AGENT_FILE_MAP.md`

## Stack

- Nuxt 4 + TypeScript
- pnpm
- Nuxt UI
- Nuxt Server API
- Neon PostgreSQL
- Better Auth
- Drizzle ORM + Drizzle Kit
- Zod
- Vitest

## Instalacion

```bash
pnpm install
pnpm dev
```

## Variables de entorno

Crear `.env` local con:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
AUTH_SECRET="change-me"
AUTH_URL="http://localhost:3000"
```

- No subir `.env`.
- No imprimir `DATABASE_URL`.
- No usar credenciales reales en el repositorio.

## Comandos

```bash
pnpm dev
pnpm build
pnpm netlify:dev
pnpm netlify:init
pnpm netlify:link
pnpm lint
pnpm test
pnpm typecheck
pnpm db:generate
pnpm db:migrate
pnpm db:studio
pnpm db:seed
pnpm docs:update
```

## Estructura

```txt
app/
server/
src/
  domain/
  application/
  infrastructure/
  presentation/
docs/
.opencode/agents/
```

## Drizzle y Neon

- `drizzle.config.ts` toma `DATABASE_URL` desde el entorno.
- El cliente de base de datos vive solo en `src/infrastructure/database/drizzle/client.ts`.
- El schema inicial esta en `src/infrastructure/database/schema/index.ts`.
- Antes de la primera migracion productiva hay que validar el contrato final de Better Auth contra las tablas auth.

## Auth

- Better Auth queda definido como stack base.
- Los permisos deben resolverse con `organization_members`.
- La sesion real server-side ya esta separada en una feature de auth con repositorio y use cases propios.
- `requireAuthorizedUser(event, action)` es la barrera principal para permisos en backend.

## Estado actual

- `auth` real implementado con Better Auth
- `dashboard` funcional
- `patients` con persistencia real
- `services` con persistencia real
- `appointments` con persistencia real
- `assistants` con gestion real y permisos base
- `pnpm docs:update` disponible para regenerar inventario tecnico para agentes

## Seed y demo data

- Dra. Ana Garcia
- Asistente demo
- Pacientes y servicios demo no reales
- Citas del dia para dashboard y agenda

## Testing

- Vitest cubre las reglas iniciales del dashboard y los choques de agenda.
- El flujo minimo recomendado antes de cerrar cambios es:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Roadmap MVP

1. Arquitectura base, docs y backlog
2. DB y auth reales
3. Dashboard y agenda
4. Pacientes y servicios
5. Citas, disponibilidad y reserva publica
6. Hardening y deploy

## Checklist antes de produccion

- Validar schema final de Better Auth
- Activar backups y politica de restauracion
- Endurecer permisos server-side
- Confirmar que no se guardan datos medicos sensibles
- Revisar logs, observabilidad y secretos

## Deploy en Netlify

Configuracion dejada en el repo:

- `netlify.toml`
- `netlify-cli` como dependencia de desarrollo

Pasos:

```bash
pnpm exec netlify login
pnpm netlify:init
```

O si el sitio ya existe:

```bash
pnpm netlify:link
```

Variables de entorno que debes configurar en Netlify:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `PNPM_FLAGS`

Notas importantes:

- `AUTH_URL` en Netlify debe apuntar al dominio real del sitio, por ejemplo `https://tu-sitio.netlify.app`.
- Para `pnpm`, Netlify necesita definir `PNPM_FLAGS` en la configuracion del sitio. No guardes su valor literal en el repositorio.
- El build configurado es `pnpm build` y el publish directory es `dist`, siguiendo la guia oficial de Nuxt/Nitro para Netlify.
