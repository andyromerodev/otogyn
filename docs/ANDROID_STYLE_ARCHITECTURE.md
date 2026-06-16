# Android-Style Architecture For Nuxt

## Objetivo

Este proyecto adopta una estructura inspirada en Android Clean Architecture para que cada feature sea facil de entender, testear y extender siguiendo el flujo mental:

`Screen/Page -> ViewModel/Composable -> UseCase -> Repository -> RemoteDataSource`

La meta es que trabajar en Nuxt se sienta lo mas parecido posible a trabajar con `Screen -> ViewModel -> UseCase -> Repository -> RemoteDataSource` en Android.

## Equivalencia Android vs Nuxt

| Android | Nuxt / Web en este proyecto | Responsabilidad |
|---|---|---|
| Screen / Compose Screen | `app/pages/...` | Renderizar UI y delegar eventos |
| ViewModel | `app/composables/<feature>/use-...-screen.ts` o `src/presentation/view-models/...` | Estado de pantalla, loading, mensajes, navegacion |
| UseCase | `src/application/use-cases/...` | Regla de negocio reutilizable |
| Repository interface | `src/domain/repositories/...` | Contrato abstracto |
| RepositoryImpl | `src/infrastructure/.../repositories/...` | Orquestar data sources y mapear modelos |
| RemoteDataSource | `src/infrastructure/.../remote/...` | HTTP, Better Auth client, SDKs, APIs |
| LocalDataSource | `src/infrastructure/.../local/...` | Cache, storage, fuentes locales si aparecen |
| DI / Koin module | `ServiceLocator` o fabrica central | Construir y compartir dependencias |

## Regla obligatoria por feature

Toda feature nueva debe seguir este flujo:

1. La `Page/Screen` no conoce detalles de datos.
2. La `Page/Screen` usa un `ViewModel/Composable`.
3. El `ViewModel/Composable` invoca `UseCases`.
4. Los `UseCases` dependen de interfaces `Repository`.
5. `RepositoryImpl` usa uno o mas `RemoteDataSource` o `LocalDataSource`.
6. Ninguna capa interna depende de Nuxt UI, Vue components, Drizzle o Better Auth.

## Reglas estrictas

- Una `page` no debe llamar `$fetch` directo para ejecutar un caso de negocio.
- Un `ViewModel/Composable` no debe llamar Drizzle, Better Auth ni SQL.
- Un `UseCase` no debe conocer `navigateTo`, `useRoute`, `useFetch`, `H3Event` ni `createError`.
- `Repository` define el contrato; `RepositoryImpl` resuelve la fuente real.
- `RemoteDataSource` traduce requests/responses externas a modelos internos del proyecto.
- La navegacion se resuelve en la capa de `ViewModel/Composable`.
- Los mensajes de UI se resuelven en la capa de `ViewModel/Composable`.
- Los errores de dominio deben entrar a la UI como mensajes controlados.

## Estructura recomendada por feature

```txt
app/
  pages/
    login.vue
    signup.vue
    patients/
      index.vue
  composables/
    auth/
      use-login-screen.ts
      use-signup-screen.ts
    patients/
      use-patients-screen.ts

src/
  application/
    use-cases/
      auth/
        sign-in.ts
        sign-up.ts
      patients/
        list-patients.ts
        create-patient.ts

  domain/
    repositories/
      auth-repository.ts
      patient-repository.ts

  infrastructure/
    auth/
      remote/
        better-auth-remote-data-source.ts
      repositories/
        better-auth-repository.ts
      service-locator.ts
    patients/
      remote/
        patient-remote-data-source.ts
      repositories/
        patient-repository-impl.ts
      service-locator.ts

  presentation/
    view-models/
      auth/
      patients/
```

## Patrón de Screen

La `Screen/Page` debe ser delgada.

Responsabilidades:
- componer layout
- bindear props y eventos
- invocar el `ViewModel/Composable`

