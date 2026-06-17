# Architecture

## Decisiones tecnicas

- `Neon PostgreSQL` por simplicidad operativa, ramas, Time Travel y encaje natural con un MVP serverless-friendly.
- `Drizzle ORM` por schema tipado, SQL cercano al dominio y baja friccion con PostgreSQL.
- `Nuxt Server API` como backend inicial para evitar dividir el producto demasiado pronto.
- `Better Auth` por composicion flexible y soporte de adaptadores para PostgreSQL/Drizzle.
- `Nuxt UI` para acelerar una base visual consistente sin introducir un design system pesado propio desde el dia uno.

## Aplicacion de Clean Architecture en Nuxt

- `domain`: reglas del negocio, entidades, value objects, errores y contratos.
- `application`: casos de uso, DTOs y coordinacion entre entidades y puertos.
- `infrastructure`: base de datos, auth, repositorios concretos, mock data, mappers y seeds.
- `presentation`: view models y validadores compartidos.
- `app/` y `server/`: capa de entrega web y HTTP.

## Reglas de dependencia

- `domain` no importa nada de `application`, `infrastructure`, `app` o `server`.
- `application` importa `domain`, nunca el framework.
- `infrastructure` puede importar `application` y `domain`.
- `app/` y `server/` solo usan `application`, `presentation` e infraestructura ya compuesta.

## Patrones

### Entidades

- Interfaces tipadas, pequenas y explicitas.
- Sin acoplamiento a ORM o framework.

### Casos de uso

- Una responsabilidad puntual por caso de uso.
- Entradas y salidas expresadas como DTOs.
- Reglas criticas validadas aqui, no en componentes.

### Repositorios

- Interfaces en el dominio.
- Implementaciones en `src/infrastructure/repositories` o `src/infrastructure/mock`.
- Permiten alternar entre Neon real y mock data sin tocar el caso de uso.

### Validaciones

- Zod en endpoints y capas de presentacion compartida.
- El dominio asume datos ya saneados, pero mantiene reglas de negocio criticas.

### Componentes

- Renderizan datos y eventos.
- No calculan permisos, choques de agenda ni reglas de negocio complejas.

## Manejo de errores

- Errores de negocio tipados en `src/domain/errors`.
- Los endpoints traducen esos errores a respuestas HTTP seguras.
- En produccion no se devuelven stack traces.

## Estado global

- Para el MVP, priorizar `useAsyncData`, props y composables ligeros.
- Evitar introducir Pinia hasta que exista una necesidad clara de estado compartido complejo.

## Auth y autorizacion

- `Better Auth` resuelve autenticacion y sesion.
- `organization_members` es la fuente de verdad para permisos y rol operativo.
- El frontend no infiere permisos desde formularios ni rutas por si solo.
- La resolucion server-side de sesion y permisos ya fue separada en una feature propia de auth:
  - DTOs en `src/application/dto/server-auth.ts`
  - Use cases en `src/application/use-cases/auth`
  - Repositorio server auth en `src/domain/repositories/server-auth-repository.ts`
  - Implementacion concreta en `src/infrastructure/auth/repositories/better-auth-server-repository.ts`
  - Wiring compartido en `src/infrastructure/auth/server-service-locator.ts`
- La UI protegida usa middleware de Nuxt:
  - `auth` para exigir sesion valida.
  - `admin` para exigir rol `admin_doctor`.
- El backend resuelve permisos con `requireAuthorizedUser(event, action)` y debe seguir siendo la barrera final para operaciones criticas.
- Los endpoints no deben instanciar repositorios o use cases manualmente; deben delegar a `server/utils/server-service-locator.ts`.

## Testing

- Vitest para casos de uso y reglas criticas.
- Las primeras pruebas cubren resumen del dashboard y conflictos de agenda.
- El objetivo inicial es proteger negocio, no maximizar cobertura superficial.

## Multi-tenant futuro

- `organizations` y `organization_members` preparan la expansion a clinicas o salones.
- En el MVP se usara una unica organizacion, pero todas las entidades clave conservan `organization_id`.
- El aislamiento futuro debera reforzarse con filtros, auth y politicas por organizacion.
