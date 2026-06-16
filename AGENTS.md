# OtoGyn MVP Engineering Guide

## Proyecto

Web app MVP para gestionar citas, pacientes, servicios y reservas de una doctora otorrinolaringologa. El sistema tendra una doctora administradora, asistentes con permisos limitados y una reserva publica controlada.

## Stack tecnico

- Nuxt 4
- TypeScript estricto
- pnpm
- Nuxt Server API
- Nuxt UI
- Neon PostgreSQL
- Better Auth
- Drizzle ORM + Drizzle Kit
- Zod
- Vitest

## Reglas de arquitectura

- Se aplica Clean Architecture en cuatro capas: `domain`, `application`, `infrastructure`, `presentation`.
- La direccion de dependencias siempre apunta hacia adentro.
- El patron obligatorio por feature debe parecerse al de Android: `Screen/Page -> ViewModel/Composable -> UseCase -> Repository -> RemoteDataSource`.
- Ninguna `page` o componente de feature debe llamar `$fetch`, `useFetch`, Better Auth o Drizzle directamente para ejecutar casos de uso de negocio.
- La `Screen/Page` solo renderiza estado, emite eventos de UI y delega al `ViewModel/Composable`.
- El `ViewModel/Composable` coordina estado de pantalla, mensajes y navegacion. No contiene acceso HTTP ni SQL directo.
- Los `UseCase` solo dependen de contratos y modelos del proyecto. No conocen Nuxt, Vue, H3, Better Auth ni Drizzle.
- Los `Repository` son interfaces del dominio o aplicacion. Las implementaciones concretas viven en `infrastructure`.
- Los `RemoteDataSource` encapsulan llamadas HTTP, auth client u otros SDKs remotos. Nunca se consumen desde `page` directamente.
- El wiring de instancias compartidas debe resolverse via `ServiceLocator` o fabrica central, evitando reconstruir repositorios y data sources en cada pantalla.
- `src/domain` no puede depender de Nuxt, Vue, Drizzle, Neon, Better Auth ni librerias de UI.
- `src/application` solo puede depender de `domain` y de abstracciones.
- `src/infrastructure` implementa repositorios, adaptadores, auth, persistencia y mappers.
- `app/` y `server/` son la capa de entrega. No contienen reglas de negocio complejas.
- Los casos de uso dependen de interfaces, nunca de implementaciones concretas.
- Los componentes Vue/Nuxt solo coordinan estado de presentacion y eventos.

## Reglas SOLID

- Una clase o modulo resuelve una sola responsabilidad.
- Las extensiones deben ocurrir agregando adaptadores o casos de uso, no editando el dominio para cada integracion.
- Las interfaces deben ser pequenas y enfocadas.
- Los consumidores dependen de contratos, no de detalles.
- Las abstracciones del dominio deben poder probarse sin Nuxt ni base de datos.

## Seguridad y privacidad

- Nunca subir `.env` ni imprimir `DATABASE_URL`, `AUTH_SECRET` o tokens.
- No hardcodear secretos ni credenciales.
- No registrar datos personales o medicos completos en logs.
- El MVP no guarda historia clinica completa ni diagnosticos sensibles.
- Solo guardar datos administrativos minimos y motivo breve de consulta si es necesario.
- Todas las rutas server-side deben validar sesion y rol antes de operaciones protegidas.
- El frontend nunca es fuente de verdad para permisos.

## Convenciones de carpetas

- `app/`: paginas, layouts, componentes y composables de presentacion.
- `server/api/`: endpoints HTTP.
- `server/utils/`: adaptadores para auth, errores y wiring del runtime.
- `src/domain/`: entidades, value objects, errores y contratos.
- `src/application/`: casos de uso, DTOs y puertos.
- `src/infrastructure/`: Drizzle, auth, repositorios concretos, mock data y mappers.
- `src/presentation/`: view models y validadores compartidos.
- Estructura recomendada por feature:
  - `app/pages/<feature>/...` para Screens.
  - `app/composables/<feature>/...` para ViewModels/Composables de pantalla.
  - `src/application/use-cases/<feature>/...` para UseCases.
  - `src/domain/repositories/...` para contratos de Repository.
  - `src/infrastructure/<feature>/remote/...` para RemoteDataSources.
  - `src/infrastructure/<feature>/repositories/...` o `src/infrastructure/repositories/...` para RepositoryImpl.
  - `src/infrastructure/<feature>/service-locator.ts` o locator central para wiring.
- `docs/`: documentacion funcional y tecnica.
- `.opencode/agents/`: definicion de subagentes especializados.

## Convenciones de nombres

- Archivos TypeScript en kebab-case.
- Entidades y casos de uso en PascalCase a nivel de simbolo.
- Interfaces de repositorio con nombres explicitos como `AppointmentRepository`.
- Componentes Vue con nombre compuesto y una responsabilidad clara.
- Evitar archivos gigantes. Dividir antes de superar una complejidad obvia.

## Comandos

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm db:generate
pnpm db:migrate
pnpm db:studio
pnpm db:seed
```

## Flujo de trabajo

- Trabajar issue por issue.
- Mantener commits pequenos y con una sola intencion.
- Documentar decisiones antes de introducir cambios estructurales grandes.
- No reemplazar ORM, auth o configuraciones existentes sin documentar el impacto y pedir confirmacion si afecta trabajo previo del usuario.
- Si una integracion real no esta lista, usar mocks separados en `src/infrastructure/mock/`.

## Reglas de implementacion

- Las validaciones de entrada viven en Zod dentro de `src/presentation/validators` o cerca del endpoint cuando sean especificas.
- Los endpoints convierten request a DTOs, invocan casos de uso y devuelven respuestas seguras.
- Drizzle solo se usa del lado servidor.
- Los repositorios concretos de infraestructura son los unicos que conocen la base de datos.
- Los componentes nunca deben calcular reglas de negocio de agenda, choques o permisos.
- Los modulos CRUD nuevos deben nacer ya con `Screen + ViewModel + UseCase + Repository + RemoteDataSource`.
- Las features existentes que aun llaman `fetch` directo desde la `page` quedan marcadas para refactor progresivo hasta cumplir el patron Android-like.
- Cuando exista consumo HTTP desde frontend, este debe vivir en `RemoteDataSource`.
- Cuando exista acceso a base de datos desde backend, este debe vivir en `RepositoryImpl` de infraestructura.
- La navegacion y mensajes de exito/error se resuelven en `ViewModel/Composable`, no en los `UseCase`.
- Si hace falta compartir instancias entre pantallas, usar `ServiceLocator` en vez de reinstanciar manualmente en multiples archivos.