No debe:
- construir repositorios
- llamar `$fetch` directamente
- traducir DTOs externos
- contener reglas de negocio

## Patrón de ViewModel / Composable

El `ViewModel/Composable` es el equivalente directo al `ViewModel` de Android.

Responsabilidades:
- estado del formulario
- loading
- error message
- success message
- efectos de navegacion
- invocar `UseCases`

No debe:
- conocer Drizzle
- conocer Better Auth internamente
- contener SQL
- depender de componentes visuales concretos

## Patrón de UseCase

Los `UseCases` son puros respecto al framework.

Responsabilidades:
- validar reglas del negocio
- coordinar contratos
- devolver resultado tipado

No debe:
- devolver respuestas HTTP
- lanzar errores de UI
- hacer navegacion
- depender de Nuxt

## Patrón de Repository

`Repository` es contrato.

Ejemplo:

```ts
export interface PatientRepository {
  listPatients(): Promise<Patient[]>
  createPatient(input: CreatePatientInput): Promise<Patient>
}
```

`RepositoryImpl` orquesta data sources:

```ts
export class PatientRepositoryImpl implements PatientRepository {
  constructor(
    private readonly remoteDataSource: PatientRemoteDataSource,
  ) {}

  listPatients() {
    return this.remoteDataSource.listPatients()
  }

  createPatient(input: CreatePatientInput) {
    return this.remoteDataSource.createPatient(input)
  }
}
```

## Patrón de RemoteDataSource

El `RemoteDataSource` encapsula toda llamada externa.

Ejemplos:
- `BetterAuthRemoteDataSource`
- `PatientRemoteDataSource`
- `AppointmentRemoteDataSource`

Responsabilidades:
- llamar HTTP o SDK
- mapear request/response
- aislar detalles externos del resto del sistema

## Service Locator

Para este proyecto se prefiere un `ServiceLocator` simple sobre reconstruir instancias en muchos archivos.

Objetivo:
- centralizar wiring
- facilitar testing
- mantener el codigo parecido a un modulo DI ligero

Ejemplo conceptual:

```ts
const patientRemoteDataSource = new PatientRemoteDataSource()
const patientRepository = new PatientRepositoryImpl(patientRemoteDataSource)

export const patientServiceLocator = {
  listPatientsUseCase: new ListPatientsUseCase(patientRepository),
  createPatientUseCase: new CreatePatientUseCase(patientRepository),
}
```

La `Screen` o el `ViewModel/Composable` consumen el locator, no las implementaciones concretas.

## Backend y Server API

En backend mantenemos Clean Architecture tambien, pero con esta traduccion:

`Route Handler -> UseCase -> Repository -> Drizzle`

Reglas:
- `server/api` actua como controller/entrypoint
- valida request
- obtiene session/role
- invoca `UseCase`
- responde JSON seguro

Drizzle solo debe aparecer en infraestructura del servidor.

## Estado actual del repo

### Ya bastante alineado

- `auth`
- contratos de dominio
- use cases backend
- repositories concretos con Drizzle

### Aun por refactorizar para quedar 100% Android-like

- `patients` frontend
- `services` frontend
- `appointments` frontend

Actualmente esas features aun tienen partes donde la `page` consume endpoints directamente. Eso debe migrar a:

`Page -> ViewModel -> UseCase -> Repository -> RemoteDataSource`

## Checklist para toda feature nueva

- Existe `Screen/Page`
- Existe `ViewModel/Composable`
- Existe `UseCase`
- Existe `Repository` interface
- Existe `RepositoryImpl`
- Existe `RemoteDataSource` si hay HTTP/SDK
- No hay `$fetch` directo en la `page`
- No hay reglas de negocio en componentes
- No hay dependencias de framework dentro del dominio
- Los errores de UI se resuelven arriba, no dentro del dominio

## Orden de refactor recomendado

1. `patients`
2. `services`
3. `appointments`
4. permisos y settings
5. reserva publica
