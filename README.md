# OtoGyn Web App MVP

MVP para gestion de citas, pacientes, servicios y reservas de una doctora otorrinolaringologa. La base actual prioriza arquitectura limpia, privacidad de datos y una transicion controlada desde mock data hacia Neon PostgreSQL con Better Auth y Drizzle.

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
pnpm lint
pnpm test
pnpm db:generate
pnpm db:migrate
pnpm db:studio
pnpm db:seed
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
- La capa actual usa contexto mock mientras se conecta la sesion real server-side.

## Seed y demo data

- Dra. Ana Garcia
- Asistente demo
- Pacientes y servicios demo no reales
- Citas del dia para dashboard y agenda

## Testing

- Vitest cubre las reglas iniciales del dashboard y los choques de agenda.

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
